import { useState, useEffect } from 'react';

interface Props {
  respondeuAtual: boolean;
  foiSegundo: boolean;
  oponenteRespondeu: boolean;
  nomeOponente: string;
}

export default function BadgeEstado({
  respondeuAtual,
  foiSegundo,
  oponenteRespondeu,
  nomeOponente,
}: Props) {

  // Segundo a responder — mostra countdown
  if (respondeuAtual && foiSegundo) {
    return <Countdown seconds={5} label="Calculando resultado" />;
  }

  // Primeiro a responder — aguarda oponente até QUESTAO_RESOLVIDA chegar
  if (respondeuAtual && !foiSegundo) {
    return (
      <div className="px-3 py-2 rounded-2xl flex items-center gap-2"
        style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
        <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin shrink-0"
          style={{ borderColor: '#BAE6FD', borderTopColor: '#0EA5E9' }} />
        <p className="text-xs font-bold" style={{ color: '#0EA5E9' }}>
          Aguardando {nomeOponente}...
        </p>
      </div>
    );
  }

  // Oponente respondeu primeiro — pressione para responder
  if (!respondeuAtual && oponenteRespondeu) {
    return (
      <div className="px-3 py-2 rounded-2xl flex items-center gap-2"
        style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <span className="material-symbols-outlined shrink-0"
          style={{ fontSize: '14px', color: '#D97706' }}>bolt</span>
        <p className="text-xs font-bold" style={{ color: '#D97706' }}>
          {nomeOponente} respondeu! Responda agora.
        </p>
      </div>
    );
  }

  return null;
}

function Countdown({ seconds, label }: { seconds: number; label: string }) {
  const [restante, setRestante] = useState(seconds);

  useEffect(() => { setRestante(seconds); }, [seconds]);

  useEffect(() => {
    if (restante <= 0) return;
    const t = setTimeout(() => setRestante(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [restante]);

  return (
    <div className="px-4 py-2.5 rounded-2xl flex items-center justify-between"
      style={{ backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5' }}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin shrink-0"
          style={{ borderColor: '#E5E5E5', borderTopColor: '#999' }} />
        <p className="text-xs font-bold" style={{ color: '#999' }}>{label}...</p>
      </div>
      <span className="text-sm font-black" style={{ color: '#1A1A1A' }}>{restante}s</span>
    </div>
  );
}