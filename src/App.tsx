import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { ShieldCheck, AlertTriangle, Ban, Fuel, Search, HelpCircle, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
}

export default function App() {
  const [data, setData] = useState<BombaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [municipioFiltro, setMunicipioFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Papa.parse<BombaData>('/dados_bombas_tratados.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      },
    });
  }, []);

  // Listapara o botão de Ajuda
  const municipiosUnicos = Array.from(
    new Set(data.map((item) => item.MUNICIPIO).filter(Boolean))
  ).sort();

  // Filtro por Município
  const dadosFiltrados = municipioFiltro
    ? data.filter((item) =>
        item.MUNICIPIO?.toLowerCase().includes(municipioFiltro.toLowerCase())
      )
    : data;

  // Métricas / KPIs
  const totalBombas = dadosFiltrados.length;
  const aprovados = dadosFiltrados.filter((d) => d.RESULTADO?.includes('APROV')).length;
  const reprovados = dadosFiltrados.filter((d) => d.RESULTADO?.includes('REPROV')).length;
  const interditados = dadosFiltrados.filter((d) => d.RESULTADO?.includes('INTERD')).length;
  const totalAutuacoes = reprovados + interditados;
  const taxaAprovacao = totalBombas > 0 ? ((aprovados / totalBombas) * 100).toFixed(2) : '0';

  // Dados para o Gráfico de Status
  const chartStatusData = [
    { name: 'Aprovados', quantidade: aprovados, fill: '#10B981' },
    { name: 'Reprovados', quantidade: reprovados, fill: '#F59E0B' },
    { name: 'Interditados', quantidade: interditados, fill: '#EF4444' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <h2>Carregando dados do IPEM-SP...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Fuel color="#2563eb" size={32} /> Combustível na Medida - IPEM-SP
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>Painel de Transparência e Fiscalização de Bombas Medidoras</p>
        </div>

        {/* Campo de Filtro + Botão Ajuda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '8px 16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Search size={18} color="#9ca3af" />
            <input
              type="text"
              placeholder="Filtrar por Município..."
              value={municipioFiltro}
              onChange={(e) => setMunicipioFiltro(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: 'transparent',
                color: '#111827'
              }}
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            <HelpCircle size={18} /> Ajuda
          </button>
        </div>
      </header>

      {/* Cards de KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
            <span>Total Periciadas</span>
            <Fuel size={20} color="#2563eb" />
          </div>
          <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', color: '#111827' }}>{totalBombas.toLocaleString()}</h2>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
            <span>Taxa de Aprovação</span>
            <ShieldCheck size={20} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', color: '#10b981' }}>{taxaAprovacao}%</h2>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
            <span>Total Autuações</span>
            <AlertTriangle size={20} color="#f59e0b" />
          </div>
          <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', color: '#ef4444' }}>{totalAutuacoes.toLocaleString()}</h2>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
            <span>Interdições</span>
            <Ban size={20} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', color: '#ef4444' }}>{interditados.toLocaleString()}</h2>
        </div>
      </div>

      {/* Gráfico de Status */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>Status das Inspeções</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal de Ajuda com lista de Municípios */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', width: '90%', maxWidth: '500px', maxHeight: '80vh', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#111827' }}>Municípios Disponíveis ({municipiosUnicos.length})</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>Clique em qualquer município abaixo para aplicar o filtro diretamente:</p>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {municipiosUnicos.map((mun) => (
                  <button
                    key={mun}
                    onClick={() => {
                      setMunicipioFiltro(mun);
                      setShowModal(false);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151'
                    }}
                  >
                    {mun}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}