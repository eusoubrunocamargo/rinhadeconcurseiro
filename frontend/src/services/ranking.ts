import api from './api';
import type { Ranking } from '../types';

export async function getRankingGeral(): Promise<Ranking> {
  const response = await api.get<Ranking>('/api/v1/ranking/geral');
  return response.data;
}

export async function getRankingPorSimulado(simuladoId: number): Promise<Ranking> {
  const response = await api.get<Ranking>(`/api/v1/ranking/simulado/${simuladoId}`);
  return response.data;
}