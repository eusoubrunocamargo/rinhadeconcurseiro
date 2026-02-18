import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { SimuladoDetalhado, RespostaRequest, TipoErro } from '../types';
import { salvarRespostas, finalizarTentativa } from '../services/tentativa';
import Layout from '../components/layout/Layout';
import DOMPurify from 'dompurify';

interface DadosPendentes {
  simulado: SimuladoDetalhado;
  tentativaId: number;
  respostas: RespostaRequest[];
}

interface QuestaoErrada {
  index: number;
  simuladoQuestaoId: number;
  questaoId: number;
  ordem: number;
  comando?: string;
  materiaNome: string;
  assuntoNome?: string;
  respostaUsuario: 'CERTO' | 'ERRADO';
  gabarito: 'CERTO' | 'ERRADO';
}

export default function SimuladoFeedback() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const tentativaIdFromState = location.state?.tentativaId as number | undefined;

  const [dados, setDados] = useState<DadosPendentes | null>(null);
  const [questoesErradas, setQuestoesErradas] = useState<QuestaoErrada[]>([]);
  const [feedbacks, setFeedbacks] = useState<Map<number, TipoErro>>(new Map());
  const [finalizando, setFinalizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tentativaIdFromState) {
      navigate('/simulados');
      return;
    }

    const stored = sessionStorage.getItem(`pendente_${tentativaIdFromState}`);
    if (!stored) {
      navigate('/simulados');
      return;
    }

    const parsed: DadosPendentes = JSON.parse(stored);
    setDados(parsed);

    // Identificar questões erradas
    const erradas: QuestaoErrada[] = [];
    parsed.respostas.forEach((r, index) => {
      if (r.resposta === null) return; // em branco não precisa feedback

      const questao = parsed.simulado.questoes.find((q) => q.id === r.simuladoQuestaoId);
      if (!questao) return;

      if (r.resposta !== questao.gabarito) {
        erradas.push({
          index,
          simuladoQuestaoId: r.simuladoQuestaoId,
          questaoId: questao.questaoId,
          ordem: questao.ordem,
          comando: questao.comando,
          materiaNome: questao.materiaNome,
          assuntoNome: questao.assuntoNome,
          respostaUsuario: r.resposta as 'CERTO' | 'ERRADO',
          gabarito: questao.gabarito,
        });
      }
    });

    setQuestoesErradas(erradas);

    // Se não há questões erradas, finalizar direto
    if (erradas.length === 0) {
      finalizarDireto(parsed);
    }
  }, [tentativaIdFromState, navigate]);

  async function finalizarDireto(dadosParam: DadosPendentes) {
    try {
      setFinalizando(true);
      await finalizarTentativa(dadosParam.tentativaId);
      sessionStorage.removeItem(`pendente_${dadosParam.tentativaId}`);
      navigate(`/simulados/${id}/resultado`, {
        state: { tentativaId: dadosParam.tentativaId },
      });
    } catch {
      setError('Erro ao finalizar. Tente novamente.');
      setFinalizando(false);
    }
  }

  function handleFeedback(simuladoQuestaoId: number, tipo: TipoErro) {
    setFeedbacks((prev) => {
      const novo = new Map(prev);
      novo.set(simuladoQuestaoId, tipo);
      return novo;
    });
  }

  async function handleConcluir() {
    if (!dados) return;

    try {
      setFinalizando(true);
      setError(null);

      // Atualizar respostas com tipoErro
      const respostasAtualizadas: RespostaRequest[] = dados.respostas.map((r) => ({
        ...r,
        tipoErro: feedbacks.get(r.simuladoQuestaoId) ?? null,
      }));

      // Salvar respostas atualizadas
      await salvarRespostas(dados.tentativaId, { respostas: respostasAtualizadas });

      // Finalizar tentativa
      await finalizarTentativa(dados.tentativaId);

      // Limpar dados pendentes
      sessionStorage.removeItem(`pendente_${dados.tentativaId}`);

      // Navegar para resultado
      navigate(`/simulados/${id}/resultado`, {
        state: { tentativaId: dados.tentativaId },
      });
    } catch {
      setError('Erro ao finalizar. Tente novamente.');
    } finally {
      setFinalizando(false);
    }
  }

  const todosFeedbacksPreenchidos =
    questoesErradas.length === 0 ||
    questoesErradas.every((q) => feedbacks.has(q.simuladoQuestaoId));

  if (!dados || finalizando) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          {finalizando && (
            <p className="mt-4 text-gray-600">Finalizando simulado...</p>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Análise dos Erros</h1>
        <p className="text-gray-600">
          Classifique cada erro para criar seu plano de revisão personalizado.
        </p>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Progresso */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            {feedbacks.size} de {questoesErradas.length} classificados
          </span>
          <span className="text-sm font-medium text-blue-600">
            {questoesErradas.length > 0
              ? Math.round((feedbacks.size / questoesErradas.length) * 100)
              : 100}
            %
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all"
            style={{
              width: `${questoesErradas.length > 0
                  ? (feedbacks.size / questoesErradas.length) * 100
                  : 100
                }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Lista de Questões Erradas */}
      <div className="space-y-4 mb-8">
        {questoesErradas.map((q) => {
          const feedbackSelecionado = feedbacks.get(q.simuladoQuestaoId);

          return (
            <div key={q.simuladoQuestaoId} className="bg-white rounded-xl shadow-sm p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-red-600">
                  Questão {q.ordem} - Erro
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {q.materiaNome}
                  {q.assuntoNome ? ` • ${q.assuntoNome}` : ''}
                </span>
              </div>

              {/* Texto da questão - COMPLETO */}
              {q.comando && (
                <div
                  className="text-gray-700 text-sm leading-relaxed mb-4 max-h-64 overflow-y-auto [&_p]:mb-3 [&_p]:last:mb-0"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.comando) }}
                />
              )}

              {/* Resposta vs Gabarito */}
              <div className="flex gap-4 text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-gray-500">Você marcou: </span>
                  <span
                    className={
                      q.respostaUsuario === 'CERTO'
                        ? 'text-green-600 font-medium'
                        : 'text-red-600 font-medium'
                    }
                  >
                    {q.respostaUsuario === 'CERTO' ? 'Certo' : 'Errado'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Gabarito: </span>
                  <span
                    className={
                      q.gabarito === 'CERTO'
                        ? 'text-green-600 font-medium'
                        : 'text-red-600 font-medium'
                    }
                  >
                    {q.gabarito === 'CERTO' ? 'Certo' : 'Errado'}
                  </span>
                </div>
              </div>

              {/* Seleção de Tipo de Erro */}
              <div>
                <p className="text-sm text-gray-600 mb-3">Por que você errou?</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleFeedback(q.simuladoQuestaoId, 'CONTEUDO')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${feedbackSelecionado === 'CONTEUDO'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    📚 Não sabia o conteúdo
                  </button>
                  <button
                    onClick={() => handleFeedback(q.simuladoQuestaoId, 'INTERPRETACAO')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${feedbackSelecionado === 'INTERPRETACAO'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    🔍 Errei a interpretação
                  </button>
                  <button
                    onClick={() => handleFeedback(q.simuladoQuestaoId, 'DISTRACAO')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${feedbackSelecionado === 'DISTRACAO'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    😅 Falta de atenção
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão Concluir */}
      <div className="text-center">
        <button
          onClick={handleConcluir}
          disabled={!todosFeedbacksPreenchidos || finalizando}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${todosFeedbacksPreenchidos && !finalizando
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {finalizando ? 'Finalizando...' : 'Ver Resultado'}
        </button>
        {!todosFeedbacksPreenchidos && (
          <p className="text-sm text-gray-500 mt-2">
            Classifique todos os erros para continuar.
          </p>
        )}
      </div>
    </Layout>
  );
}