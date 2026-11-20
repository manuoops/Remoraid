import { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react';
import Papa from 'papaparse';
import {
  AlertTriangle,
  ArrowDownWideNarrow,
  ArrowDown,
  ArrowUp,
  ArrowUpWideNarrow,
  Ban,
  ChartNoAxesColumnIncreasing,
  ChartPie,
  Check,
  ChevronDown,
  ClipboardCheck,
  Download,
  Fuel,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MunicipalityPoint } from './FuelMap';
import './App.css';
import './nav.css';

const FuelMap = lazy(() => import('./FuelMap'));

interface BombaData {
  MUNICIPIO: string;
  BAIRRO: string;
  PROPRIETARIO: string;
  DESCRICAO: string;
  MARCA: string;
  MODELO: string;
  NUMERO_INMETRO: string;
  NUMERO_SERIE: string;
  DATA_VERIFICACAO: string;
  RESULTADO: string;
  STATUS_CONSOLIDADO: string;
}

interface IndexedBomba extends BombaData {
  _status: Status;
  _year: number | null;
  _date: Date | null;
  _normalizedMunicipio: string;
  _auditSearch: string;
  _interdictionSearch: string;
}

type Status = 'Aprovado' | 'Reprovado' | 'Interditado' | 'Sem classificação';
type RegionChart = 'rates' | 'results' | 'municipalities';
type RankingSortKey = 'municipio' | 'total' | 'aprovacao' | 'reprovacao' | 'interdicao';
type SortDirection = 'asc' | 'desc';

interface RankingSort {
  key: RankingSortKey;
  direction: SortDirection;
}

const rankingSortOptions: { key: RankingSortKey; label: string }[] = [
  { key: 'municipio', label: 'Município' },
  { key: 'total', label: 'Bombas' },
  { key: 'aprovacao', label: 'Aprovação' },
  { key: 'reprovacao', label: 'Reprovação' },
  { key: 'interdicao', label: 'Interdição' },
];

const municipiosValeParaiba = [
  'Caçapava', 'Igaratá', 'Jacareí', 'Paraibuna', 'Santa Branca', 'São José dos Campos',
  'Campos do Jordão', 'Lagoinha', 'Natividade da Serra', 'Pindamonhangaba', 'Redenção da Serra',
  'Santo Antônio do Pinhal', 'São Bento do Sapucaí', 'São Luiz do Paraitinga', 'Taubaté', 'Tremembé',
  'Aparecida', 'Cachoeira Paulista', 'Canas', 'Cunha', 'Guaratinguetá', 'Lorena', 'Piquete', 'Potim', 'Roseira',
  'Arapeí', 'Areias', 'Bananal', 'Cruzeiro', 'Lavrinhas', 'Queluz', 'São José do Barreiro', 'Silveiras',
  'Caraguatatuba', 'Ilhabela', 'São Sebastião', 'Ubatuba',
];
const municipiosValeParaibaNormalizados = new Set(municipiosValeParaiba.map((nome) => nome.toLocaleUpperCase('pt-BR')));

const secoes = [
  { id: 'visao-geral', label: 'Resumo' },
  { id: 'mapa', label: 'Mapa' },
  { id: 'vale', label: 'Vale do Paraíba' },
  { id: 'interditadas', label: 'Interditadas' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'evolucao', label: 'Evolução' },
  { id: 'comparar', label: 'Comparar' },
  { id: 'dados', label: 'Dados' },
];

function prefereMenosMovimento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isIndexedBomba(record: BombaData): record is IndexedBomba {
  return '_status' in record;
}

function getStatus(record: BombaData): Status {
  if (isIndexedBomba(record)) return record._status;
  const value = `${record.STATUS_CONSOLIDADO || ''} ${record.RESULTADO || ''}`.toLocaleUpperCase('pt-BR');
  if (value.includes('INTERD')) return 'Interditado';
  if (value.includes('REPROV')) return 'Reprovado';
  if (value.includes('APROV')) return 'Aprovado';
  return 'Sem classificação';
}

function parseDate(value: string): Date | null {
  const match = value?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) return null;
  const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  const date = new Date(year, Number(match[2]) - 1, Number(match[1]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function percent(value: number, total: number) {
  return total ? `${((value / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%` : '0%';
}

function formatarNome(nome: string) {
  const pequenas = new Set(['de', 'da', 'do', 'das', 'dos']);
  return nome.toLocaleLowerCase('pt-BR').split(' ').map((palavra, indice) => (
    indice > 0 && pequenas.has(palavra) ? palavra : palavra.charAt(0).toLocaleUpperCase('pt-BR') + palavra.slice(1)
  )).join(' ');
}

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR');
}

function exportarCsv(registros: IndexedBomba[]) {
  const fields = [
    'MUNICIPIO',
    'BAIRRO',
    'PROPRIETARIO',
    'DESCRICAO',
    'MARCA',
    'MODELO',
    'NUMERO_INMETRO',
    'NUMERO_SERIE',
    'DATA_VERIFICACAO',
    'RESULTADO',
    'STATUS_CONSOLIDADO',
    'SITUACAO',
  ];
  const csv = Papa.unparse({
    fields,
    data: registros.map((item) => [
      item.MUNICIPIO,
      item.BAIRRO,
      item.PROPRIETARIO,
      item.DESCRICAO,
      item.MARCA,
      item.MODELO,
      item.NUMERO_INMETRO,
      item.NUMERO_SERIE,
      item.DATA_VERIFICACAO,
      item.RESULTADO,
      item.STATUS_CONSOLIDADO,
      item._status,
    ]),
  }, {
    delimiter: ';',
    newline: '\r\n',
    escapeFormulae: true,
  });
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dados-combustiveis-filtrados.csv';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const [data, setData] = useState<IndexedBomba[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isTransitionPending, startTransition] = useTransition();
  const [showUpdating, setShowUpdating] = useState(false);
  const [municipioFiltro, setMunicipioFiltro] = useState('');
  const [municipiosMapaSelecionados, setMunicipiosMapaSelecionados] = useState<string[]>([]);
  const [anoFiltro, setAnoFiltro] = useState('Todos');
  const [municipioComparacaoSelecionado, setMunicipioComparacaoSelecionado] = useState('');
  const [municipiosComparacao, setMunicipiosComparacao] = useState<string[]>([]);
  const [ordenacaoRanking, setOrdenacaoRanking] = useState<RankingSort[]>([
    { key: 'aprovacao', direction: 'desc' },
  ]);
  const [buscaRanking, setBuscaRanking] = useState('');
  const [buscaInterdicoes, setBuscaInterdicoes] = useState('');
  const [buscaAuditoria, setBuscaAuditoria] = useState('');
  const [interdicoesTodas, setInterdicoesTodas] = useState(false);
  const [mostrarSemDados, setMostrarSemDados] = useState(false);
  const [graficoRegional, setGraficoRegional] = useState<RegionChart>('rates');
  const [auditoriaExpandida, setAuditoriaExpandida] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [secaoAtiva, setSecaoAtiva] = useState('visao-geral');
  const [mostrarTopo, setMostrarTopo] = useState(false);
  const pageSize = 25;
  const municipioFiltroDiferido = useDeferredValue(municipioFiltro.toLocaleLowerCase('pt-BR'));
  const buscaRankingDiferida = useDeferredValue(buscaRanking.toLocaleLowerCase('pt-BR'));
  const buscaInterdicoesDiferida = useDeferredValue(buscaInterdicoes.toLocaleLowerCase('pt-BR'));
  const buscaAuditoriaDiferida = useDeferredValue(buscaAuditoria.toLocaleLowerCase('pt-BR'));
  const isFiltering = municipioFiltro.toLocaleLowerCase('pt-BR') !== municipioFiltroDiferido
    || buscaRanking.toLocaleLowerCase('pt-BR') !== buscaRankingDiferida
    || buscaInterdicoes.toLocaleLowerCase('pt-BR') !== buscaInterdicoesDiferida
    || buscaAuditoria.toLocaleLowerCase('pt-BR') !== buscaAuditoriaDiferida;
  const isUpdating = isTransitionPending || isFiltering;

  useEffect(() => {
    if (!isUpdating) {
      if (!showUpdating) return;
      const timer = window.setTimeout(() => setShowUpdating(false), 120);
      return () => window.clearTimeout(timer);
    }
    if (showUpdating) return;
    const timer = window.setTimeout(() => setShowUpdating(true), 160);
    return () => window.clearTimeout(timer);
  }, [isUpdating, showUpdating]);

  useEffect(() => {
    Papa.parse<BombaData>(new URL('/dados_bombas_tratados.csv', window.location.origin).href, {
      download: true,
      header: true,
      skipEmptyLines: true,
      worker: true,
      complete: (results) => {
        const rows = results.data.filter((row) => row.MUNICIPIO).map((row): IndexedBomba => {
          const date = parseDate(row.DATA_VERIFICACAO);
          const municipality = row.MUNICIPIO.trim();
          const searchText = `${row.MUNICIPIO} ${row.RESULTADO} ${row.STATUS_CONSOLIDADO} ${row.PROPRIETARIO} ${row.NUMERO_INMETRO}`.toLocaleLowerCase('pt-BR');
          const interdictionText = `${row.MUNICIPIO} ${row.PROPRIETARIO} ${row.MARCA} ${row.MODELO} ${row.NUMERO_INMETRO}`.toLocaleLowerCase('pt-BR');
          return {
            ...row,
            _status: getStatus(row),
            _year: date?.getFullYear() ?? null,
            _date: date,
            _normalizedMunicipio: municipality.toLocaleLowerCase('pt-BR'),
            _auditSearch: searchText,
            _interdictionSearch: interdictionText,
          };
        });
        setData(rows);
        setLoadError(results.errors.length ? 'A base foi carregada com avisos de leitura.' : '');
        setLoading(false);
      },
      error: () => {
        setLoadError('Não foi possível carregar o arquivo de dados.');
        setLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const elementos = secoes
      .map((secao) => document.getElementById(secao.id))
      .filter((el): el is HTMLElement => el !== null);
    const observador = new IntersectionObserver((entradas) => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setSecaoAtiva('dados');
        return;
      }
      const visivel = entradas
        .filter((entrada) => entrada.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visivel) setSecaoAtiva(visivel.target.id);
    }, { rootMargin: '-80px 0px -60% 0px' });
    elementos.forEach((el) => observador.observe(el));

    const aoRolar = () => {
      setMostrarTopo(window.scrollY > 600);
      const noFinal = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (noFinal) setSecaoAtiva('dados');
    };
    window.addEventListener('scroll', aoRolar, { passive: true });
    aoRolar();

    return () => {
      observador.disconnect();
      window.removeEventListener('scroll', aoRolar);
    };
  }, [loading]);

  function irParaSecao(id: string) {
    setSecaoAtiva(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: prefereMenosMovimento() ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  const selecionarMunicipiosNoMapa = useCallback((selected: string[]) => {
    setMunicipioFiltro('');
    startTransition(() => {
      setMunicipiosMapaSelecionados(selected);
      setPagina(0);
    });
  }, [startTransition]);

  const anos = useMemo(() => Array.from(new Set(data.map((item) => item._year).filter((year): year is number => year !== null)))
    .sort((a, b) => b - a), [data]);
  const municipiosMapaSet = useMemo(() => new Set(municipiosMapaSelecionados), [municipiosMapaSelecionados]);
  const municipiosBase = useMemo(() => data.filter((item) => {
    const municipioOk = item._normalizedMunicipio.includes(municipioFiltroDiferido);
    const anoOk = anoFiltro === 'Todos' || item._year === Number(anoFiltro);
    return municipioOk && anoOk;
  }), [data, municipioFiltroDiferido, anoFiltro]);
  const filtrados = useMemo(() => municipiosMapaSet.size
    ? municipiosBase.filter((item) => municipiosMapaSet.has(item.MUNICIPIO.trim()))
    : municipiosBase, [municipiosBase, municipiosMapaSet]);
  const mapaMunicipios = useMemo(() => {
    const grouped = new Map<string, MunicipalityPoint>();
    municipiosBase.forEach((item) => {
      const municipio = item.MUNICIPIO.trim();
      const grupo = grouped.get(municipio) ?? { municipio, total: 0, aprovados: 0, reprovados: 0, interditados: 0 };
      grupo.total += 1;
      if (item._status === 'Aprovado') grupo.aprovados += 1;
      if (item._status === 'Reprovado') grupo.reprovados += 1;
      if (item._status === 'Interditado') grupo.interditados += 1;
      grouped.set(municipio, grupo);
    });
    return Array.from(grouped.values());
  }, [municipiosBase]);

  const resumo = useMemo(() => {
    const groups = new Map<string, { municipio: string; total: number; aprovados: number; reprovados: number; interditados: number }>();
    let aprovados = 0;
    let reprovados = 0;
    let interditados = 0;
    let semClassificacao = 0;

    filtrados.forEach((item) => {
      const municipio = item.MUNICIPIO.trim();
      const grupo = groups.get(municipio) ?? { municipio, total: 0, aprovados: 0, reprovados: 0, interditados: 0 };
      grupo.total += 1;
      if (item._status === 'Aprovado') { grupo.aprovados += 1; aprovados += 1; }
      if (item._status === 'Reprovado') { grupo.reprovados += 1; reprovados += 1; }
      if (item._status === 'Interditado') { grupo.interditados += 1; interditados += 1; }
      if (item._status === 'Sem classificação') semClassificacao += 1;
      groups.set(municipio, grupo);
    });

    return {
      aprovados,
      reprovados,
      interditados,
      semClassificacao,
      porMunicipio: groups,
      municipios: groups.size,
    };
  }, [filtrados]);
  const total = filtrados.length;
  const { aprovados, reprovados, interditados, semClassificacao, municipios, porMunicipio } = resumo;

  const ranking = useMemo(() => Array.from(porMunicipio.values())
    .map((item) => ({ ...item, taxa: item.total ? (item.aprovados / item.total) * 100 : 0 }))
    .sort((a, b) => {
      for (const criterio of ordenacaoRanking) {
        const valorA = criterio.key === 'municipio' ? a.municipio
          : criterio.key === 'total' ? a.total
            : criterio.key === 'aprovacao' ? a.taxa
              : criterio.key === 'reprovacao' ? (a.reprovados / a.total) * 100
                : (a.interditados / a.total) * 100;
        const valorB = criterio.key === 'municipio' ? b.municipio
          : criterio.key === 'total' ? b.total
            : criterio.key === 'aprovacao' ? b.taxa
              : criterio.key === 'reprovacao' ? (b.reprovados / b.total) * 100
                : (b.interditados / b.total) * 100;
        const comparacao = typeof valorA === 'string' && typeof valorB === 'string'
          ? valorA.localeCompare(valorB, 'pt-BR')
          : Number(valorA) - Number(valorB);
        if (comparacao !== 0) return criterio.direction === 'desc' ? -comparacao : comparacao;
      }
      return a.municipio.localeCompare(b.municipio, 'pt-BR');
    }), [porMunicipio, ordenacaoRanking]);
  const rankingFiltrado = useMemo(() => ranking.filter((item) => item.municipio.toLocaleLowerCase('pt-BR').includes(buscaRankingDiferida)), [ranking, buscaRankingDiferida]);

  function alternarCriterioRanking(key: RankingSortKey) {
    startTransition(() => {
      setOrdenacaoRanking((atual) => {
        const existente = atual.find((criterio) => criterio.key === key);
        if (existente) {
          return atual.map((criterio) => criterio.key === key
            ? { ...criterio, direction: criterio.direction === 'desc' ? 'asc' : 'desc' }
            : criterio);
        }
        return [...atual, { key, direction: key === 'municipio' ? 'asc' : 'desc' }];
      });
    });
  }

  function moverCriterioRanking(key: RankingSortKey, deslocamento: number) {
    startTransition(() => {
      setOrdenacaoRanking((atual) => {
        const origem = atual.findIndex((criterio) => criterio.key === key);
        const destino = origem + deslocamento;
        if (origem < 0 || destino < 0 || destino >= atual.length) return atual;
        const novaOrdenacao = [...atual];
        [novaOrdenacao[origem], novaOrdenacao[destino]] = [novaOrdenacao[destino], novaOrdenacao[origem]];
        return novaOrdenacao;
      });
    });
  }

  function renderCabecalhoRanking(key: RankingSortKey) {
    const criterioAtivo = ordenacaoRanking.findIndex((criterio) => criterio.key === key);
    const criterio = ordenacaoRanking[criterioAtivo];
    const label = rankingSortOptions.find((opcao) => opcao.key === key)?.label ?? key;

    return (
      <th key={key} aria-sort={criterioAtivo === 0 ? (criterio.direction === 'desc' ? 'descending' : 'ascending') : undefined}>
        <button type="button" className="ranking-sort-header" onClick={() => alternarCriterioRanking(key)}>
          {label}
          {criterio && <span className="ranking-sort-indicator" aria-label={`prioridade ${criterioAtivo + 1}, ${criterio.direction === 'desc' ? 'decrescente' : 'crescente'}`}>
            {criterio.direction === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
            {criterioAtivo + 1}
          </span>}
        </button>
      </th>
    );
  }

  const existeValeSPNaFonte = useMemo(() => data.some((item) => municipiosValeParaibaNormalizados.has(item.MUNICIPIO.trim().toLocaleUpperCase('pt-BR'))), [data]);
  const resumoVale = useMemo(() => {
    const groups = new Map<string, { nome: string; total: number; aprovados: number; reprovados: number; interditados: number }>();
    municipiosValeParaiba.forEach((nome) => {
      groups.set(nome.toLocaleUpperCase('pt-BR'), { nome, total: 0, aprovados: 0, reprovados: 0, interditados: 0 });
    });
    let total = 0;
    let aprovados = 0;
    let reprovados = 0;
    let interditados = 0;

    filtrados.forEach((item) => {
      const group = groups.get(item.MUNICIPIO.trim().toLocaleUpperCase('pt-BR'));
      if (!group) return;
      total += 1;
      group.total += 1;
      if (item._status === 'Aprovado') { aprovados += 1; group.aprovados += 1; }
      if (item._status === 'Reprovado') { reprovados += 1; group.reprovados += 1; }
      if (item._status === 'Interditado') { interditados += 1; group.interditados += 1; }
    });

    return { total, aprovados, reprovados, interditados, groups };
  }, [filtrados]);
  const { total: totalVale, aprovados: aprovadosVale, reprovados: reprovadosVale, interditados: interditadosVale, groups: porMunicipioVale } = resumoVale;
  const municipiosValeEncontrados = Array.from(porMunicipioVale.values()).filter((item) => item.total > 0).length;
  const dadosMunicipioVale = Array.from(porMunicipioVale.values())
    .map((item) => ({ ...item, taxa: item.total ? (item.aprovados / item.total) * 100 : 0 }));
  const rankingMunicipiosVale = [...dadosMunicipioVale].sort((a, b) => b.total - a.total);
  const dadosBarraVale = [
    { nome: 'Aprovação', taxa: Number(totalVale ? (aprovadosVale / totalVale) * 100 : 0), quantidade: aprovadosVale, cor: '#16835d' },
    { nome: 'Reprovação', taxa: Number(totalVale ? (reprovadosVale / totalVale) * 100 : 0), quantidade: reprovadosVale, cor: '#c47a19' },
    { nome: 'Interdição', taxa: Number(totalVale ? (interditadosVale / totalVale) * 100 : 0), quantidade: interditadosVale, cor: '#c44f45' },
  ];

  const dadosPizzaVale = [
    { nome: 'Aprovadas', valor: aprovadosVale, cor: '#16835d' },
    { nome: 'Reprovadas', valor: reprovadosVale, cor: '#c47a19' },
    { nome: 'Interditadas', valor: interditadosVale, cor: '#c44f45' },
  ];
  const linhasVale = mostrarSemDados ? rankingMunicipiosVale : rankingMunicipiosVale.filter((item) => item.total > 0);
  const semDadosVale = municipiosValeParaiba.length - municipiosValeEncontrados;

  const tendencia = useMemo(() => {
    const byMonth = new Map<string, { mes: string; aprovacao: number; reprovacao: number; interdicoes: number; total: number; aprovados: number; reprovados: number; interditados: number }>();
    filtrados.forEach((item) => {
      const date = item._date;
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const group = byMonth.get(key) ?? {
        mes: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        aprovacao: 0,
        reprovacao: 0,
        interdicoes: 0,
        total: 0,
        aprovados: 0,
        reprovados: 0,
        interditados: 0,
      };
      group.total += 1;
      if (item._status === 'Aprovado') group.aprovados += 1;
      if (item._status === 'Reprovado') group.reprovados += 1;
      if (item._status === 'Interditado') group.interditados += 1;
      group.aprovacao = (group.aprovados / group.total) * 100;
      group.reprovacao = (group.reprovados / group.total) * 100;
      group.interdicoes = group.interditados;
      byMonth.set(key, group);
    });
    return Array.from(byMonth.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value);
  }, [filtrados]);

  const listaInterdicoes = useMemo(() => filtrados.filter((item) => item._status === 'Interditado'), [filtrados]);
  const listaInterdicoesFiltrada = useMemo(() => listaInterdicoes.filter((item) => item._interdictionSearch.includes(buscaInterdicoesDiferida)).sort((a, b) => (b._date?.getTime() ?? 0) - (a._date?.getTime() ?? 0)), [listaInterdicoes, buscaInterdicoesDiferida]);
  const registrosAuditoria = useMemo(() => filtrados.filter((item) => item._auditSearch.includes(buscaAuditoriaDiferida)), [filtrados, buscaAuditoriaDiferida]);
  const municipiosUnicos = useMemo(() => Array.from(new Set(data.map((item) => item.MUNICIPIO.trim()))).sort((a, b) => a.localeCompare(b, 'pt-BR')), [data]);
  const comparacaoMunicipios = useMemo(() => {
    const selected = new Set(municipiosComparacao);
    const groups = new Map<string, { aprovados: number; reprovados: number; interditados: number; total: number }>();
    municipiosComparacao.forEach((municipio) => groups.set(municipio, { aprovados: 0, reprovados: 0, interditados: 0, total: 0 }));
    data.forEach((item) => {
      if ((anoFiltro !== 'Todos' && item._year !== Number(anoFiltro)) || !selected.has(item.MUNICIPIO.trim())) return;
      const group = groups.get(item.MUNICIPIO.trim());
      if (!group) return;
      group.total += 1;
      if (item._status === 'Aprovado') group.aprovados += 1;
      if (item._status === 'Reprovado') group.reprovados += 1;
      if (item._status === 'Interditado') group.interditados += 1;
    });
    return municipiosComparacao.map((municipio) => {
      const group = groups.get(municipio);
      const total = group?.total ?? 0;
      const aprovados = group?.aprovados ?? 0;
      const reprovados = group?.reprovados ?? 0;
      const interditados = group?.interditados ?? 0;
      return {
        municipio,
        total,
        aprovados,
        reprovados,
        interditados,
        aprovacao: total ? (aprovados / total) * 100 : 0,
        reprovacao: total ? (reprovados / total) * 100 : 0,
        interdicao: total ? (interditados / total) * 100 : 0,
      };
    });
  }, [data, anoFiltro, municipiosComparacao]);
  const comparacaoMunicipiosComDados = comparacaoMunicipios.filter((item) => item.total > 0);
  const inicio = pagina * pageSize;
  const paginas = Math.max(1, Math.ceil(registrosAuditoria.length / pageSize));
  const registrosPagina = registrosAuditoria.slice(inicio, inicio + pageSize);
  const { primeiroRegistro, ultimoRegistro } = useMemo(() => {
    const dates = data.flatMap((item) => item._date ? [item._date] : []).sort((a, b) => a.getTime() - b.getTime());
    return { primeiroRegistro: dates[0], ultimoRegistro: dates[dates.length - 1] };
  }, [data]);

  const topMunicipios = useMemo(() => {
    const contagem = new Map<string, number>();
    data.forEach((item) => {
      const nome = item.MUNICIPIO.trim();
      contagem.set(nome, (contagem.get(nome) ?? 0) + 1);
    });
    return Array.from(contagem.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nome]) => nome);
  }, [data]);
  const foraDoVale = useMemo(() => municipiosUnicos.filter((nome) => !municipiosValeParaibaNormalizados.has(nome.toLocaleUpperCase('pt-BR'))), [municipiosUnicos]);
  const pAprov = total ? (aprovados / total) * 100 : 0;
  const pReprov = total ? (reprovados / total) * 100 : 0;
  const pInterd = total ? (interditados / total) * 100 : 0;
  const filtroAtivo = Boolean(municipioFiltro.trim() || anoFiltro !== 'Todos' || municipiosMapaSelecionados.length > 0);
  const filtroDeCidade = Boolean(municipioFiltro.trim() || municipiosMapaSelecionados.length > 0);
  const cidadeUnica = filtroDeCidade && municipios === 1;
  const escopoRotulo = cidadeUnica
    ? formatarNome(Array.from(porMunicipio.keys())[0])
    : filtroDeCidade ? `${formatNumber(municipios)} municípios` : 'Todos os municípios';
  const anoRotulo = anoFiltro !== 'Todos'
    ? `em ${anoFiltro}`
    : primeiroRegistro && ultimoRegistro
      ? `de ${primeiroRegistro.getFullYear()} a ${ultimoRegistro.getFullYear()}`
      : '';

  if (loading) return (
    <main className="loading" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span>Carregando arquivo de dados do IPEM-SP...</span>
    </main>
  );

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Fuel size={22} /></div>
          <div>
            <p className="eyebrow">IPEM-SP · FISCALIZAÇÃO</p>
            <h1>Combustível na Medida</h1>
          </div>
        </div>
        <button
          type="button"
          className="export-button"
          onClick={() => exportarCsv(filtrados)}
          disabled={!filtrados.length || isUpdating}
          title={`${formatNumber(filtrados.length)} registros no arquivo`}
        >
          <Download size={15} />
          Exportar CSV
        </button>
      </header>

      <nav className="section-nav" aria-label="Seções da página">
        {secoes.map((secao) => (
          <button
            key={secao.id}
            type="button"
            className={secaoAtiva === secao.id ? 'is-active' : ''}
            aria-current={secaoAtiva === secao.id ? 'true' : undefined}
            onClick={() => irParaSecao(secao.id)}
          >
            {secao.label}
          </button>
        ))}
      </nav>

      {showUpdating && <div className="updating-indicator" role="status" aria-live="polite">
        <span className="updating-spinner" aria-hidden="true" />
        Atualizando dados...
      </div>}

      {loadError && <div className="notice notice-warn"><TriangleAlert size={17} />{loadError}</div>}

      <section id="visao-geral" className="resumo">
        <p className="eyebrow">VALE DO PARAÍBA E REGIÃO · IPEM-SP</p>
        {total ? <h2 className="resumo-title">
          {cidadeUnica ? `Em ${escopoRotulo}, ` : ''}
          <span className="resumo-number">{percent(aprovados, total)}</span> das bombas verificadas foram aprovadas
        </h2> : <h2 className="resumo-title">Nenhuma bomba encontrada neste recorte</h2>}
        <p className="resumo-sub">
          {cidadeUnica
            ? `Resultado das fiscalizações nas bombas de combustível desta cidade${anoRotulo ? `, ${anoRotulo}` : ''}. Para voltar a ver todas as cidades, use "Limpar filtros".`
            : `Resultado das fiscalizações em bombas de combustível de ${formatNumber(municipios)} municípios do Vale do Paraíba e região${anoRotulo ? `, ${anoRotulo}` : ''}. Escolha sua cidade para ver só os números dela.`}
        </p>

        <div className="resumo-controls">
          <label className="resumo-search">
            <Search size={20} />
            <span className="sr-only">Buscar município</span>
            <input
              list="lista-municipios"
              value={municipioFiltro}
              onChange={(event) => {
                setMunicipioFiltro(event.target.value);
                setMunicipiosMapaSelecionados((selected) => selected.length ? [] : selected);
                setPagina(0);
              }}
              placeholder="Digite o nome da sua cidade"
            />
            <datalist id="lista-municipios">
              {municipiosUnicos.map((municipio) => <option key={municipio} value={municipio} />)}
            </datalist>
          </label>
          <label className="resumo-year">
            <span className="sr-only">Filtrar ano</span>
            <select value={anoFiltro} onChange={(event) => {
              const year = event.target.value;
              startTransition(() => {
                setAnoFiltro(year);
                setPagina(0);
              });
            }}>
              <option value="Todos">Todos os anos</option>
              {anos.map((ano) => <option key={ano} value={ano}>{ano}</option>)}
            </select>
          </label>
          {filtroAtivo && <button type="button" className="clear-button" onClick={() => {
            setMunicipioFiltro('');
            startTransition(() => {
              setAnoFiltro('Todos');
              setMunicipiosMapaSelecionados([]);
              setPagina(0);
            });
          }}>Limpar filtros</button>}
        </div>

        {topMunicipios.length > 0 && <div className="resumo-chips">
          <span>Mais fiscalizadas:</span>
          {topMunicipios.map((municipio) => (
            <button
              key={municipio}
              type="button"
              onClick={() => {
                startTransition(() => {
                  setMunicipioFiltro(municipio);
                  setMunicipiosMapaSelecionados([]);
                  setPagina(0);
                });
              }}
            >
              {formatarNome(municipio)}
            </button>
          ))}
        </div>}
      </section>

      <section className="kpi-grid" aria-label="Indicadores principais">
        <button type="button" className="kpi kpi-green" onClick={() => irParaSecao('ranking')}>
          <span className="kpi-top"><span>Taxa de aprovação</span><ShieldCheck size={20} /></span>
          <strong>{percent(aprovados, total)}</strong>
          <small>{formatNumber(aprovados)} bombas aprovadas</small>
          <span className="kpi-bar"><i style={{ width: `${pAprov}%` }} /></span>
          <span className="kpi-link">Ver ranking das cidades →</span>
        </button>
        <button type="button" className="kpi kpi-amber" onClick={() => irParaSecao('ranking')}>
          <span className="kpi-top"><span>Taxa de reprovação</span><AlertTriangle size={20} /></span>
          <strong>{percent(reprovados, total)}</strong>
          <small>{formatNumber(reprovados)} bombas reprovadas</small>
          <span className="kpi-bar"><i style={{ width: `${pReprov}%` }} /></span>
          <span className="kpi-link">Ver ranking das cidades →</span>
        </button>
        <button type="button" className="kpi kpi-red" onClick={() => irParaSecao('interditadas')}>
          <span className="kpi-top"><span>Interdições</span><Ban size={20} /></span>
          <strong>{formatNumber(interditados)}</strong>
          <small>{percent(interditados, total)} das verificações</small>
          <span className="kpi-bar"><i style={{ width: `${interditados ? Math.max(pInterd, 2) : 0}%` }} /></span>
          <span className="kpi-link">Ver as bombas interditadas →</span>
        </button>
        <button type="button" className="kpi kpi-ink" onClick={() => irParaSecao('dados')}>
          <span className="kpi-top"><span>Bombas verificadas</span><ClipboardCheck size={20} /></span>
          <strong>{formatNumber(total)}</strong>
          <small>{escopoRotulo}</small>
          <span className="kpi-bar"><i style={{ width: '100%' }} /></span>
          <span className="kpi-link">Ver dados da fonte →</span>
        </button>
      </section>

      <section id="mapa" className="panel map-panel">
        <div className="panel-heading map-heading">
          <div><p className="eyebrow">EXPLORAÇÃO GEOGRÁFICA</p><h3>Fiscalizações por município</h3></div>
          <div className="map-heading-actions">
            <span className="count-pill region-pill">{formatNumber(mapaMunicipios.length)} municípios · {formatNumber(mapaMunicipios.reduce((sum, item) => sum + item.total, 0))} bombas</span>
            {municipiosMapaSelecionados.length > 0 && <button type="button" className="map-clear-button" onClick={() => selecionarMunicipiosNoMapa([])}>Limpar seleção</button>}
          </div>
        </div>
        <p className="section-lead">Clique em uma cidade para ver só os números dela. Os círculos mostram quantas bombas foram verificadas; a cor indica o nível de irregularidades.</p>
        <Suspense fallback={<div className="fuel-map-loading">Preparando mapa interativo...</div>}>
          <FuelMap
            points={mapaMunicipios}
            selectedMunicipalities={municipiosMapaSelecionados}
            onSelectMunicipalities={selecionarMunicipiosNoMapa}
          />
        </Suspense>
        <p className="map-data-note">A base não informa o endereço nem as coordenadas de cada bomba. Os marcadores representam o volume por município e ficam posicionados aproximadamente no centro da cidade.</p>
      </section>

      <section id="vale" className="panel region-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">RECORTE TERRITORIAL</p><h3>Vale do Paraíba · {graficoRegional === 'rates' ? 'taxas' : graficoRegional === 'results' ? 'resultados' : 'municípios'}</h3></div>
          <span className="count-pill region-pill">{formatNumber(totalVale)} bombas · {municipiosValeEncontrados} municípios</span>
        </div>
        <p className="section-lead">Números só das bombas das cidades do Vale do Paraíba e Litoral Norte que constam na base do IPEM-SP.</p>
        {totalVale ? <div className="region-content">
          <div className="region-switcher" role="group" aria-label="Gráficos do Vale do Paraíba">
            <button type="button" className={graficoRegional === 'rates' ? 'is-active' : ''} aria-label="Taxas de conformidade" aria-pressed={graficoRegional === 'rates'} title="Taxas de conformidade" onClick={() => startTransition(() => setGraficoRegional('rates'))}><ChartNoAxesColumnIncreasing size={17} /></button>
            <button type="button" className={graficoRegional === 'results' ? 'is-active' : ''} aria-label="Composição dos resultados" aria-pressed={graficoRegional === 'results'} title="Composição dos resultados" onClick={() => startTransition(() => setGraficoRegional('results'))}><ChartPie size={17} /></button>
            <button type="button" className={graficoRegional === 'municipalities' ? 'is-active' : ''} aria-label="Volume por município" aria-pressed={graficoRegional === 'municipalities'} title="Volume por município" onClick={() => startTransition(() => setGraficoRegional('municipalities'))}><MapPin size={17} /></button>
          </div>
          <div className="region-chart">
            {graficoRegional === 'results' ? <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={dadosPizzaVale} dataKey="valor" nameKey="nome" innerRadius={45} outerRadius={72} paddingAngle={0} stroke="none">
                {dadosPizzaVale.map((entry) => <Cell key={entry.nome} fill={entry.cor} />)}
              </Pie><Tooltip formatter={(value) => formatNumber(Number(value))} /></PieChart>
            </ResponsiveContainer> : graficoRegional === 'municipalities' ? <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingMunicipiosVale.slice(0, 10)} layout="vertical" margin={{ top: 0, right: 24, left: 4, bottom: 0 }}>
                <CartesianGrid stroke="#e7e9e5" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#737a74', fontSize: 10 }} />
                <YAxis type="category" dataKey="nome" width={118} interval={0} tickLine={false} axisLine={false} tick={{ fill: '#4f5650', fontSize: 10 }} />
                <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Bombas']} />
                <Bar dataKey="total" name="Bombas" fill="#64856a" radius={[0, 3, 3, 0]} barSize={13} />
              </BarChart>
            </ResponsiveContainer> : <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosBarraVale} layout="vertical" margin={{ top: 0, right: 32, left: 6, bottom: 0 }}>
                <CartesianGrid stroke="#e7e9e5" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} tickLine={false} axisLine={false} tick={{ fill: '#737a74', fontSize: 11 }} />
                <YAxis type="category" dataKey="nome" width={90} tickLine={false} axisLine={false} tick={{ fill: '#4f5650', fontSize: 11 }} />
                <Tooltip formatter={(value, _name, item) => [`${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% (${formatNumber(Number(item.payload.quantidade))} bombas)`, 'Taxa']} />
                <Bar dataKey="taxa" name="Taxa" radius={[0, 3, 3, 0]} barSize={18}>
                  {dadosBarraVale.map((entry) => <Cell key={entry.nome} fill={entry.cor} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>}
          </div>
          <aside className="region-note">
            <strong>Contagens no recorte</strong>
            <ul className="region-breakdown">{dadosBarraVale.map((item) => <li key={item.nome}><span><i style={{ backgroundColor: item.cor }} />{item.nome}</span><b>{formatNumber(item.quantidade)} · {percent(item.quantidade, totalVale)}</b></li>)}</ul>
            <strong>Como este recorte foi formado</strong>
            <p>O recorte considera somente municípios do Vale do Paraíba e Litoral Norte de São Paulo. A lista é aplicada pelo nome do município, pois a base não possui coluna de região.</p>

          </aside>
        </div> : <div className="data-gap region-empty"><strong>{existeValeSPNaFonte ? 'Nenhuma bomba do Vale do Paraíba neste recorte' : 'A base não contém registros dos municípios paulistas do Vale do Paraíba'}</strong><p>{existeValeSPNaFonte ? 'Revise o filtro de município ou ano. Municípios da região sem registros nesta base não entram nas taxas.' : 'Os municípios paulistas ainda não têm registros nesta base.'}</p></div>}
      </section>

      <section className="panel region-municipality-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">ABRANGÊNCIA TERRITORIAL</p><h3>Municípios do Vale do Paraíba</h3></div>
          <div className="table-tools">
            <span className="count-pill region-pill">{municipiosValeParaiba.length} listados · {municipiosValeEncontrados} com dados</span>
            {semDadosVale > 0 && <button type="button" className="collapse-toggle" aria-expanded={mostrarSemDados} onClick={() => startTransition(() => setMostrarSemDados(!mostrarSemDados))}>
              {mostrarSemDados ? 'Ocultar cidades sem dados' : `Mostrar ${semDadosVale} cidades sem dados`}<ChevronDown size={15} />
            </button>}
          </div>
        </div>
        {linhasVale.length ? <div className="table-scroll">
          <table className="region-list-table">
            <thead><tr><th>Município</th><th>Bombas</th><th>Aprovação</th><th>Reprovação</th><th>Interdições</th></tr></thead>
            <tbody>{linhasVale.map((item) => <tr key={item.nome}>
              <td>{item.nome}</td>
              {item.total ? <><td>{formatNumber(item.total)}</td><td className="good-text">{percent(item.aprovados, item.total)}</td><td className="warn-text">{percent(item.reprovados, item.total)}</td><td className="danger-text">{formatNumber(item.interditados)}</td></> : <><td className="no-data-cell">Sem dados</td><td className="no-data-cell">Sem dados</td><td className="no-data-cell">Sem dados</td><td className="no-data-cell">Sem dados</td></>}
            </tr>)}</tbody>
          </table>
        </div> : <p className="empty-state">Nenhuma cidade do Vale com dados neste recorte.</p>}
        {foraDoVale.length > 0 && <p className="table-note">A base também tem dados de {foraDoVale.length} {foraDoVale.length === 1 ? 'cidade' : 'cidades'} fora da lista do Vale: {foraDoVale.map(formatarNome).join(', ')}.</p>}
      </section>

      <section id="interditadas" className="panel interdiction-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">ONDE HOUVE PROBLEMA</p><h3>Bombas interditadas <span className="count-pill">{formatNumber(listaInterdicoesFiltrada.length)} / {formatNumber(listaInterdicoes.length)}</span></h3></div>
          <label className="search-field compact-search"><Search size={15} /><span className="sr-only">Buscar interdições</span><input value={buscaInterdicoes} onChange={(event) => setBuscaInterdicoes(event.target.value)} placeholder="Município, posto ou bomba" /></label>
        </div>
        <p className="section-lead">Bombas que foram proibidas de funcionar depois da fiscalização, das mais recentes para as mais antigas. A base não informa o motivo de cada interdição.</p>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Município</th><th>Data</th><th>Posto / proprietário</th><th>Marca e modelo</th><th>Nº Inmetro</th></tr></thead>
            <tbody>{listaInterdicoesFiltrada.slice(0, interdicoesTodas ? 100 : 5).map((item, index) => <tr key={`${item.NUMERO_INMETRO}-${index}`}>
              <td>{item.MUNICIPIO}</td><td>{item.DATA_VERIFICACAO || '—'}</td><td>{item.PROPRIETARIO || '—'}</td><td>{[item.MARCA, item.MODELO].filter(Boolean).join(' · ') || '—'}</td><td>{item.NUMERO_INMETRO || '—'}</td>
            </tr>)}</tbody>
          </table>
          {!listaInterdicoesFiltrada.length && <p className="empty-state">Nenhuma interdição neste recorte.</p>}
        </div>
        {listaInterdicoesFiltrada.length > 5 && <div className="table-more">
          <button type="button" className="collapse-toggle" aria-expanded={interdicoesTodas} onClick={() => startTransition(() => setInterdicoesTodas(!interdicoesTodas))}>
            {interdicoesTodas ? 'Mostrar só as 5 mais recentes' : `Ver todas as ${formatNumber(Math.min(listaInterdicoesFiltrada.length, 100))}`}<ChevronDown size={15} />
          </button>
        </div>}
        {interdicoesTodas && listaInterdicoesFiltrada.length > 100 && <p className="table-note">Exibindo as 100 mais recentes; refine a busca para localizar outras.</p>}
      </section>

      <section id="ranking" className="panel ranking-panel">
        <div className="panel-heading ranking-heading">
          <div><p className="eyebrow">CONFORMIDADE MUNICIPAL</p><h3>Ranking de municípios</h3></div>
          <div className="ranking-search">
            <label className="search-field compact-search"><Search size={15} /><span className="sr-only">Buscar no ranking</span><input value={buscaRanking} onChange={(event) => setBuscaRanking(event.target.value)} placeholder="Filtrar municípios" /></label>
          </div>
        </div>
        <div className="ranking-sort-card">
          <div className="ranking-sort-info">
            <span className="ranking-sort-icon"><SlidersHorizontal size={15} /></span>
            <div><span className="ranking-sort-title">Ordenar por</span><span className="ranking-sort-description">Os critérios são aplicados na ordem abaixo</span></div>
            <span className="ranking-sort-count">{ordenacaoRanking.length} {ordenacaoRanking.length === 1 ? 'critério' : 'critérios'}</span>
          </div>
          <ol className="ranking-sort-list">
            {ordenacaoRanking.map((criterio, index) => (
              <li key={criterio.key}>
                <span className="sort-priority">{index + 1}</span>
                <span className="sort-label">{rankingSortOptions.find((opcao) => opcao.key === criterio.key)?.label}</span>
                <button type="button" className="sort-direction" onClick={() => alternarCriterioRanking(criterio.key)} aria-label={`Inverter ordem de ${rankingSortOptions.find((opcao) => opcao.key === criterio.key)?.label}`}>
                  {criterio.direction === 'desc' ? <ArrowDownWideNarrow size={13} /> : <ArrowUpWideNarrow size={13} />}
                  <span>{criterio.direction === 'desc' ? 'Maior primeiro' : 'Menor primeiro'}</span>
                </button>
                <span className="sort-divider" />
                <button type="button" className="sort-priority-button" onClick={() => moverCriterioRanking(criterio.key, -1)} disabled={index === 0} aria-label={`Aumentar prioridade de ${rankingSortOptions.find((opcao) => opcao.key === criterio.key)?.label}`}><ArrowUp size={13} /></button>
                <button type="button" className="sort-priority-button" onClick={() => moverCriterioRanking(criterio.key, 1)} disabled={index === ordenacaoRanking.length - 1} aria-label={`Diminuir prioridade de ${rankingSortOptions.find((opcao) => opcao.key === criterio.key)?.label}`}><ArrowDown size={13} /></button>
                <button type="button" className="sort-remove-button" onClick={() => startTransition(() => setOrdenacaoRanking((atual) => atual.filter((item) => item.key !== criterio.key)))} aria-label={`Remover ${rankingSortOptions.find((opcao) => opcao.key === criterio.key)?.label}`}><X size={13} /></button>
              </li>
            ))}
          </ol>
          <label className="sr-only" htmlFor="add-ranking-sort">Adicionar critério de ordenação</label>
          <select
            id="add-ranking-sort"
            className="add-ranking-sort"
            value=""
            disabled={ordenacaoRanking.length === rankingSortOptions.length}
            onChange={(event) => {
              const key = rankingSortOptions.find((opcao) => opcao.key === event.target.value)?.key;
              if (key && !ordenacaoRanking.some((criterio) => criterio.key === key)) {
                startTransition(() => setOrdenacaoRanking((atual) => [...atual, { key, direction: key === 'municipio' ? 'asc' : 'desc' }]));
              }
            }}
          >
            <option value="" disabled>+ Adicionar critério</option>
            {rankingSortOptions.filter((opcao) => !ordenacaoRanking.some((criterio) => criterio.key === opcao.key)).map((opcao) => (
              <option key={opcao.key} value={opcao.key}>{opcao.label}</option>
            ))}
          </select>
        </div>
        <div className="ranking-layout">
          <div className="ranking-chart"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankingFiltrado.slice(0, 12)} layout="vertical" margin={{ top: 0, right: 18, left: 12, bottom: 0 }}>
              <CartesianGrid stroke="#e7e9e5" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} tickLine={false} axisLine={false} tick={{ fill: '#737a74', fontSize: 11 }} />
              <YAxis type="category" dataKey="municipio" width={150} tickLine={false} axisLine={false} tick={{ fill: '#4f5650', fontSize: 11 }} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`} />
              <Bar dataKey="taxa" name="Aprovação" fill="#16835d" radius={[0, 3, 3, 0]} barSize={13} />
            </BarChart>
          </ResponsiveContainer></div>
          <div className="table-scroll ranking-table-wrap">
            <table>
              <thead><tr>{rankingSortOptions.map((opcao) => renderCabecalhoRanking(opcao.key))}</tr></thead>
              <tbody>{rankingFiltrado.map((item) => <tr key={item.municipio}><td>{item.municipio}</td><td>{formatNumber(item.total)}</td><td className="good-text">{percent(item.aprovados, item.total)}</td><td className="warn-text">{percent(item.reprovados, item.total)}</td><td className="danger-text">{percent(item.interditados, item.total)}</td></tr>)}</tbody>
            </table>
            {!rankingFiltrado.length && <p className="empty-state">Nenhum município encontrado neste recorte.</p>}
          </div>
        </div>
      </section>

      <section id="evolucao" className="panel trend-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">EVOLUÇÃO NO TEMPO</p><h3>Está melhorando ou piorando?</h3></div>
          <div className="legend"><span><i className="legend-green" />Aprovação</span><span><i className="legend-amber" />Reprovação</span><span><i className="legend-red" />Interdições</span></div>
        </div>
        <p className="section-lead">Porcentagem de bombas aprovadas e reprovadas a cada mês (eixo da esquerda). A linha vermelha mostra quantas bombas foram interditadas no mês (eixo da direita).</p>
        {tendencia.length ? <div className="chart-wrap trend-chart"><ResponsiveContainer width="100%" height="100%">
          <LineChart data={tendencia} margin={{ top: 8, right: 16, left: -14, bottom: 0 }}>
            <CartesianGrid stroke="#e7e9e5" vertical={false} />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} minTickGap={32} tick={{ fill: '#737a74', fontSize: 12 }} />
            <YAxis yAxisId="taxa" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#737a74', fontSize: 12 }} tickFormatter={(value: number) => `${value}%`} />
            <YAxis yAxisId="quantidade" orientation="right" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#737a74', fontSize: 11 }} />
            <Tooltip formatter={(value, name) => name === 'Interdições' ? formatNumber(Number(value)) : `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`} />
            <Line yAxisId="taxa" type="monotone" dataKey="aprovacao" name="Aprovação" stroke="#16835d" strokeWidth={2.5} dot={false} />
            <Line yAxisId="taxa" type="monotone" dataKey="reprovacao" name="Reprovação" stroke="#c47a19" strokeWidth={2.5} dot={false} />
            <Line yAxisId="quantidade" type="monotone" dataKey="interdicoes" name="Interdições" stroke="#c44f45" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer></div> : <p className="empty-state">Não há datas válidas para montar a série histórica.</p>}
      </section>

      <section id="comparar" className="panel municipality-comparison-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">COMPARAÇÃO DIRETA</p><h3>Compare municípios</h3></div>
          <span className="count-pill region-pill">{municipiosComparacao.length} / 5 selecionados</span>
        </div>
        <p className="comparison-description">Compare os resultados dos municípios no ano selecionado. Este comparativo não é alterado pela busca geral de município.</p>
        <div className="comparison-controls">
          <label className="comparison-select-field" htmlFor="municipio-comparacao">Adicionar município</label>
          <select
            id="municipio-comparacao"
            className="comparison-select"
            value={municipioComparacaoSelecionado}
            onChange={(event) => setMunicipioComparacaoSelecionado(event.target.value)}
            disabled={municipiosComparacao.length >= 5}
          >
            <option value="">Selecione um município</option>
            {municipiosUnicos.filter((municipio) => !municipiosComparacao.includes(municipio)).map((municipio) => (
              <option key={municipio} value={municipio}>{municipio}</option>
            ))}
          </select>
          <button
            type="button"
            className="comparison-add-button"
            disabled={!municipioComparacaoSelecionado || municipiosComparacao.length >= 5}
            onClick={() => {
              if (municipioComparacaoSelecionado && !municipiosComparacao.includes(municipioComparacaoSelecionado)) {
                const municipio = municipioComparacaoSelecionado;
                startTransition(() => setMunicipiosComparacao((atual) => [...atual, municipio]));
                setMunicipioComparacaoSelecionado('');
              }
            }}
          >
            <Plus size={15} /> Adicionar
          </button>
        </div>
        {municipiosComparacao.length > 0 && <ul className="comparison-selected-list" aria-label="Municípios selecionados para comparação">
          {municipiosComparacao.map((municipio) => (
            <li key={municipio}>
              <span>{municipio}</span>
              <button type="button" aria-label={`Remover ${municipio} da comparação`} onClick={() => startTransition(() => setMunicipiosComparacao((atual) => atual.filter((item) => item !== municipio)))}><X size={14} /></button>
            </li>
          ))}
        </ul>}
        {municipiosComparacao.length >= 2 && comparacaoMunicipiosComDados.length > 0 ? <div className="comparison-layout">
          <div className="comparison-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparacaoMunicipiosComDados} margin={{ top: 8, right: 12, left: -12, bottom: 30 }}>
                <CartesianGrid stroke="#e7e9e5" vertical={false} />
                <XAxis dataKey="municipio" tickLine={false} axisLine={false} angle={-22} textAnchor="end" interval={0} height={52} tick={{ fill: '#4f5650', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} tickLine={false} axisLine={false} tick={{ fill: '#737a74', fontSize: 10 }} />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`} />
                <Bar dataKey="aprovacao" name="Aprovação" fill="#16835d" radius={[3, 3, 0, 0]} barSize={18} />
                <Bar dataKey="reprovacao" name="Reprovação" fill="#c47a19" radius={[3, 3, 0, 0]} barSize={18} />
                <Bar dataKey="interdicao" name="Interdição" fill="#c44f45" radius={[3, 3, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="table-scroll comparison-table-wrap">
            <table>
              <thead><tr><th>Município</th><th>Bombas</th><th>Aprov.</th><th>Reprov.</th><th>Interd.</th></tr></thead>
              <tbody>{comparacaoMunicipios.map((item) => <tr key={item.municipio}>
                <td>{item.municipio}</td>
                {item.total ? <>
                  <td>{formatNumber(item.total)}</td>
                  <td className="good-text">{percent(item.aprovados, item.total)}</td>
                  <td className="warn-text">{percent(item.reprovados, item.total)}</td>
                  <td className="danger-text">{percent(item.interditados, item.total)}</td>
                </> : <td colSpan={4} className="no-data-cell">Sem dados para o período</td>}
              </tr>)}</tbody>
            </table>
          </div>
        </div> : <p className="empty-state">{municipiosComparacao.length >= 2 ? 'Os municípios selecionados não têm registros no ano escolhido.' : municipiosComparacao.length === 1 ? 'Adicione pelo menos mais um município para comparar.' : 'Selecione de 2 a 5 municípios para visualizar a comparação.'}</p>}
        <p className="comparison-footnote">O denominador das taxas é o total de bombas registradas para cada município no período, inclusive registros sem classificação. O volume fiscalizado aparece na tabela para contextualizar os percentuais.</p>
      </section>

      <section id="dados" className="dados-group">
      <section className="panel audit-panel">
        <div className="panel-heading audit-heading">
          <div><p className="eyebrow">RASTREABILIDADE</p><h3>Conferência com os registros da fonte</h3></div>
          <div className="table-tools">
            <label className="search-field compact-search"><Search size={15} /><span className="sr-only">Buscar nos registros</span><input value={buscaAuditoria} onChange={(event) => { setBuscaAuditoria(event.target.value); setPagina(0); }} placeholder="Município, resultado ou Inmetro" /></label>
            <span className="count-pill region-pill">{formatNumber(registrosAuditoria.length)} registros</span>
            <span className="source-tag"><Check size={15} /> CSV carregado</span>
            <button type="button" className="collapse-toggle" aria-expanded={auditoriaExpandida} onClick={() => startTransition(() => setAuditoriaExpandida(!auditoriaExpandida))}>
              {auditoriaExpandida ? 'Recolher' : 'Mostrar lista'}<ChevronDown size={15} />
            </button>
          </div>
        </div>
        {auditoriaExpandida && <>
        <div className="audit-summary">
          <span>Registros no recorte <strong>{formatNumber(total)}</strong></span>
          <span>Período da base <strong>{primeiroRegistro?.toLocaleDateString('pt-BR')} – {ultimoRegistro?.toLocaleDateString('pt-BR')}</strong></span>
          <span>Sem classificação <strong>{formatNumber(semClassificacao)}</strong></span>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Município</th><th>Data</th><th>Resultado</th><th>Status consolidado</th><th>Posto / proprietário</th><th>Nº Inmetro</th></tr></thead>
            <tbody>{registrosPagina.map((item, index) => <tr key={`${item.NUMERO_INMETRO}-${item.DATA_VERIFICACAO}-${inicio + index}`}>
              <td>{item.MUNICIPIO}</td><td>{item.DATA_VERIFICACAO || '—'}</td><td>{item.RESULTADO || '—'}</td>
              <td><span className={`status status-${item._status.toLocaleLowerCase('pt-BR').replaceAll(' ', '-')}`}>{item._status}</span></td><td>{item.PROPRIETARIO || '—'}</td><td>{item.NUMERO_INMETRO || '—'}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Exibindo {registrosAuditoria.length ? formatNumber(inicio + 1) : 0}–{formatNumber(Math.min(inicio + pageSize, registrosAuditoria.length))} de {formatNumber(registrosAuditoria.length)}</span>
          <div><button disabled={pagina === 0} onClick={() => startTransition(() => setPagina(pagina - 1))}>Anterior</button><span>Página {pagina + 1} de {paginas}</span><button disabled={pagina + 1 >= paginas} onClick={() => startTransition(() => setPagina(pagina + 1))}>Próxima</button></div>
        </div>
        </>}
      </section>

      </section>

      <footer className="footer-note"><Fuel size={15} /> Fonte: dados_bombas_tratados.csv · {primeiroRegistro && ultimoRegistro ? `Período disponível: ${primeiroRegistro.toLocaleDateString('pt-BR')} a ${ultimoRegistro.toLocaleDateString('pt-BR')}` : 'Datas não disponíveis'} · Aprovação/reprovação calculadas sobre o total de bombas no recorte.</footer>

      {mostrarTopo && (
        <button
          type="button"
          className="back-to-top"
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
          onClick={() => window.scrollTo({ top: 0, behavior: prefereMenosMovimento() ? 'auto' : 'smooth' })}
        >
          <ArrowUp size={18} />
        </button>
      )}
    </main>
  );
}