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
      // Filtrar apenas disponíveis e ordenar por número
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

  function getMedalha(posicao: number): string {
    switch (posicao) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  }

  function getPosicaoStyle(posicao: number): string {
    switch (posicao) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-white border-gray-200';
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ranking</h1>
        <p className="text-gray-600">Veja sua posição entre os concurseiros</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabChange('geral')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === 'geral'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🏆 Ranking Geral
        </button>
        <button
          onClick={() => handleTabChange('simulado')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === 'simulado'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📝 Por Simulado
        </button>
      </div>

      {/* Seletor de Simulado */}
      {tab === 'simulado' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione o simulado:
          </label>
          <select
            value={simuladoSelecionado ?? ''}
            onChange={(e) => setSimuladoSelecionado(Number(e.target.value))}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {simulados.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titulo}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Posição do Usuário Atual */}
      {ranking?.currentUserPosition && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-600 font-medium mb-2">Sua posição</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-lg">
              {ranking.currentUserPosition.posicao}º
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                {ranking.currentUserPosition.apelido || ranking.currentUserPosition.nome}
              </p>
              <div className="flex gap-4 text-sm text-gray-600">
                <span className="font-medium text-blue-600">
                  {ranking.currentUserPosition.pontuacao} pts
                </span>
                <span>
                  {ranking.currentUserPosition.acertos} acertos
                </span>
                {tab === 'geral' && (
                  <span>
                    {ranking.currentUserPosition.simuladosFinalizados} simulados
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* Ranking List */}
      {!loading && ranking && (
        <>
          {/* Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {ranking.totalParticipantes} participante{ranking.totalParticipantes !== 1 ? 's' : ''}
              {ranking.simuladoTitulo && ` • ${ranking.simuladoTitulo}`}
            </p>
          </div>

          {ranking.ranking.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              <span className="text-5xl block mb-4">🏆</span>
              <p>Nenhum participante ainda.</p>
              <Link
                to="/simulados"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
              >
                Seja o primeiro!
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {ranking.ranking.map((item) => (
                <RankingRow
                  key={item.usuarioId}
                  item={item}
                  tipo={ranking.tipo}
                  getMedalha={getMedalha}
                  getPosicaoStyle={getPosicaoStyle}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

// Componente separado para cada linha do ranking
function RankingRow({
  item,
  tipo,
  getMedalha,
  getPosicaoStyle,
}: {
  item: RankingItem;
  tipo: 'SIMULADO' | 'GERAL';
  getMedalha: (posicao: number) => string;
  getPosicaoStyle: (posicao: number) => string;
}) {
  const medalha = getMedalha(item.posicao);
  const posicaoStyle = getPosicaoStyle(item.posicao);

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${posicaoStyle} ${
        item.isCurrentUser ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Posição */}
        <div className="flex items-center justify-center w-10 h-10 shrink-0">
          {medalha ? (
            <span className="text-2xl">{medalha}</span>
          ) : (
            <span className="text-lg font-bold text-gray-500">{item.posicao}º</span>
          )}
        </div>

        {/* Avatar */}
        <div className="shrink-0">
          {item.fotoUrl ? (
            <img
              src={item.fotoUrl}
              alt={item.nome}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium">
              {(item.apelido || item.nome).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Nome */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 truncate">
            {item.apelido || item.nome}
            {item.isCurrentUser && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                Você
              </span>
            )}
          </p>
          {tipo === 'GERAL' && (
            <p className="text-xs text-gray-500">
              {item.simuladosFinalizados} simulado{item.simuladosFinalizados !== 1 ? 's' : ''} finalizado{item.simuladosFinalizados !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Estatísticas */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1" title="Acertos">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">{item.acertos}</span>
          </div>
          <div className="flex items-center gap-1" title="Erros">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="text-gray-600">{item.erros}</span>
          </div>
          <div className="flex items-center gap-1" title="Em branco">
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
            <span className="text-gray-600">{item.emBranco}</span>
          </div>
        </div>

        {/* Pontuação */}
        <div className="text-right shrink-0">
          <p className={`text-lg font-bold ${item.pontuacao >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {item.pontuacao} pts
          </p>
          <p className="text-xs text-gray-500">
            {item.percentualAcerto.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Estatísticas mobile */}
      <div className="flex sm:hidden items-center gap-4 text-xs mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-gray-600">{item.acertos} acertos</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-gray-600">{item.erros} erros</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          <span className="text-gray-600">{item.emBranco} em branco</span>
        </div>
      </div>
    </div>
  );
}