// src/hooks/useDueloLobby.ts
import { useState, useCallback } from 'react';
import { listarMeusDuelos } from '../services/duelo';
import type { DueloResponse } from '../types';

interface UseDueloLobbyReturn {
  duelosAtivos: DueloResponse[];
  loading: boolean;
  carregarDuelos: () => Promise<void>;
}

export function useDueloLobby(): UseDueloLobbyReturn {
  const [duelosAtivos, setDuelosAtivos] = useState<DueloResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDuelos = useCallback(async () => {
    const result = await Promise.allSettled([listarMeusDuelos()]);
    const duelos = result[0].status === 'fulfilled' ? result[0].value : [];
    setDuelosAtivos(duelos.filter(d => d.status !== 'FINALIZADO' && d.status !== 'CANCELADO'));
    setLoading(false);
  }, []);

  return { duelosAtivos, loading, carregarDuelos };
}