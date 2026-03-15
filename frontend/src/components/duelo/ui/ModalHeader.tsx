interface Props {
  titulo: string;
  subtitulo: string;
  onFechar?: () => void;
}

export default function ModalHeader({ titulo, subtitulo, onFechar }: Props) {
  return (
    <div className="px-5 py-4 flex items-center justify-between shrink-0"
      style={{ borderBottom: '1px solid #F0F0F0' }}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#999' }}>
          {subtitulo}
        </p>
        <h2 className="text-base font-black text-dark-text">{titulo}</h2>
      </div>
      {onFechar && (
        <button
          onClick={onFechar}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100">
          <span className="material-symbols-outlined"
            style={{ fontSize: '18px', color: '#CCC' }}>
            close
          </span>
        </button>
      )}
    </div>
  );
}