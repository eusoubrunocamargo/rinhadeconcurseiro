import DOMPurify from 'dompurify';

interface QuestaoCardProps {
  numero: number;
  comando?: string;
  materia: string;
  assunto?: string;
  resposta: boolean | null;
  onResponder: (valor: boolean | null) => void;
}

export default function QuestaoCard({
  numero,
  comando,
  materia,
  assunto,
  resposta,
  onResponder,
}: QuestaoCardProps) {
  const comandoSeguro = comando ? DOMPurify.sanitize(comando) : '';

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-blue-600">
          Questão {numero}
        </span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {materia}{assunto ? ` • ${assunto}` : ''}
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
    </div>
  );
}
