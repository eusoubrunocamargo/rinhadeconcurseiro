import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import type { MeuProgresso, TentativaResumo } from '../types';
import { getMeuProgresso, getSimuladosEmAndamento, getSimuladosFinalizados } from '../services/tentativa';

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const [progresso, setProgresso] = useState<MeuProgresso | null>(null);
  const [emAndamento, setEmAndamento] = useState<TentativaResumo[]>([]);
  const [finalizados, setFinalizados] = useState<TentativaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.apelido || user?.nome?.split(' ')[0] || 'Usuário';

  const loadDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [progressoData, emAndamentoData, finalizadosData] = await Promise.all([
        getMeuProgresso(),
        getSimuladosEmAndamento(),
        getSimuladosFinalizados(),
      ]);

      console.log('Progresso:', progressoData);
      console.log('Em andamento:', emAndamentoData);
      console.log('Finalizados:', finalizadosData);

      setProgresso(progressoData);
      setEmAndamento(emAndamentoData);
      setFinalizados(finalizadosData.slice(0, 5));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente recarregar a página.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarregar dados quando voltar para o dashboard
  useEffect(() => {
    loadDados();
  }, [loadDados, location.key]);

  return (
    <Layout>
      {/* Saudação */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Olá, {firstName}!</h1>
        <p className="text-gray-600">Pronto para mais uma sessão de estudos?</p>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button
            onClick={loadDados}
            className="ml-4 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Simulados em Andamento */}
      {!loading && emAndamento.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ⏳ Continuar Simulado
          </h2>
          <div className="space-y-3">
            {emAndamento.map((t) => (
              <Link
                key={t.id}
                to={`/simulados/${t.simuladoId}`}
                state={{ tentativaId: t.id }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow block"
              >
                <div>
                  <p className="font-medium text-gray-800">{t.simuladoTitulo}</p>
                  <p className="text-sm text-gray-500">
                    {t.respondidas} de {t.totalQuestoes} respondidas
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-blue-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${(t.respondidas / t.totalQuestoes) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-blue-600 font-medium whitespace-nowrap">
                    Continuar →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cards de Progresso */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      ) : progresso ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{progresso.simuladosFinalizados}</p>
            <p className="text-sm text-gray-500">Simulados Finalizados</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold text-orange-500">{progresso.simuladosEmAndamento}</p>
            <p className="text-sm text-gray-500">Em Andamento</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {progresso.mediaAproveitamento.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">Aproveitamento</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {progresso.cadernos.totalQuestoes}
            </p>
            <p className="text-sm text-gray-500">Questões Realizadas</p>
          </div>
        </div>
      ) : null}

      {/* Cadernos de Revisão */}
      {!loading && progresso && progresso.cadernos.totalQuestoes > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cadernos de Revisão</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to="/cadernos/vermelho"
              className="flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <span className="text-2xl">🔴</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Crítico</p>
                <p className="text-sm text-gray-500">Prioridade alta</p>
              </div>
              <span className="text-xl font-bold text-red-600">
                {progresso.cadernos.totalVermelho}
              </span>
            </Link>

            <Link
              to="/cadernos/amarelo"
              className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <span className="text-2xl">🟡</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Reforço</p>
                <p className="text-sm text-gray-500">Prioridade média</p>
              </div>
              <span className="text-xl font-bold text-yellow-600">
                {progresso.cadernos.totalAmarelo}
              </span>
            </Link>

            <Link
              to="/cadernos/verde"
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl">🟢</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Domínio</p>
                <p className="text-sm text-gray-500">Manutenção</p>
              </div>
              <span className="text-xl font-bold text-green-600">
                {progresso.cadernos.totalVerde}
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Link
          to="/simulados"
          className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <span className="text-4xl">📝</span>
          <div>
            <p className="font-semibold text-gray-800">Simulados</p>
            <p className="text-sm text-gray-500">Pratique com questões CEBRASPE</p>
          </div>
        </Link>

        <Link
          to="/ranking"
          className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <span className="text-4xl">🏅</span>
          <div>
            <p className="font-semibold text-gray-800">Ranking</p>
            <p className="text-sm text-gray-500">Veja sua posição</p>
          </div>
        </Link>

        <Link
          to="/estatisticas"
          className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <span className="text-4xl">📊</span>
          <div>
            <p className="font-semibold text-gray-800">Estatísticas</p>
            <p className="text-sm text-gray-500">Acompanhe seu progresso</p>
          </div>
        </Link>
      </div>

      {/* Atividade Recente */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h2>
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : finalizados.length > 0 ? (
          <div className="space-y-3">
            {finalizados.map((t) => (
              <Link
                key={t.id}
                to={`/simulados/${t.simuladoId}/resultado`}
                state={{ tentativaId: t.id }}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow block"
              >
                <div>
                  <p className="font-medium text-gray-800">{t.simuladoTitulo}</p>
                  <p className="text-sm text-gray-500">
                    {t.dataFim
                      ? new Date(t.dataFim).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{t.pontuacao} pts</p>
                    <p className="text-sm text-gray-500">
                      {t.acertos}/{(t.acertos ?? 0) + (t.erros ?? 0)} acertos
                    </p>
                  </div>
                  <span
                    className={`text-lg font-bold ${(t.percentualAcerto ?? 0) >= 70
                        ? 'text-green-600'
                        : (t.percentualAcerto ?? 0) >= 50
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                  >
                    {(t.percentualAcerto ?? 0).toFixed(0)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            <p>Nenhum simulado realizado ainda.</p>
            <Link
              to="/simulados"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Começar agora
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}