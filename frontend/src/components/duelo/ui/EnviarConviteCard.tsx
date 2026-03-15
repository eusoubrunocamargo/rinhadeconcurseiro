// src/components/duelo/ui/EnviarConviteCard.tsx
interface EnviarConviteCardProps {
  email: string;
  setEmail: (v: string) => void;
  enviando: boolean;
  feedbackEnvio: { tipo: 'sucesso' | 'erro'; mensagem: string } | null;
  onEnviar: () => void;
}

export default function EnviarConviteCard({
  email,
  setEmail,
  enviando,
  feedbackEnvio,
  onEnviar,
}: EnviarConviteCardProps) {
  return (
    <div className="bg-white rounded-[28px] p-6" style={{ border: '1px solid #E5E5E5' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#FFF0F0', border: '1px solid #FFD5D5' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#FF4D4D' }}>
            swords
          </span>
        </div>
        <div>
          <h2 className="text-sm font-black text-dark-text uppercase tracking-wide">Novo Duelo</h2>
          <p className="text-xs" style={{ color: '#999' }}>Informe o e-mail do seu oponente</p>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnviar()}
          placeholder="email@exemplo.com"
          className="flex-1 px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
          style={{ border: '1.5px solid #E5E5E5', color: '#1A1A1A', backgroundColor: '#FAFAFA' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#FF4D4D'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#E5E5E5'; }}
        />
        <button
          onClick={onEnviar}
          disabled={enviando || !email.trim()}
          className="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#FF4D4D', color: '#fff' }}
        >
          {enviando ? 'Enviando...' : 'Desafiar'}
        </button>
      </div>

      {feedbackEnvio && (
        <p className="text-xs font-bold mt-3" style={{ color: '#DC2626' }}>
          {feedbackEnvio.mensagem}
        </p>
      )}
    </div>
  );
}