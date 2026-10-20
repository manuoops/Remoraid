import { useEffect, useState } from 'react';
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
import './App.css';

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

type Status = 'Aprovado' | 'Reprovado' | 'Interditado' | 'Sem classificação';
type DistributionChart = 'pie' | 'bar';
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

function getStatus(record: BombaData): Status {
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

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR');
}

export default function App() {
  const [data, setData] = useState<BombaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [municipioFiltro, setMunicipioFiltro] = useState('');
  const [anoFiltro, setAnoFiltro] = useState('Todos');
  const [municipioComparacaoSelecionado, setMunicipioComparacaoSelecionado] = useState('');
  const [municipiosComparacao, setMunicipiosComparacao] = useState<string[]>([]);
  const [ordenacaoRanking, setOrdenacaoRanking] = useState<RankingSort[]>([
    { key: 'aprovacao', direction: 'desc' },
  ]);
  const [buscaRanking, setBuscaRanking] = useState('');
  const [buscaInterdicoes, setBuscaInterdicoes] = useState('');
  const [buscaAuditoria, setBuscaAuditoria] = useState('');
  const [mostrarMunicipios, setMostrarMunicipios] = useState(false);
  const [municipiosValeExpandido, setMunicipiosValeExpandido] = useState(false);
  const [interdicoesExpandidas, setInterdicoesExpandidas] = useState(false);
  const [auditoriaExpandida, setAuditoriaExpandida] = useState(false);
  const [graficoDistribuicao, setGraficoDistribuicao] = useState<DistributionChart>('pie');
  const [graficoRegional, setGraficoRegional] = useState<RegionChart>('rates');
  const [pagina, setPagina] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    Papa.parse<BombaData>('/dados_bombas_tratados.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data.filter((row) => row.MUNICIPIO));
        setLoadError(results.errors.length ? 'A base foi carregada com avisos de leitura.' : '');
        setLoading(false);
      },
      error: () => {
        setLoadError('Não foi possível carregar o arquivo de dados.');
        setLoading(false);
      },
    });
  }, []);

  const anos = Array.from(new Set(data.map((item) => parseDate(item.DATA_VERIFICACAO)?.getFullYear()).filter((year): year is number => Boolean(year))))
    .sort((a, b) => b - a);
  const filtrados = data.filter((item) => {
    const municipioOk = item.MUNICIPIO?.toLocaleLowerCase('pt-BR').includes(municipioFiltro.toLocaleLowerCase('pt-BR'));
    const date = parseDate(item.DATA_VERIFICACAO);
    const anoOk = anoFiltro === 'Todos' || date?.getFullYear() === Number(anoFiltro);
    return municipioOk && anoOk;
  });

  const total = filtrados.length;
  const aprovados = filtrados.filter((item) => getStatus(item) === 'Aprovado').length;
  const reprovados = filtrados.filter((item) => getStatus(item) === 'Reprovado').length;
  const interditados = filtrados.filter((item) => getStatus(item) === 'Interditado').length;
  const semClassificacao = filtrados.filter((item) => getStatus(item) === 'Sem classificação').length;
  const municipios = new Set(filtrados.map((item) => item.MUNICIPIO)).size;

  const porMunicipio = new Map<string, { municipio: string; total: number; aprovados: number; reprovados: number; interditados: number }>();
  filtrados.forEach((item) => {
    const municipio = item.MUNICIPIO?.trim();
    if (!municipio) return;
    const grupo = porMunicipio.get(municipio) ?? { municipio, total: 0, aprovados: 0, reprovados: 0, interditados: 0 };
    const status = getStatus(item);
    grupo.total += 1;
    if (status === 'Aprovado') grupo.aprovados += 1;
    if (status === 'Reprovado') grupo.reprovados += 1;
    if (status === 'Interditado') grupo.interditados += 1;
    porMunicipio.set(municipio, grupo);
  });
  const ranking = Array.from(porMunicipio.values())
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
    });
  const rankingFiltrado = ranking.filter((item) => item.municipio.toLocaleLowerCase('pt-BR').includes(buscaRanking.toLocaleLowerCase('pt-BR')));

  function alternarCriterioRanking(key: RankingSortKey) {
    setOrdenacaoRanking((atual) => {
      const existente = atual.find((criterio) => criterio.key === key);
      if (existente) {
        return atual.map((criterio) => criterio.key === key
          ? { ...criterio, direction: criterio.direction === 'desc' ? 'asc' : 'desc' }
          : criterio);
      }
      return [...atual, { key, direction: key === 'municipio' ? 'asc' : 'desc' }];
    });
  }

  function moverCriterioRanking(key: RankingSortKey, deslocamento: number) {
    setOrdenacaoRanking((atual) => {
      const origem = atual.findIndex((criterio) => criterio.key === key);
      const destino = origem + deslocamento;
      if (origem < 0 || destino < 0 || destino >= atual.length) return atual;
      const novaOrdenacao = [...atual];
      [novaOrdenacao[origem], novaOrdenacao[destino]] = [novaOrdenacao[destino], novaOrdenacao[origem]];
      return novaOrdenacao;
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

  const dadosValeParaiba = filtrados.filter((item) => municipiosValeParaibaNormalizados.has(item.MUNICIPIO?.trim().toLocaleUpperCase('pt-BR')));
  const existeValeSPNaFonte = data.some((item) => municipiosValeParaibaNormalizados.has(item.MUNICIPIO?.trim().toLocaleUpperCase('pt-BR')));
  const totalVale = dadosValeParaiba.length;
  const aprovadosVale = dadosValeParaiba.filter((item) => getStatus(item) === 'Aprovado').length;
  const reprovadosVale = dadosValeParaiba.filter((item) => getStatus(item) === 'Reprovado').length;
  const interditadosVale = dadosValeParaiba.filter((item) => getStatus(item) === 'Interditado').length;
  const municipiosValeEncontrados = new Set(dadosValeParaiba.map((item) => item.MUNICIPIO)).size;
  const porMunicipioVale = new Map<string, { nome: string; total: number; aprovados: number; reprovados: number; interditados: number }>();
  municipiosValeParaiba.forEach((nome) => {
    porMunicipioVale.set(nome.toLocaleUpperCase('pt-BR'), { nome, total: 0, aprovados: 0, reprovados: 0, interditados: 0 });
  });
  dadosValeParaiba.forEach((item) => {
    const grupo = porMunicipioVale.get(item.MUNICIPIO.trim().toLocaleUpperCase('pt-BR'));
    if (!grupo) return;
    grupo.total += 1;
    const status = getStatus(item);
    if (status === 'Aprovado') grupo.aprovados += 1;
    if (status === 'Reprovado') grupo.reprovados += 1;
    if (status === 'Interditado') grupo.interditados += 1;
  });
  const dadosMunicipioVale = Array.from(porMunicipioVale.values())
    .map((item) => ({ ...item, taxa: item.total ? (item.aprovados / item.total) * 100 : 0 }));
  const rankingMunicipiosVale = [...dadosMunicipioVale].sort((a, b) => b.total - a.total);
  const dadosBarraVale = [
    { nome: 'Aprovação', taxa: Number(totalVale ? (aprovadosVale / totalVale) * 100 : 0), quantidade: aprovadosVale, cor: '#16835d' },
    { nome: 'Reprovação', taxa: Number(totalVale ? (reprovadosVale / totalVale) * 100 : 0), quantidade: reprovadosVale, cor: '#c47a19' },
    { nome: 'Interdição', taxa: Number(totalVale ? (interditadosVale / totalVale) * 100 : 0), quantidade: interditadosVale, cor: '#c44f45' },
  ];

  const porMes = new Map<string, { mes: string; aprovacao: number; reprovacao: number; interdicoes: number; total: number; aprovados: number; reprovados: number; interditados: number }>();
  filtrados.forEach((item) => {
    const date = parseDate(item.DATA_VERIFICACAO);
    if (!date) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const grupo = porMes.get(key) ?? {
      mes: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      aprovacao: 0,
      reprovacao: 0,
      interdicoes: 0,
      total: 0,
      aprovados: 0,
      reprovados: 0,
      interditados: 0,
    };
    grupo.total += 1;
    if (getStatus(item) === 'Aprovado') grupo.aprovados += 1;
    if (getStatus(item) === 'Reprovado') grupo.reprovados += 1;
    if (getStatus(item) === 'Interditado') grupo.interditados += 1;
    grupo.aprovacao = grupo.total ? (grupo.aprovados / grupo.total) * 100 : 0;
    grupo.reprovacao = grupo.total ? (grupo.reprovados / grupo.total) * 100 : 0;
    grupo.interdicoes = grupo.interditados;
    porMes.set(key, grupo);
  });
  const tendencia = Array.from(porMes.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value);

  const listaInterdicoes = filtrados.filter((item) => getStatus(item) === 'Interditado');
  const listaInterdicoesFiltrada = listaInterdicoes.filter((item) => `${item.MUNICIPIO} ${item.PROPRIETARIO} ${item.MARCA} ${item.MODELO} ${item.NUMERO_INMETRO}`.toLocaleLowerCase('pt-BR').includes(buscaInterdicoes.toLocaleLowerCase('pt-BR')));
  const registrosAuditoria = filtrados.filter((item) => `${item.MUNICIPIO} ${item.RESULTADO} ${item.STATUS_CONSOLIDADO} ${item.PROPRIETARIO} ${item.NUMERO_INMETRO}`.toLocaleLowerCase('pt-BR').includes(buscaAuditoria.toLocaleLowerCase('pt-BR')));
  const municipiosUnicos = Array.from(new Set(data.map((item) => item.MUNICIPIO?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const dadosComparacaoAno = data.filter((item) => {
    const date = parseDate(item.DATA_VERIFICACAO);
    return anoFiltro === 'Todos' || date?.getFullYear() === Number(anoFiltro);
  });
  const comparacaoMunicipios = municipiosComparacao.map((municipio) => {
    const registros = dadosComparacaoAno.filter((item) => item.MUNICIPIO?.trim() === municipio);
    const aprovadosMunicipio = registros.filter((item) => getStatus(item) === 'Aprovado').length;
    const reprovadosMunicipio = registros.filter((item) => getStatus(item) === 'Reprovado').length;
    const interditadosMunicipio = registros.filter((item) => getStatus(item) === 'Interditado').length;
    const totalMunicipio = registros.length;
    return {
      municipio,
      total: totalMunicipio,
      aprovados: aprovadosMunicipio,
      reprovados: reprovadosMunicipio,
      interditados: interditadosMunicipio,
      aprovacao: totalMunicipio ? (aprovadosMunicipio / totalMunicipio) * 100 : 0,
      reprovacao: totalMunicipio ? (reprovadosMunicipio / totalMunicipio) * 100 : 0,
      interdicao: totalMunicipio ? (interditadosMunicipio / totalMunicipio) * 100 : 0,
    };
  });
  const comparacaoMunicipiosComDados = comparacaoMunicipios.filter((item) => item.total > 0);
  const dadosPizza = [
    { nome: 'Aprovadas', valor: aprovados, cor: '#16835d' },
    { nome: 'Reprovadas', valor: reprovados, cor: '#c47a19' },
    { nome: 'Interditadas', valor: interditados, cor: '#c44f45' },
    { nome: 'Sem classificação', valor: semClassificacao, cor: '#9aa39b' },
  ];
  const dadosDistribuicaoBarra = dadosPizza.map((item) => ({
    ...item,
    taxa: total ? (item.valor / total) * 100 : 0,
  }));
  const dadosPizzaVale = [
    { nome: 'Aprovadas', valor: aprovadosVale, cor: '#16835d' },
    { nome: 'Reprovadas', valor: reprovadosVale, cor: '#c47a19' },
    { nome: 'Interditadas', valor: interditadosVale, cor: '#c44f45' },
  ];
  const inicio = pagina * pageSize;
  const paginas = Math.max(1, Math.ceil(registrosAuditoria.length / pageSize));
  const registrosPagina = registrosAuditoria.slice(inicio, inicio + pageSize);
  const primeiroRegistro = data.map((item) => parseDate(item.DATA_VERIFICACAO)).filter((date): date is Date => Boolean(date)).sort((a, b) => a.getTime() - b.getTime())[0];
  const ultimoRegistro = data.map((item) => parseDate(item.DATA_VERIFICACAO)).filter((date): date is Date => Boolean(date)).sort((a, b) => b.getTime() - a.getTime())[0];

  if (loading) return <main className="loading">Carregando dados do IPEM-SP...</main>;

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
        <div className="filterbar">
          <label className="search-field">
            <Search size={17} />
            <span className="sr-only">Filtrar município</span>
            <input value={municipioFiltro} onChange={(event) => { setMunicipioFiltro(event.target.value); setPagina(0); }} placeholder="Buscar município" />
          </label>
          <div className="municipality-guide">
            <button className="guide-button" aria-expanded={mostrarMunicipios} onClick={() => setMostrarMunicipios(!mostrarMunicipios)}>
              <MapPin size={15} /> Municípios <ChevronDown size={14} />
            </button>
            {mostrarMunicipios && <div className="municipality-popover">
              <div className="popover-heading"><strong>Municípios disponíveis</strong><span>{municipiosUnicos.length}</span></div>
              <p>Selecione um nome para aplicar o filtro.</p>
              <div className="municipality-list">
                {municipiosUnicos.map((municipio) => <button key={municipio} onClick={() => { setMunicipioFiltro(municipio); setPagina(0); setMostrarMunicipios(false); }}>{municipio}</button>)}
              </div>
            </div>}
          </div>
          <label className="year-field">
            <span className="sr-only">Filtrar ano</span>
            <select value={anoFiltro} onChange={(event) => { setAnoFiltro(event.target.value); setPagina(0); }}>
              <option>Todos</option>
              {anos.map((ano) => <option key={ano}>{ano}</option>)}
            </select>
          </label>
          {(municipioFiltro || anoFiltro !== 'Todos') && <button className="clear-button" onClick={() => { setMunicipioFiltro(''); setAnoFiltro('Todos'); setPagina(0); }}>Limpar</button>}
        </div>
      </header>

      {loadError && <div className="notice notice-warn"><TriangleAlert size={17} />{loadError}</div>}
     
      <section className="summary-line">
        <div>
          <p className="eyebrow">VISÃO GERAL {municipioFiltro || anoFiltro !== 'Todos' ? '· RECORTE APLICADO' : '· BASE COMPLETA'}</p>
          <h2>Resultado das verificações</h2>
        </div>
        <p className="scope-note">{formatNumber(total)} bombas · {formatNumber(municipios)} municípios</p>
      </section>

      <section className="kpi-grid" aria-label="Indicadores principais">
        <article className="kpi kpi-green">
          <div className="kpi-top"><span>Taxa de aprovação</span><ShieldCheck size={19} /></div>
          <strong>{percent(aprovados, total)}</strong>
          <small>{formatNumber(aprovados)} bombas aprovadas</small>
        </article>
        <article className="kpi kpi-amber">
          <div className="kpi-top"><span>Taxa de reprovação</span><AlertTriangle size={19} /></div>
          <strong>{percent(reprovados, total)}</strong>
          <small>{formatNumber(reprovados)} bombas reprovadas</small>
        </article>
        <article className="kpi kpi-red">
          <div className="kpi-top"><span>Interdições</span><Ban size={19} /></div>
          <strong>{formatNumber(interditados)}</strong>
          <small>{percent(interditados, total)} das verificações</small>
        </article>
        <article className="kpi kpi-ink">
          <div className="kpi-top"><span>Bombas verificadas</span><ClipboardCheck size={19} /></div>
          <strong>{formatNumber(total)}</strong>
          <small>{municipioFiltro || 'Todos os municípios'}</small>
        </article>
      </section>

      <section className="chart-grid">
        <article className="panel trend-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">EVOLUÇÃO NO TEMPO</p><h3>Taxas por mês</h3></div>
            <div className="legend"><span><i className="legend-green" />Aprovação</span><span><i className="legend-amber" />Reprovação</span><span><i className="legend-red" />Interdições</span></div>
          </div>
          {tendencia.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={tendencia} margin={{ top: 8, right: 16, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="#e7e9e5" vertical={false} />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: '#737a74', fontSize: 12 }} />
              <YAxis yAxisId="taxa" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#737a74', fontSize: 12 }} tickFormatter={(value: number) => `${value}%`} />
              <YAxis yAxisId="quantidade" orientation="right" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#737a74', fontSize: 11 }} />
              <Tooltip formatter={(value, name) => name === 'Interdições' ? formatNumber(Number(value)) : `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`} />
              <Line yAxisId="taxa" type="monotone" dataKey="aprovacao" name="Aprovação" stroke="#16835d" strokeWidth={2.5} dot={false} />
              <Line yAxisId="taxa" type="monotone" dataKey="reprovacao" name="Reprovação" stroke="#c47a19" strokeWidth={2.5} dot={false} />
              <Line yAxisId="quantidade" type="monotone" dataKey="interdicoes" name="Interdições" stroke="#c44f45" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer></div> : <p className="empty-state">Não há datas válidas para montar a série histórica.</p>}
        </article>

        <article className="panel pie-panel">
          <div className="panel-heading"><div><p className="eyebrow">DISTRIBUIÇÃO GERAL</p><h3>{graficoDistribuicao === 'pie' ? 'Resultados · composição' : 'Resultados · comparação'}</h3></div></div>
          <div className="distribution-layout">
            <div className="distribution-visual">
              {graficoDistribuicao === 'pie' ? <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={dadosPizza} dataKey="valor" nameKey="nome" innerRadius={48} outerRadius={76} paddingAngle={0} stroke="none">
                  {dadosPizza.map((entry) => <Cell key={entry.nome} fill={entry.cor} />)}
                </Pie><Tooltip formatter={(value) => formatNumber(Number(value))} /></PieChart>
              </ResponsiveContainer> : <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosDistribuicaoBarra} layout="vertical" margin={{ top: 3, right: 10, left: 0, bottom: 3 }}>
                  <CartesianGrid stroke="#e7e9e5" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} tickLine={false} axisLine={false} tick={{ fill: '#737a74', fontSize: 9 }} />
                  <YAxis type="category" dataKey="nome" width={86} tickLine={false} axisLine={false} tick={{ fill: '#4f5650', fontSize: 9 }} />
                  <Tooltip formatter={(value, _name, item) => [`${formatNumber(Number(item.payload.valor))} bombas · ${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`, 'Resultado']} />
                  <Bar dataKey="taxa" name="Taxa" radius={[0, 3, 3, 0]} barSize={13}>
                    {dadosDistribuicaoBarra.map((entry) => <Cell key={entry.nome} fill={entry.cor} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>}
            </div>
            <div className="distribution-controls" role="group" aria-label="Tipo de gráfico da distribuição">
              <button type="button" className={graficoDistribuicao === 'pie' ? 'is-active' : ''} aria-label="Gráfico de pizza" aria-pressed={graficoDistribuicao === 'pie'} title="Gráfico de pizza" onClick={() => setGraficoDistribuicao('pie')}><ChartPie size={17} /></button>
              <button type="button" className={graficoDistribuicao === 'bar' ? 'is-active' : ''} aria-label="Gráfico de barras" aria-pressed={graficoDistribuicao === 'bar'} title="Gráfico de barras" onClick={() => setGraficoDistribuicao('bar')}><ChartNoAxesColumnIncreasing size={17} /></button>
            </div>
          </div>
          <div className="pie-legend">{dadosPizza.map((item) => <div key={item.nome}><span><i style={{ backgroundColor: item.cor }} />{item.nome}</span><strong>{formatNumber(item.valor)} <small>{percent(item.valor, total)}</small></strong></div>)}</div>
        </article>
      </section>

      <section className="panel region-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">RECORTE TERRITORIAL</p><h3>Vale do Paraíba · {graficoRegional === 'rates' ? 'taxas' : graficoRegional === 'results' ? 'resultados' : 'municípios'}</h3></div>
          <span className="count-pill region-pill">{formatNumber(totalVale)} bombas · {municipiosValeEncontrados} municípios</span>
        </div>
        {totalVale ? <div className="region-content">
          <div className="region-switcher" role="group" aria-label="Gráficos do Vale do Paraíba">
            <button type="button" className={graficoRegional === 'rates' ? 'is-active' : ''} aria-label="Taxas de conformidade" aria-pressed={graficoRegional === 'rates'} title="Taxas de conformidade" onClick={() => setGraficoRegional('rates')}><ChartNoAxesColumnIncreasing size={17} /></button>
            <button type="button" className={graficoRegional === 'results' ? 'is-active' : ''} aria-label="Composição dos resultados" aria-pressed={graficoRegional === 'results'} title="Composição dos resultados" onClick={() => setGraficoRegional('results')}><ChartPie size={17} /></button>
            <button type="button" className={graficoRegional === 'municipalities' ? 'is-active' : ''} aria-label="Volume por município" aria-pressed={graficoRegional === 'municipalities'} title="Volume por município" onClick={() => setGraficoRegional('municipalities')}><MapPin size={17} /></button>
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
                <YAxis type="category" dataKey="nome" width={118} tickLine={false} axisLine={false} tick={{ fill: '#4f5650', fontSize: 10 }} />
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
            <button type="button" className="collapse-toggle" aria-expanded={municipiosValeExpandido} onClick={() => setMunicipiosValeExpandido(!municipiosValeExpandido)}>
              {municipiosValeExpandido ? 'Recolher' : 'Mostrar lista'}<ChevronDown size={15} />
            </button>
          </div>
        </div>
        {municipiosValeExpandido && <div className="table-scroll">
          <table className="region-list-table">
            <thead><tr><th>Município</th><th>Bombas</th><th>Aprovação</th><th>Reprovação</th><th>Interdições</th></tr></thead>
            <tbody>{dadosMunicipioVale.map((item) => <tr key={item.nome}>
              <td>{item.nome}</td>
              {item.total ? <><td>{formatNumber(item.total)}</td><td className="good-text">{percent(item.aprovados, item.total)}</td><td className="warn-text">{percent(item.reprovados, item.total)}</td><td className="danger-text">{formatNumber(item.interditados)}</td></> : <><td className="no-data-cell">Sem dados</td><td className="no-data-cell">Sem dados</td><td className="no-data-cell">Sem dados</td><td className="no-data-cell">Sem dados</td></>}
            </tr>)}</tbody>
          </table>
        </div>}
      </section>

      <section className="panel municipality-comparison-panel">
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
                setMunicipiosComparacao((atual) => [...atual, municipioComparacaoSelecionado]);
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
              <button type="button" aria-label={`Remover ${municipio} da comparação`} onClick={() => setMunicipiosComparacao((atual) => atual.filter((item) => item !== municipio))}><X size={14} /></button>
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

      <section className="panel ranking-panel">
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
                <button type="button" className="sort-remove-button" onClick={() => setOrdenacaoRanking((atual) => atual.filter((item) => item.key !== criterio.key))} aria-label={`Remover ${rankingSortOptions.find((opcao) => opcao.key === criterio.key)?.label}`}><X size={13} /></button>
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
                setOrdenacaoRanking((atual) => [...atual, { key, direction: key === 'municipio' ? 'asc' : 'desc' }]);
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

      <section className="panel interdiction-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">CASOS GRAVES</p><h3>Bombas interditadas <span className="count-pill">{formatNumber(listaInterdicoesFiltrada.length)} / {formatNumber(listaInterdicoes.length)}</span></h3></div>
          <div className="table-tools">
            <label className="search-field compact-search"><Search size={15} /><span className="sr-only">Buscar interdições</span><input value={buscaInterdicoes} onChange={(event) => setBuscaInterdicoes(event.target.value)} placeholder="Município, posto ou bomba" /></label>
            <button type="button" className="collapse-toggle" aria-expanded={interdicoesExpandidas} onClick={() => setInterdicoesExpandidas(!interdicoesExpandidas)}>
              {interdicoesExpandidas ? 'Recolher' : 'Mostrar lista'}<ChevronDown size={15} />
            </button>
          </div>
        </div>
        {interdicoesExpandidas && <div className="table-scroll">
          <table>
            <thead><tr><th>Município</th><th>Data</th><th>Posto / proprietário</th><th>Marca e modelo</th><th>Nº Inmetro</th><th>Motivo registrado</th></tr></thead>
            <tbody>{listaInterdicoesFiltrada.slice(0, 100).map((item, index) => <tr key={`${item.NUMERO_INMETRO}-${index}`}>
              <td>{item.MUNICIPIO}</td><td>{item.DATA_VERIFICACAO || '—'}</td><td>{item.PROPRIETARIO || '—'}</td><td>{[item.MARCA, item.MODELO].filter(Boolean).join(' · ') || '—'}</td><td>{item.NUMERO_INMETRO || '—'}</td><td className="missing-cell">Não consta na base</td>
            </tr>)}</tbody>
          </table>
          {!listaInterdicoesFiltrada.length && <p className="empty-state">Nenhuma interdição corresponde à busca.</p>}
          {listaInterdicoesFiltrada.length > 100 && <p className="table-note">Exibindo as primeiras 100 interdições; refine a busca para localizar outras.</p>}
        </div>}
      </section>

      <section className="panel audit-panel">
        <div className="panel-heading audit-heading">
          <div><p className="eyebrow">RASTREABILIDADE</p><h3>Conferência com os registros da fonte</h3></div>
          <div className="table-tools">
            <label className="search-field compact-search"><Search size={15} /><span className="sr-only">Buscar nos registros</span><input value={buscaAuditoria} onChange={(event) => { setBuscaAuditoria(event.target.value); setPagina(0); }} placeholder="Município, resultado ou Inmetro" /></label>
            <span className="count-pill region-pill">{formatNumber(registrosAuditoria.length)} registros</span>
            <span className="source-tag"><Check size={15} /> CSV carregado</span>
            <button type="button" className="collapse-toggle" aria-expanded={auditoriaExpandida} onClick={() => setAuditoriaExpandida(!auditoriaExpandida)}>
              {auditoriaExpandida ? 'Recolher' : 'Mostrar lista'}<ChevronDown size={15} />
            </button>
          </div>
        </div>
        {auditoriaExpandida && <>
        <div className="audit-summary">
          <span>Registros no recorte <strong>{formatNumber(total)}</strong></span>
          <span>Período da base <strong>{primeiroRegistro?.toLocaleDateString('pt-BR')} – {ultimoRegistro?.toLocaleDateString('pt-BR')}</strong></span>
          <span>Sem classificação <strong>{formatNumber(filtrados.filter((item) => getStatus(item) === 'Sem classificação').length)}</strong></span>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Município</th><th>Data</th><th>Resultado</th><th>Status consolidado</th><th>Posto / proprietário</th><th>Nº Inmetro</th></tr></thead>
            <tbody>{registrosPagina.map((item, index) => <tr key={`${item.NUMERO_INMETRO}-${item.DATA_VERIFICACAO}-${inicio + index}`}>
              <td>{item.MUNICIPIO}</td><td>{item.DATA_VERIFICACAO || '—'}</td><td>{item.RESULTADO || '—'}</td><td><span className={`status status-${getStatus(item).toLocaleLowerCase('pt-BR').replaceAll(' ', '-')}`}>{getStatus(item)}</span></td><td>{item.PROPRIETARIO || '—'}</td><td>{item.NUMERO_INMETRO || '—'}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Exibindo {registrosAuditoria.length ? formatNumber(inicio + 1) : 0}–{formatNumber(Math.min(inicio + pageSize, registrosAuditoria.length))} de {formatNumber(registrosAuditoria.length)}</span>
          <div><button disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>Anterior</button><span>Página {pagina + 1} de {paginas}</span><button disabled={pagina + 1 >= paginas} onClick={() => setPagina(pagina + 1)}>Próxima</button></div>
        </div>
        </>}
      </section>

      <footer className="footer-note"><Fuel size={15} /> Fonte: dados_bombas_tratados.csv · {primeiroRegistro && ultimoRegistro ? `Período disponível: ${primeiroRegistro.toLocaleDateString('pt-BR')} a ${ultimoRegistro.toLocaleDateString('pt-BR')}` : 'Datas não disponíveis'} · Aprovação/reprovação calculadas sobre o total de bombas no recorte.</footer>
    </main>
  );
}