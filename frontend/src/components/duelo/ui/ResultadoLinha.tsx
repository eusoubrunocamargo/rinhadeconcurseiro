interface Props {
  nome: string;
  acertou: boolean;
}

export default function ResultadoLinha({ nome, acertou }: Props) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-2xl"
      style={{
        backgroundColor: acertou ? '#F0FDF4' : '#FFF5F5',
        border: `1px solid ${acertou ? '#BBF7D0' : '#FECACA'}`,
      }}>
      <span className="text-sm font-bold text-dark-text">{nome}</span>
      <div className="flex items-center gap-1.5">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '16px', color: acertou ? '#059669' : '#DC2626' }}>
          {acertou ? 'check_circle' : 'cancel'}
        </span>
        <span
          className="text-xs font-black"
          style={{ color: acertou ? '#059669' : '#DC2626' }}>
          {acertou ? 'Acertou' : 'Errou'}
        </span>
      </div>
    </div>
  );
}