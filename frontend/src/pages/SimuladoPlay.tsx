import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { SimuladoDetalhado, RespostaUsuario } from '../types';
import { getSimuladoById } from '../services/simulado';
import Layout from '../components/layout/Layout';
import QuestaoCard from '../components/ui/QuestaoCard';

export default function SimuladoPlay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [simulado, setSimulado] = useState<SimuladoDetalhado | null>(null);
  const [respostas, setRespostas] = useState<Map<number, boolean | null>>(new Map());
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSimulado(parseInt(id));
    }
  }, [id]);

  async function loadSimulado(simuladoId: number) {
    try {
      const data = await getSimuladoById(simuladoId);
      setSimulado(data);
    } catch {
      setError('Erro ao carregar simulado.');
    } finally {
      setLoading(false);
    }
  }

  function handleResponder(questaoId: number, valor: boolean | null) {
    setRespostas((prev) => {
      const novo = new Map(prev);
      if (valor === null) {
        novo.delete(questaoId);
      } else {
        novo.set(questaoId, valor);
      }
      return novo;
    });
  }

  function handleFinalizar() {
    if (!simulado) return;

    const respostasArray: RespostaUsuario[] = simulado.questoes.map((sq) => ({
      questaoId: sq.questaoId,
      resposta: respostas.get(sq.questaoId) ?? null,
    }));

    sessionStorage.setItem(`resultado_${id}`, JSON.stringify({
      simulado,
      respostas: respostasArray,
    }));

    navigate(`/simulados/${id}/resultado`);
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
  const respondidas = respostas.size;

  return (
    <Layout>
      {/* Header do Simulado */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">{simulado.titulo}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span>{respondidas} de {totalQuestoes} respondidas</span>
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
        resposta={respostas.get(questaoAtualData.questaoId) ?? null}
        onResponder={(valor) => handleResponder(questaoAtualData.questaoId, valor)}
      />

      {/* Navegação */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setQuestaoAtual((prev) => prev - 1)}
          disabled={questaoAtual === 0}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Anterior
        </button>

        <div className="flex gap-2 overflow-x-auto max-w-md">
          {simulado.questoes.map((sq, index) => (
            <button
              key={sq.id}
              onClick={() => setQuestaoAtual(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                index === questaoAtual
                  ? 'bg-blue-600 text-white'
                  : respostas.has(sq.questaoId)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setQuestaoAtual((prev) => prev + 1)}
          disabled={questaoAtual === totalQuestoes - 1}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Próxima
        </button>
      </div>

      {/* Botão Finalizar */}
      <div className="mt-8 text-center">
        <button
          onClick={handleFinalizar}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Finalizar Simulado
        </button>
        {respondidas < totalQuestoes && (
          <p className="text-sm text-gray-500 mt-2">
            Você ainda tem {totalQuestoes - respondidas} questões em branco.
          </p>
        )}
      </div>
    </Layout>
  );
}
