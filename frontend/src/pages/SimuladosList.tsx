import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Simulado, TentativaResumo } from '../types';
import { getSimulados } from '../services/simulado';
import { getSimuladosEmAndamento, getSimuladosFinalizados } from '../services/tentativa';
import Layout from '../components/layout/Layout';

export default function SimuladosList() {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [emAndamento, setEmAndamento] = useState<Map<number, TentativaResumo>>(new Map());
  const [finalizados, setFinalizados] = useState<Map<number, TentativaResumo[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDados();
  }, []);

  async function loadDados() {
    try {
      const [simuladosData, emAndamentoData, finalizadosData] = await Promise.all([
        getSimulados(),
        getSimuladosEmAndamento(),
        getSimuladosFinalizados(),
      ]);

      // Ordenar por número
      simuladosData.sort((a, b) => a.numero - b.numero);
      setSimulados(simuladosData);

      const mapaEmAndamento = new Map<number, TentativaResumo>();
      emAndamentoData.forEach((t) => mapaEmAndamento.set(t.simuladoId, t));
      setEmAndamento(mapaEmAndamento);

      const mapaFinalizados = new Map<number, TentativaResumo[]>();
      finalizadosData.forEach((t) => {
        const lista = mapaFinalizados.get(t.simuladoId) || [];
        lista.push(t);
        mapaFinalizados.set(t.simuladoId, lista);
      });
      setFinalizados(mapaFinalizados);
    } catch {
      setError('Erro ao carregar simulados.');
    } finally {
      setLoading(false);
    }
  }

  function isDisponivel(dataDisponivel: string): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(dataDisponivel + 'T00:00:00');
    return data <= hoje;
  }

  function formatarDataDisponivel(dataDisponivel: string): string {
    const data = new Date(dataDisponivel + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  }

  function diasAteDisponivel(dataDisponivel: string): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(dataDisponivel + 'T00:00:00');
    const diff = data.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      </Layout>
    );
  }

  // Separar disponíveis e futuros
  const disponiveis = simulados.filter((s) => isDisponivel(s.dataDisponivel));
  const futuros = simulados.filter((s) => !isDisponivel(s.dataDisponivel));

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Simulados</h1>

      {simulados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          <span className="text-5xl block mb-4">📝</span>
          <p>Nenhum simulado disponível no momento.</p>
        </div>
      ) : (
        <>
          {/* Simulados Disponíveis */}
          {disponiveis.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Disponíveis ({disponiveis.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {disponiveis.map((simulado) => {
                  const tentativaEmAndamento = emAndamento.get(simulado.id);
                  const tentativasFinalizadas = finalizados.get(simulado.id) || [];
                  const melhorTentativa =
                    tentativasFinalizadas.length > 0
                      ? tentativasFinalizadas.reduce((melhor, atual) =>
                        (atual.pontuacao ?? 0) > (melhor.pontuacao ?? 0) ? atual : melhor
                      )
                      : null;

                  return (
                    <div
                      key={simulado.id}
                      className={`bg-white rounded-lg shadow-sm p-4 ${tentativaEmAndamento
                          ? 'ring-2 ring-blue-200'
                          : melhorTentativa
                            ? 'ring-1 ring-green-200'
                            : ''
                        }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{simulado.titulo}</h3>
                          <p className="text-xs text-gray-500">{simulado.totalQuestoes} questões</p>
                        </div>

                        {/* Badges */}
                        <div className="flex gap-1">
                          {tentativaEmAndamento && (
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                              ⏳
                            </span>
                          )}
                          {tentativasFinalizadas.length > 0 && (
                            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progresso se em andamento */}
                      {tentativaEmAndamento && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>
                              {tentativaEmAndamento.respondidas}/{tentativaEmAndamento.totalQuestoes}
                            </span>
                            <span>
                              {Math.round(
                                (tentativaEmAndamento.respondidas / tentativaEmAndamento.totalQuestoes) * 100
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full">
                            <div
                              className="h-1.5 bg-blue-600 rounded-full"
                              style={{
                                width: `${(tentativaEmAndamento.respondidas / tentativaEmAndamento.totalQuestoes) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Resultado anterior - UI melhorada */}
                      {melhorTentativa && !tentativaEmAndamento && (
                        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Último resultado:</span>
                            <span
                              className={`text-sm font-bold ${(melhorTentativa.percentualAcerto ?? 0) >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                                }`}
                            >
                              {(melhorTentativa.percentualAcerto ?? 0).toFixed(1)}%
                            </span>
                          </div>

                          {/* Detalhes: Acertos, Erros, Em Branco */}
                          <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-gray-600">{melhorTentativa.acertos ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span className="text-gray-600">{melhorTentativa.erros ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                              <span className="text-gray-600">{melhorTentativa.emBranco ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400">=</span>
                              <span className={`font-medium ${(melhorTentativa.pontuacao ?? 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                                }`}>
                                {melhorTentativa.pontuacao ?? 0} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botões */}
                      <div className="flex gap-2">
                        {tentativaEmAndamento ? (
                          <>
                            <Link
                              to={`/simulados/${simulado.id}`}
                              state={{ tentativaId: tentativaEmAndamento.id }}
                              className="flex-1 text-center py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                              Continuar
                            </Link>
                            <Link
                              to={`/simulados/${simulado.id}`}
                              state={{ refazer: true }}
                              className="py-2 px-3 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                              title="Reiniciar"
                            >
                              🔄
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to={`/simulados/${simulado.id}`}
                              state={tentativasFinalizadas.length > 0 ? { refazer: true } : undefined}
                              className={`flex-1 text-center py-2 text-white text-sm rounded-lg font-medium transition-colors ${tentativasFinalizadas.length > 0
                                  ? 'bg-orange-500 hover:bg-orange-600'
                                  : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                              {tentativasFinalizadas.length > 0 ? 'Refazer' : 'Iniciar'}
                            </Link>
                            {melhorTentativa && (
                              <Link
                                to={`/simulados/${simulado.id}/resultado`}
                                state={{ tentativaId: melhorTentativa.id }}
                                className="py-2 px-3 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                                title="Ver resultado"
                              >
                                📊
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Simulados Futuros */}
          {futuros.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Em breve ({futuros.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {futuros.map((simulado) => {
                  const dias = diasAteDisponivel(simulado.dataDisponivel);

                  return (
                    <div
                      key={simulado.id}
                      className="bg-white rounded-lg shadow-sm p-4 opacity-75"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {simulado.titulo}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {simulado.totalQuestoes} questões
                          </p>
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                          🔒
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {dias === 1 ? 'Amanhã' : `Em ${dias} dias`}
                          <span className="text-gray-400 ml-1">
                            ({formatarDataDisponivel(simulado.dataDisponivel)})
                          </span>
                        </span>
                      </div>

                      <button
                        disabled
                        className="w-full py-2 bg-gray-100 text-gray-400 text-sm rounded-lg font-medium cursor-not-allowed"
                      >
                        Aguarde
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}