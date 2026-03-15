import ModalHeader from '../ui/ModalHeader';

interface Props {
  nomeOponente: string;
  meusPontos: number;
  pontosOponente: number;
  idVencedor: number | null;
  meuId: number | undefined;
  onFechar: () => void;
}

export default function FaseFinalizado({
  nomeOponente,
  meusPontos,
  pontosOponente,
  idVencedor,
  meuId,
  onFechar,
}: Props) {
  const empate   = idVencedor === null;
  const venceu   = idVencedor === meuId;

  return (
    <>
      <ModalHeader titulo="Duelo Finalizado" subtitulo={`vs ${nomeOponente}`} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">

        {/* Ícone de resultado */}
        {empate && (
          <ResultadoIcon icon="handshake" cor="#666" bg="#F5F5F5"
            label="Empate!" labelCor="#1A1A1A" />
        )}
        {!empate && venceu && (
          <ResultadoIcon icon="emoji_events" cor="#D97706" bg="#FFFBEB"
            label="Você venceu!" labelCor="#059669" />
        )}
        {!empate && !venceu && (
          <ResultadoIcon icon="sentiment_dissatisfied" cor="#DC2626" bg="#FFF5F5"
            label={`${nomeOponente} venceu`} labelCor="#DC2626" />
        )}

        {/* Placar final */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-5xl font-black text-dark-text leading-none">{meusPontos}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2"
              style={{ color: '#999' }}>
              Você
            </p>
          </div>
          <span className="text-3xl font-black" style={{ color: '#E5E5E5' }}>×</span>
          <div className="text-center">
            <p className="text-5xl font-black text-dark-text leading-none">{pontosOponente}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2"
              style={{ color: '#999' }}>
              {nomeOponente}
            </p>
          </div>
        </div>

        <button
          onClick={onFechar}
          className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest"
          style={{ backgroundColor: '#1A1A1A', color: '#fff' }}>
          Fechar
        </button>
      </div>
    </>
  );
}

function ResultadoIcon({ icon, cor, bg, label, labelCor }: {
  icon: string;
  cor: string;
  bg: string;
  label: string;
  labelCor: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: bg }}>
        <span className="material-symbols-outlined" style={{ fontSize: '38px', color: cor }}>
          {icon}
        </span>
      </div>
      <p className="text-xl font-black" style={{ color: labelCor }}>{label}</p>
    </div>
  );
}