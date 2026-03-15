// src/components/duelo/ui/DuelosAtivosList.tsx
import type { DueloResponse } from '../../../types';

interface DuelosAtivosListProps {
  duelos: DueloResponse[];
  userId?: number;
  onSelecionar: (id: number) => void;
}

export default function DuelosAtivosList({ duelos, userId, onSelecionar }: DuelosAtivosListProps) {
  if (duelos.length === 0) return null;

  return (
    <div className="bg-white rounded-[28px] p-6" style={{ border: '1px solid #E5E5E5' }}>
      <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#999' }}>
        Em Andamento
      </h2>

      <div className="flex flex-col gap-3">
        {duelos.map(duelo => {
          const euSouHost = duelo.host.id === userId;
          const oponente = euSouHost ? duelo.desafiado : duelo.host;

          return (
            <button
              key={duelo.id}
              onClick={() => onSelecionar(duelo.id)}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl w-full text-left transition-all"
              style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF4D4D'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0F0F0'; }}>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#F0F0F0' }}>
                  <span className="text-xs font-black" style={{ color: '#666' }}>
                    {oponente.nome[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-dark-text truncate">vs {oponente.nome}</p>
                  <p className="text-xs" style={{
                    color: duelo.status === 'EM_ANDAMENTO' ? '#FF4D4D' : '#999'
                  }}>
                    {duelo.status === 'EM_ANDAMENTO' ? 'Em andamento' : 'Aguardando configuração'}
                  </p>
                </div>
              </div>

              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px', color: '#CCC' }}>
                chevron_right
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}