import ModalHeader from '../ui/ModalHeader';

interface Props {
  nomeOponente: string;
  onCancelar: () => void;
}

export default function FaseAguardando({ nomeOponente, onCancelar }: Props) {
  return (
    <>
      <ModalHeader
        titulo="Aguardando..."
        subtitulo={`vs ${nomeOponente}`}
        onFechar={onCancelar}
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#FFF0F0', border: '2px solid #FFD5D5' }}>
          <span className="material-symbols-outlined"
            style={{ fontSize: '36px', color: '#FF4D4D' }}>
            hourglass_top
          </span>
        </div>

        <div className="text-center">
          <p className="text-base font-black text-dark-text mb-1">
            {nomeOponente} está configurando
          </p>
          <p className="text-sm" style={{ color: '#999' }}>
            O duelo começará em instantes...
          </p>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i}
              className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{ backgroundColor: '#FF4D4D', animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
      </div>
    </>
  );
}