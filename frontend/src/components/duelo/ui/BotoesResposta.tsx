interface Props {
  respondeuAtual: boolean;
  desabilitado: boolean;
  onResponder: (resp: 'CERTO' | 'ERRADO' | null) => void;
}

const OPCOES = [
  { label: 'Certo',  resp: 'CERTO'  as const, cor: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
  { label: 'Errado', resp: 'ERRADO' as const, cor: '#DC2626', bg: '#FFF5F5', border: '#FECACA' },
  { label: 'Branco', resp: null,               cor: '#999',    bg: '#F5F5F5', border: '#E5E5E5' },
];

export default function BotoesResposta({ respondeuAtual, desabilitado, onResponder }: Props) {
  return (
    <div className="p-4 flex flex-col gap-2 shrink-0"
      style={{ borderTop: '1px solid #F0F0F0' }}>
      <div className="flex gap-2">
        {OPCOES.map(({ label, resp, cor, bg, border }) => (
          <button
            key={label}
            onClick={() => onResponder(resp)}
            disabled={desabilitado}
            className="flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:cursor-not-allowed"
            style={{
              backgroundColor: bg,
              color: cor,
              border: `1.5px solid ${border}`,
              opacity: respondeuAtual ? 0.35 : 1,
            }}>
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={() => onResponder(null)}
        className="w-full py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"
        style={{ color: '#CCC', backgroundColor: 'transparent' }}>
        Cancelar duelo
      </button>
    </div>
  );
}