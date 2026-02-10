import api from './api';
import type { Simulado, SimuladoDetalhado } from '../types';

export async function getSimulados(): Promise<Simulado[]> {
  const response = await api.get<Simulado[]>('/api/v1/simulados');
  return response.data;
}

export async function getSimuladoById(id: number): Promise<SimuladoDetalhado> {
  const response = await api.get<SimuladoDetalhado>(`/api/v1/simulados/${id}`);
  return response.data;
}