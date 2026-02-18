import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import type { TentativaDetalhe, RespostaDetalhe, Caderno } from '../types';
import { getTentativaById } from '../services/tentativa';
import Layout from '../components/layout/Layout';
import DOMPurify from 'dompurify';

const CADERNO_CONFIG = {
  VERMELHO: {
    emoji: '🔴',
    titulo: 'Caderno Vermelho',
    subtitulo: 'Revisão crítica - Prioridade alta',
    cor: 'red',
  },
  AMARELO: {
    emoji: '🟡',
    titulo: 'Caderno Amarelo',
    subtitulo: 'Reforço - Prioridade média',
    cor: 'yellow',
  },
  VERDE: {
    emoji: '🟢',
    titulo: 'Caderno Verde',
    subtitulo: 'Domínio - Manutenção',
    cor: 'green',
  },
};

const TIPO_RESULTADO_LABELS: Record<string, string> = {
  ACERTO_CONSCIENTE: 'Acerto consciente',
  ACERTO_COM_DUVIDA: 'Acerto com dúvida',
  ACERTO_POR_CHUTE: 'Acerto por chute',
  ERRO_CONTEUDO: 'Erro de conteúdo',
  ERRO_INTERPRETACAO: 'Erro de interpretação',
  ERRO_DISTRACAO: 'Erro por distração',
};

export default function SimuladoResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const tentativaIdFromState = location.state?.tentativaId as number | undefined;

  const [tentativa, setTentativa] = useState<TentativaDetalhe | null>(null);
  const [cadernoAberto, setCadernoAberto] = useState<Caderno | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tentativaIdFromState) {
      loadTentativa(tentativaIdFromState);
    } else {
      setError('Tentativa não encontrada.');
      setLoading(false);
    }
  }, [tentativaIdFromState]);

  async function loadTentativa(tentativaId: number) {
    try {
      setLoading(true);
      const data = await getTentativaById(tentativaId);
      setTentativa(data);
    } catch {
      setError('Erro ao carregar resultado.');
    } finally {
      setLoading(false);
    }
  }

  function handleRefazer() {
    navigate(`/simulados/${id}`);
  }

  function agruparPorCaderno(respostas: RespostaDetalhe[]): Record<Caderno, RespostaDetalhe[]> {
    const grupos: Record<Caderno, RespostaDetalhe[]> = {
      VERMELHO: [],
      AMARELO: [],
      VERDE: [],
    };

    respostas.forEach((r) => {
      if (r.caderno) {
        grupos[r.caderno].push(r);
      }
    });

    return grupos;
  }

  function gerarUrlBusca(comando?: string): string {
    const sites = [
      'site:tecconcursos.com.br',
      'site:grancursosonline.com.br',
      'site:qconcursos.com',
      'site:estrategiaconcursos.com.br',
    ].join(' OR ');

    const textoParaBusca = comando
      ? comando
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200)
      : '';

    return `https://www.google.com/search?q=${encodeURIComponent(textoParaBusca + ' ' + sites)}`;
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

  if (error || !tentativa) {
    return (
      <Layout>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error || 'Resultado não encontrado.'}
        </div>
        <Link to="/simulados" className="text-blue-600 hover:text-blue-700 font-medium">
          Voltar para simulados
        </Link>
      </Layout>
    );
  }

  const cadernos = agruparPorCaderno(tentativa.respostas);
  const percentual = tentativa.percentualAcerto ?? 0;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Resultado</h1>
        <p className="text-gray-600">{tentativa.simuladoTitulo}</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{tentativa.acertos ?? 0}</p>
          <p className="text-sm text-gray-500">Acertos</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{tentativa.erros ?? 0}</p>
          <p className="text-sm text-gray-500">Erros</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-400">{tentativa.emBranco ?? 0}</p>
          <p className="text-sm text-gray-500">Em Branco</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p
            className={`text-3xl font-bold ${(tentativa.pontuacao ?? 0) >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
          >
            {tentativa.pontuacao ?? 0}
          </p>
          <p className="text-sm text-gray-500">Pontuação</p>
        </div>
      </div>

      {/* Percentual */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 font-medium">Aproveitamento</span>
          <span className="text-lg font-bold text-gray-800">{percentual.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full">
          <div
            className="h-3 bg-blue-600 rounded-full transition-all"
            style={{ width: `${percentual}%` }}
          ></div>
        </div>
      </div>

      {/* Cadernos de Revisão */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Cadernos de Revisão</h2>
      <div className="space-y-4 mb-8">
        {(['VERMELHO', 'AMARELO', 'VERDE'] as Caderno[]).map((caderno) => {
          const config = CADERNO_CONFIG[caderno];
          const questoes = cadernos[caderno];
          const isAberto = cadernoAberto === caderno;

          if (questoes.length === 0) return null;

          return (
            <div key={caderno} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header do Caderno */}
              <button
                onClick={() => setCadernoAberto(isAberto ? null : caderno)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config.emoji}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{config.titulo}</p>
                    <p className="text-sm text-gray-500">{config.subtitulo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-700">{questoes.length}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isAberto ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>


              {/* Lista de Questões */}
              {isAberto && (
                <div className="border-t border-gray-100 max-h-[600px] overflow-y-auto">
                  {questoes.map((r) => (
                    <details
                      key={r.id}
                      className="border-b border-gray-50 last:border-b-0 group"
                    >
                      <summary className="p-4 cursor-pointer hover:bg-gray-50 list-none">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-blue-600">
                              Questão {r.ordem}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${r.acertou
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                                }`}
                            >
                              {r.tipoResultado ? TIPO_RESULTADO_LABELS[r.tipoResultado] : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                              {r.materiaNome}
                              {r.assuntoNome ? ` • ${r.assuntoNome}` : ''}
                            </span>
                            <svg
                              className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </summary>

                      <div className="px-4 pb-4">
                        {/* Texto completo da questão */}
                        {r.comando && (
                          <div
                            className="text-gray-700 text-sm leading-relaxed mb-4 p-4 bg-gray-50 rounded-lg [&_p]:mb-3 [&_p]:last:mb-0"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(r.comando),
                            }}
                          />
                        )}

                        {/* Comparativo resposta vs gabarito */}
                        <div className="flex gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Você marcou: </span>
                            <span
                              className={
                                r.resposta === 'CERTO'
                                  ? 'text-green-600 font-medium'
                                  : r.resposta === 'ERRADO'
                                    ? 'text-red-600 font-medium'
                                    : 'text-gray-400'
                              }
                            >
                              {r.resposta === 'CERTO' ? 'Certo' : r.resposta === 'ERRADO' ? 'Errado' : 'Em branco'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Gabarito: </span>
                            <span
                              className={
                                r.gabarito === 'CERTO'
                                  ? 'text-green-600 font-medium'
                                  : 'text-red-600 font-medium'
                              }
                            >
                              {r.gabarito === 'CERTO' ? 'Certo' : 'Errado'}
                            </span>
                          </div>
                        </div>

                        {/* Link de pesquisa */}
                        {!r.acertou && (

                          <Link to={gerarUrlBusca(r.comando)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                            Pesquisar sobre essa questão
                          </Link>
                        )}
                      </div>
                    </details>
                  ))}
        
        
            </div>
              )}
            </div>
          );
        })}


        {/* Mensagem se não há nada nos cadernos */}
        {tentativa.totalVermelho === 0 &&
          tentativa.totalAmarelo === 0 &&
          tentativa.totalVerde === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <span className="text-4xl mb-2 block">📋</span>
              <p className="text-gray-600">Nenhuma questão classificada nos cadernos.</p>
            </div>
          )}
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleRefazer}
          className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Refazer Simulado
        </button>
        <Link
          to="/simulados"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
        >
          Ver Outros Simulados
        </Link>
      </div>
    </Layout >
  );
}