import DOMPurify from 'dompurify';
import type { NivelConfianca } from '../../types';

interface QuestaoCardProps {
  numero: number;
  comando?: string;
  materia: string;
  assunto?: string;
  resposta: boolean | null;
  confianca: NivelConfianca | null;
  confirmada: boolean;
  onResponder: (valor: boolean | null) => void;
  onConfianca: (valor: NivelConfianca) => void;
  onConfirmar: () => void;
  podeConfirmar: boolean;
}

export default function QuestaoCard({
  numero,
  comando,
  materia,
  assunto,
  resposta,
  confianca,
  confirmada,
  onResponder,
  onConfianca,
  onConfirmar,
  podeConfirmar,
}: QuestaoCardProps) {
  const comandoSeguro = comando ? DOMPurify.sanitize(comando) : '';

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${confirmada ? 'ring-2 ring-green-200' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-600">Questão {numero}</span>
          {confirmada && (
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              ✓ Confirmada
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {materia}
          {assunto ? ` • ${assunto}` : ''}
        </span>
      </div>

      {/* Comando */}
      {comando && (
        <div
          className="mb-6 text-gray-800 leading-relaxed [&_p]:mb-3 [&_p]:last:mb-0"
          dangerouslySetInnerHTML={{ __html: comandoSeguro }}
        />
      )}

      {/* Botões de Resposta */}
      <div className="flex gap-3">
        <button
          onClick={() => onResponder(resposta === true ? null : true)}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
            resposta === true
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          CERTO
        </button>
        <button
          onClick={() => onResponder(resposta === false ? null : false)}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
            resposta === false
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ERRADO
        </button>
      </div>

      {/* Botões de Confiança - aparecem após responder */}
      {resposta !== null && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-3">Qual seu nível de confiança?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onConfianca('CERTEZA')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                confianca === 'CERTEZA'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              😎 Certeza
            </button>
            <button
              onClick={() => onConfianca('DUVIDA')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                confianca === 'DUVIDA'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🤔 Dúvida
            </button>
            <button
              onClick={() => onConfianca('CHUTE')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                confianca === 'CHUTE'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎲 Chute
            </button>
          </div>
        </div>
      )}

      {/* Botão Confirmar - aparece quando resposta e confiança selecionadas */}
      {resposta !== null && confianca !== null && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {confirmada ? (
            <div className="text-center text-green-600 font-medium py-2">
              ✓ Resposta confirmada! Use os botões acima para alterar.
            </div>
          ) : (
            <button
              onClick={onConfirmar}
              disabled={!podeConfirmar}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                podeConfirmar
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 cursor-pointer shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              ✓ Confirmar e Avançar
            </button>
          )}
        </div>
      )}

      {/* Dica de progresso */}
      {resposta === null && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-400 text-center">
            Selecione CERTO ou ERRADO para continuar
          </p>
        </div>
      )}
      {resposta !== null && confianca === null && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-400 text-center">
            Agora selecione seu nível de confiança
          </p>
        </div>
      )}
    </div>
  );
}
