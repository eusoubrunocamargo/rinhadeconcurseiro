import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { SimuladoDetalhado, NivelConfianca, RespostaRequest } from '../types';
import { getSimuladoById } from '../services/simulado';
import { iniciarSimulado, salvarRespostas, getTentativaById } from '../services/tentativa';
import Layout from '../components/layout/Layout';
import QuestaoCard from '../components/ui/QuestaoCard';

interface RespostaLocal {
  resposta: boolean | null;
  confianca: NivelConfianca | null;
  confirmada: boolean;
}

export default function SimuladoPlay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const tentativaIdFromState = location.state?.tentativaId as number | undefined;
  const refazerFromState = location.state?.refazer as boolean | undefined;

  const [simulado, setSimulado] = useState<SimuladoDetalhado | null>(null);
  const [tentativaId, setTentativaId] = useState<number | null>(tentativaIdFromState ?? null);
  const [respostas, setRespostas] = useState<Map<number, RespostaLocal>>(new Map());
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSimulado(parseInt(id));
    }
  }, [id]);

  async function loadSimulado(simuladoId: number) {
    try {
      setLoading(true);

      // Carregar dados do simulado
      const data = await getSimuladoById(simuladoId);
      setSimulado(data);

      // Se já temos tentativaId, carregar respostas existentes
      if (tentativaIdFromState && !refazerFromState) {
        setTentativaId(tentativaIdFromState);
        await carregarRespostasExistentes(tentativaIdFromState, data);
      } else {
        // Criar nova tentativa
        const tentativa = await iniciarSimulado(simuladoId, refazerFromState ?? false);
        setTentativaId(tentativa.tentativaId);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar simulado.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function carregarRespostasExistentes(tentId: number, simuladoData: SimuladoDetalhado) {
    try {
      const tentativa = await getTentativaById(tentId);
      
      // Mapear respostas do backend para o estado local
      const mapaRespostas = new Map<number, RespostaLocal>();
      
      tentativa.respostas.forEach((r) => {
        // Encontrar o questaoId a partir do simuladoQuestaoId
        const sq = simuladoData.questoes.find((q) => q.id === r.simuladoQuestaoId);
        if (sq && r.resposta) {
          mapaRespostas.set(sq.questaoId, {
            resposta: r.resposta === 'CERTO' ? true : r.resposta === 'ERRADO' ? false : null,
            confianca: r.confianca,
            confirmada: true, // Já estava salva
          });
        }
      });

      setRespostas(mapaRespostas);

      // Ir para a primeira questão não respondida
      const primeiraVazia = simuladoData.questoes.findIndex(
        (sq) => !mapaRespostas.has(sq.questaoId)
      );
      if (primeiraVazia !== -1) {
        setQuestaoAtual(primeiraVazia);
      }
    } catch (err) {
      console.error('Erro ao carregar respostas existentes:', err);
    }
  }

  function handleResponder(questaoId: number, valor: boolean | null) {
    setRespostas((prev) => {
      const novo = new Map(prev);
      if (valor === null) {
        novo.delete(questaoId);
      } else {
        const atual = novo.get(questaoId);
        novo.set(questaoId, {
          resposta: valor,
          confianca: atual?.confianca ?? null,
          confirmada: false,
        });
      }
      return novo;
    });
  }

  function handleConfianca(questaoId: number, valor: NivelConfianca) {
    setRespostas((prev) => {
      const novo = new Map(prev);
      const atual = novo.get(questaoId);
      if (atual) {
        novo.set(questaoId, { ...atual, confianca: valor, confirmada: false });
      }
      return novo;
    });
  }

  function handleConfirmar(questaoId: number) {
    setRespostas((prev) => {
      const novo = new Map(prev);
      const atual = novo.get(questaoId);
      if (atual && atual.resposta !== null && atual.confianca !== null) {
        novo.set(questaoId, { ...atual, confirmada: true });
      }
      return novo;
    });

    // Avançar para próxima questão automaticamente
    if (simulado && questaoAtual < simulado.questoes.length - 1) {
      setQuestaoAtual((prev) => prev + 1);
    }
  }

  function montarPayload(): RespostaRequest[] {
    if (!simulado) return [];
    
    return simulado.questoes.map((sq) => {
      const r = respostas.get(sq.questaoId);
      return {
        simuladoQuestaoId: sq.id,
        resposta: r?.resposta === true ? 'CERTO' : r?.resposta === false ? 'ERRADO' : null,
        confianca: r?.confianca ?? null,
        tipoErro: null,
      };
    });
  }

  async function handlePausar() {
    if (!simulado || !tentativaId) return;

    try {
      setSalvando(true);
      await salvarRespostas(tentativaId, { respostas: montarPayload() });
      navigate('/dashboard');
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleFinalizar() {
    if (!simulado || !tentativaId) return;

    try {
      setSalvando(true);

      const respostasPayload = montarPayload();

      // Salvar respostas na API
      await salvarRespostas(tentativaId, { respostas: respostasPayload });

      // Salvar dados localmente para a tela de feedback
      sessionStorage.setItem(
        `pendente_${tentativaId}`,
        JSON.stringify({
          simulado,
          tentativaId,
          respostas: respostasPayload,
        })
      );

      // Navegar para feedback
      navigate(`/simulados/${id}/feedback`, {
        state: { tentativaId },
      });
    } catch {
      setError('Erro ao salvar respostas. Tente novamente.');
    } finally {
      setSalvando(false);
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

  if (error || !simulado) {
    return (
      <Layout>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error || 'Simulado não encontrado.'}
        </div>
      </Layout>
    );
  }

  const questaoAtualData = simulado.questoes[questaoAtual];
  const totalQuestoes = simulado.questoes.length;
  const respondidas = Array.from(respostas.values()).filter((r) => r.confirmada).length;
  const respostaAtual = respostas.get(questaoAtualData.questaoId);
  const podeConfirmar = respostaAtual?.resposta !== null && respostaAtual?.confianca !== null;

  return (
    <Layout>
      {/* Header do Simulado */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">{simulado.titulo}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span>
            {respondidas} de {totalQuestoes} confirmadas
          </span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-xs">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all"
              style={{ width: `${(respondidas / totalQuestoes) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Questão Atual */}
      <QuestaoCard
        numero={questaoAtualData.ordem}
        comando={questaoAtualData.comando}
        materia={questaoAtualData.materiaNome}
        assunto={questaoAtualData.assuntoNome}
        resposta={respostaAtual?.resposta ?? null}
        confianca={respostaAtual?.confianca ?? null}
        confirmada={respostaAtual?.confirmada ?? false}
        onResponder={(valor) => handleResponder(questaoAtualData.questaoId, valor)}
        onConfianca={(valor) => handleConfianca(questaoAtualData.questaoId, valor)}
        onConfirmar={() => handleConfirmar(questaoAtualData.questaoId)}
        podeConfirmar={podeConfirmar && !respostaAtual?.confirmada}
      />

      {/* Navegação */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setQuestaoAtual((prev) => prev - 1)}
          disabled={questaoAtual === 0}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          ← Anterior
        </button>

        <div className="flex gap-1.5 overflow-x-auto max-w-md py-1 px-1">
          {simulado.questoes.map((sq, index) => {
            const item = respostas.get(sq.questaoId);
            const isAtual = index === questaoAtual;

            let corClasse = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
            if (isAtual) {
              corClasse = 'bg-blue-600 text-white';
            } else if (item?.confirmada) {
              // Confirmada: verde ou vermelho baseado na resposta
              corClasse = item.resposta === true 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white';
            } else if (item?.resposta !== null) {
              // Marcada mas não confirmada
              corClasse = 'bg-yellow-200 text-yellow-800';
            }

            return (
              <button
                key={sq.id}
                onClick={() => setQuestaoAtual(index)}
                className={`min-w-8 h-8 px-2 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${corClasse}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setQuestaoAtual((prev) => prev + 1)}
          disabled={questaoAtual === totalQuestoes - 1}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Próxima →
        </button>
      </div>

      {/* Botões de Ação */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={handlePausar}
          disabled={salvando}
          className={`px-6 py-3 rounded-lg font-medium transition-colors border ${
            salvando
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          {salvando ? 'Salvando...' : '⏸️ Pausar e Sair'}
        </button>
        <button
          onClick={handleFinalizar}
          disabled={salvando}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            salvando
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
          }`}
        >
          {salvando ? 'Salvando...' : '✅ Finalizar Simulado'}
        </button>
      </div>
      {respondidas < totalQuestoes && (
        <p className="text-sm text-gray-500 mt-3 text-center">
          Você ainda tem {totalQuestoes - respondidas} questões não confirmadas.
        </p>
      )}
    </Layout>
  );
}