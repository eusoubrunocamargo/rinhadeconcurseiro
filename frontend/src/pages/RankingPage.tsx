import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Ranking, RankingItem, Simulado } from '../types';
import { getRankingGeral, getRankingPorSimulado } from '../services/ranking';
import { getSimulados } from '../services/simulado';
import Layout from '../components/layout/Layout';

type TabType = 'geral' | 'simulado';

export default function RankingPage() {
  const [tab, setTab] = useState<TabType>('geral');
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [simuladoSelecionado, setSimuladoSelecionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSimulados();
  }, []);

  useEffect(() => {
    if (tab === 'geral') {
      loadRankingGeral();
    } else if (simuladoSelecionado) {
      loadRankingSimulado(simuladoSelecionado);
    }
  }, [tab, simuladoSelecionado]);

  async function loadSimulados() {
    try {
      const data = await getSimulados();
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const disponiveis = data
        .filter((s) => new Date(s.dataDisponivel + 'T00:00:00') <= hoje)
        .sort((a, b) => a.numero - b.numero);
      setSimulados(disponiveis);
    } catch {
      console.error('Erro ao carregar simulados');
    }
  }

  async function loadRankingGeral() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRankingGeral();
      setRanking(data);
    } catch {
      setError('Erro ao carregar ranking.');
    } finally {
      setLoading(false);
    }
  }

  async function loadRankingSimulado(simuladoId: number) {
    try {
      setLoading(true);
      setError(null);
      const data = await getRankingPorSimulado(simuladoId);
      setRanking(data);
    } catch {
      setError('Erro ao carregar ranking.');
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(newTab: TabType) {
    setTab(newTab);
    if (newTab === 'simulado' && !simuladoSelecionado && simulados.length > 0) {
      setSimuladoSelecionado(simulados[0].id);
    }
  }

  const top3 = ranking?.ranking.slice(0, 3) ?? [];
  const resto = ranking?.ranking.slice(3) ?? [];

  return (
    <Layout>

      {/* ── Header ── */}
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-widest text-subtle-text mb-1">
          Câmara dos Deputados · CEBRASPE
        </p>
        <h1 className="text-2xl font-black text-dark-text tracking-tight">Rankings</h1>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-6"
        style={{ backgroundColor: '#F5F5F5' }}
      >
        {(['geral', 'simulado'] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            style={
              tab === t
                ? { backgroundColor: '#1A1A1A', color: '#fff' }
                : { backgroundColor: 'transparent', color: '#999' }
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {t === 'geral' ? 'leaderboard' : 'edit_note'}
            </span>
            {t === 'geral' ? 'Geral' : 'Por Simulado'}
          </button>
        ))}
      </div>

      {/* ── Seletor de simulado ── */}
      {tab === 'simulado' && (
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-subtle-text mb-2 px-1">
            Selecione o simulado
          </p>
          <select
            value={simuladoSelecionado ?? ''}
            onChange={(e) => setSimuladoSelecionado(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-dark-text appearance-none outline-none"
            style={{ backgroundColor: '#fff', border: '1px solid #E5E5E5' }}
          >
            {simulados.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titulo}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Minha posição ── */}
      {ranking?.currentUserPosition && (
        <div
          className="flex items-center gap-4 px-5 py-4 rounded-[28px] mb-5"
          style={{ backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5' }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#1A1A1A' }}
          >
            <span className="text-xs font-black text-white">
              {ranking.currentUserPosition.posicao}º
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-subtle-text mb-0.5">
              Sua posição
            </p>
            <p className="text-sm font-black text-dark-text truncate">
              {ranking.currentUserPosition.apelido || ranking.currentUserPosition.nome}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-black text-dark-text">
              {ranking.currentUserPosition.pontuacao} pts
            </p>
            <p className="text-[10px] font-bold" style={{ color: '#999' }}>
              {ranking.currentUserPosition.percentualAcerto.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Erro ── */}
      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-medium mb-4"
          style={{ backgroundColor: '#FFF5F5', color: '#DC2626', border: '1px solid #FECACA' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
          {error}
        </div>
      )}

      {/* ── Lista ── */}
      {!loading && ranking && (
        <div className="flex flex-col gap-5">

          {/* Info */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-subtle-text px-1">
            {ranking.totalParticipantes} participante{ranking.totalParticipantes !== 1 ? 's' : ''}
            {ranking.simuladoTitulo && ` · ${ranking.simuladoTitulo}`}
          </p>

          {ranking.ranking.length === 0 ? (
            <div
              className="bg-white rounded-[28px] p-10 flex flex-col items-center gap-3"
              style={{ border: '1px solid #E5E5E5' }}
            >
              <span className="material-symbols-outlined text-subtle-text" style={{ fontSize: '40px' }}>
                leaderboard
              </span>
              <p className="text-sm font-bold text-dark-text">Nenhum participante ainda</p>
              <Link
                to="/simulados"
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: '#FF4D4D' }}
              >
                Seja o primeiro →
              </Link>
            </div>
          ) : (
            <>
              {/* Top 3 */}
              {top3.length > 0 && (
                <div className="flex flex-col gap-2">
                  {top3.map((item) => (
                    <RankingRow key={item.usuarioId} item={item} tipo={ranking.tipo} destaque />
                  ))}
                </div>
              )}

              {/* Demais posições */}
              {resto.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {resto.map((item) => (
                    <RankingRow key={item.usuarioId} item={item} tipo={ranking.tipo} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Layout>
  );
}

// ── RankingRow ──────────────────────────────────────────────────────────────

const MEDAL_CONFIG: Record<number, { bg: string; cor: string; border: string; icon: string }> = {
  1: { bg: '#FFFBEB', cor: '#D97706', border: '#FDE68A', icon: 'workspace_premium' },
  2: { bg: '#F5F5F5', cor: '#666',    border: '#E5E5E5', icon: 'military_tech'      },
  3: { bg: '#FFF7ED', cor: '#C2752A', border: '#FED7AA', icon: 'stars'              },
};

function RankingRow({
  item,
  tipo,
  destaque = false,
}: {
  item: RankingItem;
  tipo: 'SIMULADO' | 'GERAL';
  destaque?: boolean;
}) {
  const medal = MEDAL_CONFIG[item.posicao];
  const isTop3 = item.posicao <= 3;

  const posStyle = isTop3
    ? { bg: medal.bg, cor: medal.cor, border: medal.border }
    : { bg: '#F5F5F5', cor: '#999', border: '#EEEEEE' };

  const cardBorder = item.isCurrentUser
    ? '1.5px solid #1A1A1A'
    : destaque
    ? `1px solid ${posStyle.border}`
    : '1px solid #E5E5E5';

  return (
    <div
      className="bg-white rounded-[28px] overflow-hidden"
      style={{ border: cardBorder }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">

        {/* Posição / medalha */}
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: posStyle.bg, border: `1px solid ${posStyle.border}` }}
        >
          {isTop3 ? (
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: posStyle.cor }}>
              {medal.icon}
            </span>
          ) : (
            <span className="text-xs font-black" style={{ color: posStyle.cor }}>
              {item.posicao}º
            </span>
          )}
        </div>

        {/* Avatar */}
        {item.fotoUrl ? (
          <img
            src={item.fotoUrl}
            alt={item.nome}
            className="w-9 h-9 rounded-full object-cover shrink-0"
            style={{ border: '1.5px solid #E5E5E5' }}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
            style={{ backgroundColor: '#F5F5F5', color: '#1A1A1A' }}
          >
            {(item.apelido || item.nome).charAt(0).toUpperCase()}
          </div>
        )}

        {/* Nome */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-dark-text truncate">
              {item.apelido || item.nome}
            </p>
            {item.isCurrentUser && (
              <span
                className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#F5F5F5', color: '#1A1A1A' }}
              >
                Você
              </span>
            )}
          </div>
          {tipo === 'GERAL' && (
            <p className="text-[10px] mt-0.5" style={{ color: '#999' }}>
              {item.simuladosFinalizados} simulado{item.simuladosFinalizados !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Stats — desktop */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          {[
            { cor: '#059669', valor: item.acertos  },
            { cor: '#DC2626', valor: item.erros     },
            { cor: '#CCCCCC', valor: item.emBranco  },
          ].map(({ cor, valor }, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cor }} />
              <span className="text-xs font-bold" style={{ color: '#999' }}>{valor}</span>
            </div>
          ))}
        </div>

        {/* Pontuação */}
        <div className="text-right shrink-0">
          <p
            className="text-sm font-black"
            style={{ color: item.pontuacao >= 0 ? '#1A1A1A' : '#DC2626' }}
          >
            {item.pontuacao} pts
          </p>
          <p className="text-[10px] font-bold" style={{ color: '#999' }}>
            {item.percentualAcerto.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Stats — mobile */}
      <div
        className="flex sm:hidden items-center gap-4 text-[10px] font-bold px-4 pb-3"
        style={{ color: '#999' }}
      >
        {[
          { cor: '#059669', label: `${item.acertos} acertos`  },
          { cor: '#DC2626', label: `${item.erros} erros`      },
          { cor: '#CCCCCC', label: `${item.emBranco} em branco` },
        ].map(({ cor, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cor }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
