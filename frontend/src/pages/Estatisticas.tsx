import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import type { EstatisticaAssunto } from '../types';
import { getEstatisticasAssuntos } from '../services/tentativa';

const TIER_CONFIG = {
  DOMINIO: { label: 'Domínio',  cor: '#059669', bgCor: '#ecfdf5', icon: 'emoji_events'  },
  ATENCAO: { label: 'Atenção',  cor: '#D97706', bgCor: '#fffbeb', icon: 'info'          },
  CRITICO: { label: 'Crítico',  cor: '#DC2626', bgCor: '#fef2f2', icon: 'warning'       },
} as const;

export default function Estatisticas() {
  const [estatisticas, setEstatisticas] = useState<EstatisticaAssunto[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [materiaAtiva, setMateriaAtiva] = useState<string>('TODAS');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getEstatisticasAssuntos();
        setEstatisticas(data);
      } catch {
        setError('Não foi possível carregar as estatísticas.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Lista de matérias únicas para as abas
  const materias = ['TODAS', ...Array.from(new Set(estatisticas.map(e => e.materiaNome))).sort()];

  const assuntosFiltrados = materiaAtiva === 'TODAS'
    ? estatisticas
    : estatisticas.filter(e => e.materiaNome === materiaAtiva);

  // Contadores para o resumo do topo
  const totalAssuntos  = estatisticas.length;
  const totalDominio   = estatisticas.filter(e => e.tier === 'DOMINIO').length;
  const totalCritico   = estatisticas.filter(e => e.tier === 'CRITICO').length;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/"
              className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-60"
              style={{ color: '#999' }}
            >
              Dashboard
            </Link>
            <span className="text-[10px]" style={{ color: '#CCC' }}>›</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-dark-text">
              Estatísticas
            </span>
          </div>
          <h1 className="text-2xl font-black text-dark-text tracking-tight">
            Desempenho por Assunto
          </h1>
          <p className="text-xs mt-1" style={{ color: '#999' }}>
            Baseado em acertos conscientes e com dúvida — chutes não contam.
          </p>
        </div>

        {/* Cards de resumo */}
        {!loading && estatisticas.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <ResumoCard value={totalAssuntos} label="Assuntos" cor="#555" bgCor="#F5F5F5" />
            <ResumoCard value={totalDominio}  label="Domínio"  cor="#059669" bgCor="#ecfdf5" />
            <ResumoCard value={totalCritico}  label="Crítico"  cor="#DC2626" bgCor="#fef2f2" />
          </div>
        )}

        {/* Abas por matéria */}
        {!loading && materias.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {materias.map(m => (
              <button
                key={m}
                onClick={() => setMateriaAtiva(m)}
                className="shrink-0 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full transition-all"
                style={
                  materiaAtiva === m
                    ? { backgroundColor: '#1A1A1A', color: '#FFF' }
                    : { backgroundColor: '#F0F0F0', color: '#888' }
                }
              >
                {m === 'TODAS' ? 'Todas' : m}
              </button>
            ))}
          </div>
        )}

        {/* Estados */}
        {error && (
          <div className="bg-red-50 p-4 rounded-2xl text-sm text-red-600" style={{ border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-[20px] animate-pulse" style={{ backgroundColor: '#F5F5F5' }} />
            ))}
          </div>
        )}

        {/* Lista de assuntos */}
        {!loading && assuntosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm font-bold text-dark-text mb-1">Nenhum assunto ainda</p>
            <p className="text-xs" style={{ color: '#999' }}>Complete simulados para ver seu desempenho aqui.</p>
            <Link
              to="/simulados"
              className="inline-block mt-5 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl text-white"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              Ir para Simulados →
            </Link>
          </div>
        )}

        {!loading && assuntosFiltrados.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {assuntosFiltrados.map(e => (
              <AssuntoCard key={e.assuntoId} item={e} />
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function ResumoCard({
  value, label, cor, bgCor,
}: {
  value: number; label: string; cor: string; bgCor: string;
}) {
  return (
    <div
      className="rounded-[20px] px-4 py-3 flex flex-col gap-0.5"
      style={{ backgroundColor: bgCor, border: `1px solid ${bgCor}` }}
    >
      <span className="text-2xl font-black" style={{ color: cor }}>{value}</span>
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: cor, opacity: 0.7 }}>
        {label}
      </span>
    </div>
  );
}

function AssuntoCard({ item }: { item: EstatisticaAssunto }) {
  const config = TIER_CONFIG[item.tier];

  return (
    <div
      className="bg-white rounded-[20px] px-5 py-4"
      style={{ border: '1px solid #E5E5E5' }}
    >
      {/* Linha superior */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-dark-text leading-tight">{item.assuntoNome}</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#999' }}>{item.materiaNome}</p>
        </div>

        {/* Badge tier + percentual */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
            style={{ backgroundColor: config.bgCor, color: config.cor }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>
              {config.icon}
            </span>
            {config.label}
          </span>
          <span className="text-lg font-black" style={{ color: config.cor }}>
            {item.percentual.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: '#F0F0F0' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(item.percentual, 1)}%`, backgroundColor: config.cor }}
        />
      </div>

      {/* Legenda */}
      <p className="text-[10px]" style={{ color: '#BBBBBB' }}>
        {item.total} questões respondidas
        {' · '}
        <span style={{ color: '#059669' }}>{item.acertos} acertos</span>
        {' · '}
        <span style={{ color: '#DC2626' }}>{item.erros} erros</span>
      </p>
    </div>
  );
}