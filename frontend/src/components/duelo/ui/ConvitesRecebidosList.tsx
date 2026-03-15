// src/components/duelo/ui/ConvitesRecebidosList.tsx
import type { ConviteResponse } from '../../../types';

interface ConvitesRecebidosListProps {
  convites: ConviteResponse[];
  onAceitar: (token: string) => void;
  onRecusar: (token: string) => void;
}

export default function ConvitesRecebidosList({
  convites,
  onAceitar,
  onRecusar,
}: ConvitesRecebidosListProps) {
  if (convites.length === 0) return null;

  return (
    <div className="bg-white rounded-[28px] p-6" style={{ border: '1px solid #E5E5E5' }}>
      <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#999' }}>
        Convites Recebidos
      </h2>

      <div className="flex flex-col gap-3">
        {convites.map(convite => (
          <div key={convite.id}
            className="flex items-center justify-between gap-4 p-4 rounded-2xl"
            style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}>

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#F0F0F0' }}>
                <span className="text-xs font-black" style={{ color: '#666' }}>
                  {convite.remetente.nome[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-dark-text truncate">{convite.remetente.nome}</p>
                <p className="text-xs truncate" style={{ color: '#999' }}>{convite.remetente.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onRecusar(convite.token)}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                style={{ backgroundColor: '#F5F5F5', color: '#666', border: '1px solid #E5E5E5' }}>
                Rejeitar
              </button>
              <button
                onClick={() => onAceitar(convite.token)}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                style={{ backgroundColor: '#FF4D4D', color: '#fff' }}>
                Aceitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}