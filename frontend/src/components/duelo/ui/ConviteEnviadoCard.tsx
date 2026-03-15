// src/components/duelo/ui/ConviteEnviadoCard.tsx
export default function ConviteEnviadoCard() {
  return (
    <div className="bg-white rounded-[28px] p-6" style={{ border: '1px solid #E5E5E5' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#FFF0F0', border: '1px solid #FFD5D5' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#FF4D4D' }}>
            hourglass_top
          </span>
        </div>
        <div>
          <h2 className="text-sm font-black text-dark-text">Convite Enviado</h2>
          <p className="text-xs" style={{ color: '#999' }}>Aguardando resposta do oponente...</p>
        </div>
      </div>
    </div>
  );
}