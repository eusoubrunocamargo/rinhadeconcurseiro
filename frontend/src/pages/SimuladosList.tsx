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

      setSimulados(simuladosData);

      // Mapear em andamento por simuladoId
      const mapaEmAndamento = new Map<number, TentativaResumo>();
      emAndamentoData.forEach((t) => mapaEmAndamento.set(t.simuladoId, t));
      setEmAndamento(mapaEmAndamento);

      // Mapear finalizados por simuladoId (pode ter múltiplas tentativas)
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

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Simulados</h1>

      {simulados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          <span className="text-5xl block mb-4">📝</span>
          <p>Nenhum simulado disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {simulados.map((simulado) => {
            const tentativaEmAndamento = emAndamento.get(simulado.id);
            const tentativasFinalizadas = finalizados.get(simulado.id) || [];
            const melhorTentativa = tentativasFinalizadas.length > 0
              ? tentativasFinalizadas.reduce((melhor, atual) =>
                (atual.pontuacao ?? 0) > (melhor.pontuacao ?? 0) ? atual : melhor
              )
              : null;

            return (
              <div
                key={simulado.id}
                className={`bg-white rounded-xl shadow-sm p-6 ${tentativaEmAndamento ? 'ring-2 ring-blue-200' : ''
                  }`}
              >
                {/* Badges de Status */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {tentativaEmAndamento && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                      ⏳ Em andamento
                    </span>
                  )}
                  {tentativasFinalizadas.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                      ✓ Concluído ({tentativasFinalizadas.length}x)
                    </span>
                  )}
                </div>

                <h2 className="font-semibold text-gray-800 mb-2">{simulado.titulo}</h2>
                <p className="text-sm text-gray-500 mb-4">Simulado #{simulado.numero}</p>

                {/* Progresso se em andamento */}
                {tentativaEmAndamento && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>
                        {tentativaEmAndamento.respondidas} de {tentativaEmAndamento.totalQuestoes} respondidas
                      </span>
                      <span>
                        {Math.round((tentativaEmAndamento.respondidas / tentativaEmAndamento.totalQuestoes) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-600 rounded-full transition-all"
                        style={{
                          width: `${(tentativaEmAndamento.respondidas / tentativaEmAndamento.totalQuestoes) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Melhor resultado se já finalizado */}
                {melhorTentativa && !tentativaEmAndamento && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Melhor resultado:</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {melhorTentativa.acertos}/{(melhorTentativa.acertos ?? 0) + (melhorTentativa.erros ?? 0)} acertos
                      </span>
                      <span className={`text-sm font-bold ${(melhorTentativa.percentualAcerto ?? 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                        }`}>
                        {(melhorTentativa.percentualAcerto ?? 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{simulado.totalQuestoes} questões</span>
                </div>

                {/* Botões de Ação */}
                <div className="mt-4 flex gap-2">
                  {tentativaEmAndamento ? (
                    <>
                      <Link
                        to={`/simulados/${simulado.id}`}
                        state={{ tentativaId: tentativaEmAndamento.id }}
                        className="flex-1 text-center py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Continuar →
                      </Link>
                      <Link
                        to={`/simulados/${simulado.id}`}
                        state={{ refazer: true }}
                        className="py-2 px-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        title="Reiniciar do zero"
                      >
                        🔄
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={`/simulados/${simulado.id}`}
                      state={tentativasFinalizadas.length > 0 ? { refazer: true } : undefined}
                      className="flex-1 text-center py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      {tentativasFinalizadas.length > 0 ? 'Refazer' : 'Iniciar'} →
                    </Link>
                  )}

                  {melhorTentativa && (
                    <Link
                      to={`/simulados/${simulado.id}/resultado`}
                      state={{ tentativaId: melhorTentativa.id }}
                      className="py-2 px-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      title="Ver último resultado"
                    >
                      📊
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}