import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Simulado, TentativaResumo } from '../types';
import { getSimulados } from '../services/simulado';
import { getSimuladosEmAndamento, getSimuladosFinalizados } from '../services/tentativa';
import Layout from '../components/layout/Layout';
import api from '../services/api';

// ── Tipos ────────────────────────────────────────────────────────

interface SimuladoStats {
  simuladoId: number;
  totalFinalizados: number;
  mediaDesempenho: number;
}

// ── Página ───────────────────────────────────────────────────────

export default function SimuladosList() {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [emAndamento, setEmAndamento] = useState<Map<number, TentativaResumo>>(new Map());
  const [finalizados, setFinalizados] = useState<Map<number, TentativaResumo[]>>(new Map());
  const [stats, setStats] = useState<Map<number, SimuladoStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => { loadDados(); }, []);

  const isDisponivel = useCallback((dataDisponivel: string): boolean => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return new Date(dataDisponivel + 'T00:00:00') <= hoje;
  }, []);

  const loadDados = useCallback(async () => {
    
    try {
      setLoading(true);
      const [simuladosData, emAndamentoData, finalizadosData] = await Promise.all([
        getSimulados(),
        getSimuladosEmAndamento(),
        getSimuladosFinalizados(),
      ]);

      simuladosData.sort((a, b) => a.numero - b.numero);
      setSimulados(simuladosData);

      const mapaEmAndamento = new Map<number, TentativaResumo>();
      emAndamentoData.forEach(t => mapaEmAndamento.set(t.simuladoId, t));
      setEmAndamento(mapaEmAndamento);

      const mapaFinalizados = new Map<number, TentativaResumo[]>();
      finalizadosData.forEach(t => {
        const lista = mapaFinalizados.get(t.simuladoId) ?? [];
        lista.push(t);
        mapaFinalizados.set(t.simuladoId, lista);
      });
      setFinalizados(mapaFinalizados);

      // Buscar stats de todos os simulados disponíveis em paralelo
      const disponiveis = simuladosData.filter(s => isDisponivel(s.dataDisponivel));
      const statsResults = await Promise.all(
        disponiveis.map(s =>
          api.get<SimuladoStats>(`/api/v1/simulados/${s.id}/stats`).then(r => r.data)
        )
      );
      const mapaStats = new Map<number, SimuladoStats>();
      statsResults.forEach(s => mapaStats.set(s.simuladoId, s));
      setStats(mapaStats);

    } catch {
      setError('Erro ao carregar simulados.');
    } finally {
      setLoading(false);
    }
  }, [isDisponivel]);

  useEffect(() => {
    loadDados();
  }, [loadDados]);

  function diasAteDisponivel(dataDisponivel: string): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diff = new Date(dataDisponivel + 'T00:00:00').getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const disponiveis = simulados.filter(s => isDisponivel(s.dataDisponivel));
  const futuros = simulados.filter(s => !isDisponivel(s.dataDisponivel));

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Header */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-subtle-text mb-1">
            Câmara dos Deputados · CEBRASPE
          </p>
          <h1 className="text-2xl font-black text-dark-text tracking-tight">Simulados</h1>
        </div>

        {/* Erro */}
        {error && (
          <div
            className="p-4 rounded-2xl text-sm"
            style={{ backgroundColor: '#fef2f2', color: '#DC2626', border: '1px solid #fecaca' }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-[28px] animate-pulse"
                style={{ backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5' }}
              />
            ))}
          </div>
        )}

        {/* Disponíveis */}
        {!loading && disponiveis.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-dark-text px-1">
              Disponíveis · {disponiveis.length}
            </p>
            {disponiveis.map(simulado => {
              const emAnd = emAndamento.get(simulado.id);
              const finalizados_ = finalizados.get(simulado.id) ?? [];
              const melhor = finalizados_.length > 0
                ? finalizados_.reduce((m, a) => (a.pontuacao ?? 0) > (m.pontuacao ?? 0) ? a : m)
                : null;
              const statsCard = stats.get(simulado.id);

              return (
                <SimuladoCard
                  key={simulado.id}
                  simulado={simulado}
                  emAndamento={emAnd ?? null}
                  melhorTentativa={melhor}
                  stats={statsCard ?? null}
                />
              );
            })}
          </div>
        )}

        {/* Futuros */}
        {!loading && futuros.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-dark-text px-1">
              Em breve · {futuros.length}
            </p>
            {futuros.map(simulado => (
              <SimuladoFuturoCard
                key={simulado.id}
                simulado={simulado}
                dias={diasAteDisponivel(simulado.dataDisponivel)}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && simulados.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm font-bold text-dark-text mb-1">Nenhum simulado disponível</p>
            <p className="text-xs" style={{ color: '#999' }}>Volte em breve.</p>
          </div>
        )}

      </div>
    </Layout>
  );
}

// ── SimuladoCard ─────────────────────────────────────────────────

function SimuladoCard({
  simulado,
  emAndamento,
  melhorTentativa,
  stats,
}: {
  simulado: Simulado;
  emAndamento: TentativaResumo | null;
  melhorTentativa: TentativaResumo | null;
  stats: SimuladoStats | null;
}) {
  const dataFormatada = new Date(simulado.dataDisponivel + 'T00:00:00')
    .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Cor do desempenho do usuário
  const pctUsuario = melhorTentativa?.percentualAcerto ?? null;
  const corUsuario =
    pctUsuario === null ? '#999' :
      pctUsuario >= 70 ? '#059669' :
        pctUsuario >= 50 ? '#D97706' :
          '#DC2626';

  // Progresso em andamento
  const pctAndamento = emAndamento
    ? Math.round((emAndamento.respondidas / emAndamento.totalQuestoes) * 100)
    : 0;

  return (
    <div
      className="bg-white rounded-[28px] overflow-hidden"
      style={{ border: '1px solid #E5E5E5' }}
    >
      <div className="px-6 pt-5 pb-5 flex flex-col gap-4">

        {/* Título e meta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-dark-text leading-snug">
              {simulado.titulo}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-[10px] font-bold" style={{ color: '#999' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '11px', verticalAlign: 'middle', marginRight: '3px' }}>
                  quiz
                </span>
                {simulado.totalQuestoes} questões
              </span>
              <span className="text-[10px] font-bold" style={{ color: '#999' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '11px', verticalAlign: 'middle', marginRight: '3px' }}>
                  calendar_today
                </span>
                Liberado em {dataFormatada}
              </span>
            </div>
          </div>

          {/* Badge status */}
          {emAndamento && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0"
              style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
            >
              Em andamento
            </span>
          )}
          {!emAndamento && melhorTentativa && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0"
              style={{ backgroundColor: '#F0FDF4', color: '#059669' }}
            >
              Concluído
            </span>
          )}
        </div>

        {/* Stats globais */}
        {stats && (
          <div
            className="flex items-center gap-4 px-4 py-3 rounded-2xl"
            style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold" style={{ color: '#999' }}>Candidatos</span>
              <span className="text-sm font-black text-dark-text">
                {stats.totalFinalizados.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="w-px h-8 self-center" style={{ backgroundColor: '#E5E5E5' }} />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold" style={{ color: '#999' }}>Desempenho médio</span>
              <span className="text-sm font-black" style={{ color: '#D97706' }}>
                {stats.mediaDesempenho.toFixed(1)}%
              </span>
            </div>
            {pctUsuario !== null && (
              <>
                <div className="w-px h-8 self-center" style={{ backgroundColor: '#E5E5E5' }} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold" style={{ color: '#999' }}>Seu desempenho</span>
                  <span className="text-sm font-black" style={{ color: corUsuario }}>
                    {pctUsuario.toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Barra de progresso se em andamento */}
        {emAndamento && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold" style={{ color: '#999' }}>
                {emAndamento.respondidas} de {emAndamento.totalQuestoes} respondidas
              </span>
              <span className="text-[10px] font-black" style={{ color: '#2563EB' }}>
                {pctAndamento}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F0F0F0' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(pctAndamento, 1)}%`, backgroundColor: '#2563EB' }}
              />
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-2">
          {emAndamento ? (
            <>
              <Link
                to={`/simulados/${simulado.id}`}
                state={{ tentativaId: emAndamento.id }}
                className="flex-1 text-center py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#2563EB' }}
              >
                Continuar →
              </Link>
              <Link
                to={`/simulados/${simulado.id}`}
                state={{ refazer: true }}
                className="flex items-center justify-center px-4 rounded-2xl text-xs font-black transition-colors"
                style={{ backgroundColor: '#F5F5F5', color: '#666' }}
                title="Reiniciar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  restart_alt
                </span>
              </Link>
            </>
          ) : melhorTentativa ? (
            <>
              <Link
                to={`/simulados/${simulado.id}`}
                state={{ refazer: true }}
                className="flex-1 text-center py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FFF7ED', color: '#D97706', border: '1px solid #FED7AA' }}
              >
                Refazer
              </Link>
              <Link
                to={`/simulados/${simulado.id}/resultado`}
                state={{ tentativaId: melhorTentativa.id }}
                className="flex items-center justify-center gap-1.5 px-4 rounded-2xl text-xs font-black transition-colors"
                style={{ backgroundColor: '#F5F5F5', color: '#666' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  bar_chart
                </span>
              </Link>
            </>
          ) : (
            <Link
              to={`/simulados/${simulado.id}`}
              className="flex-1 text-center py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              Iniciar →
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}

// ── SimuladoFuturoCard ───────────────────────────────────────────

function SimuladoFuturoCard({
  simulado,
  dias,
}: {
  simulado: Simulado;
  dias: number;
}) {
  const dataFormatada = new Date(simulado.dataDisponivel + 'T00:00:00')
    .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div
      className="bg-white rounded-[28px] overflow-hidden"
      style={{ border: '1px solid #E5E5E5', opacity: 0.6 }}
    >
      <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-dark-text leading-snug truncate">
            {simulado.titulo}
          </h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] font-bold" style={{ color: '#999' }}>
              {simulado.totalQuestoes} questões
            </span>
            <span className="text-[10px] font-bold" style={{ color: '#999' }}>
              Disponível em {dataFormatada}
            </span>
          </div>
        </div>
        <div
          className="flex flex-col items-center justify-center px-3 py-2 rounded-2xl shrink-0"
          style={{ backgroundColor: '#F5F5F5' }}
        >
          <span className="text-lg font-black text-dark-text leading-none">{dias}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#999' }}>
            {dias === 1 ? 'dia' : 'dias'}
          </span>
        </div>
      </div>
    </div>
  );
}