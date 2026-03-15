interface Participante {
  id: number;
  nome?: string;
  apelido?: string;
  fotoUrl?: string;
}

interface Props {
  eu: Participante | null;
  oponente: Participante | null;
  meusPontos: number;
  pontosOponente: number;
}

export default function PlacarHeader({ eu, oponente, meusPontos, pontosOponente }: Props) {
  return (
    <div className="px-5 py-3 flex items-center justify-between shrink-0"
      style={{ borderBottom: '1px solid #F0F0F0' }}>

      <div className="flex items-center gap-2 min-w-0">
        <Avatar usuario={eu} />
        <span className="text-xs font-black text-dark-text truncate max-w-[70px]">
          {eu?.apelido || eu?.nome?.split(' ')[0]}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-2xl font-black" style={{ color: '#FF4D4D' }}>{meusPontos}</span>
        <span className="text-base font-black" style={{ color: '#E5E5E5' }}>×</span>
        <span className="text-2xl font-black text-dark-text">{pontosOponente}</span>
      </div>

      <div className="flex items-center gap-2 min-w-0 flex-row-reverse">
        <Avatar usuario={oponente} />
        <span className="text-xs font-black text-dark-text truncate max-w-[70px] text-right">
          {oponente?.apelido || oponente?.nome?.split(' ')[0]}
        </span>
      </div>
    </div>
  );
}

function Avatar({ usuario }: { usuario: Participante | null | undefined }) {
  const inicial = (usuario?.apelido || usuario?.nome || '?').charAt(0).toUpperCase();

  if (usuario?.fotoUrl) {
    return (
      <img
        src={usuario.fotoUrl}
        alt={usuario.nome}
        className="w-8 h-8 rounded-full object-cover shrink-0"
        style={{ border: '2px solid #E5E5E5' }}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
      style={{ backgroundColor: '#F5F5F5', color: '#1A1A1A', border: '2px solid #E5E5E5' }}>
      {inicial}
    </div>
  );
}