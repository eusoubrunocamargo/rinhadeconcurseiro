import api from './api';
import type {
  TentativaIniciada,
  TentativaResumo,
  TentativaDetalhe,
  SalvarRespostasRequest,
  MeuProgresso,
  CadernoResumo,
  CadernoDetalhe,
  Caderno,
  ResumoAssunto,
} from '../types';

// ============================================
// INICIAR SIMULADO
// ============================================
export async function iniciarSimulado(simuladoId: number, refazer: boolean = false): Promise<TentativaIniciada> {
  const response = await api.post<TentativaIniciada>(
    `/api/v1/simulados/${simuladoId}/iniciar?refazer=${refazer}`
  );
  return response.data;
}

// ============================================
// MEUS SIMULADOS
// ============================================
export async function getSimuladosEmAndamento(): Promise<TentativaResumo[]> {
  const response = await api.get<TentativaResumo[]>('/api/v1/usuarios/me/simulados/em-andamento');
  return response.data;
}

export async function getSimuladosFinalizados(): Promise<TentativaResumo[]> {
  const response = await api.get<TentativaResumo[]>('/api/v1/usuarios/me/simulados/finalizados');
  return response.data;
}

export async function getTentativaById(tentativaId: number): Promise<TentativaDetalhe> {
  const response = await api.get<TentativaDetalhe>(`/api/v1/usuarios/me/simulados/${tentativaId}`);
  return response.data;
}

// ============================================
// RESPOSTAS
// ============================================
export async function salvarRespostas(
  tentativaId: number,
  request: SalvarRespostasRequest
): Promise<void> {
  await api.put(`/api/v1/usuarios/me/simulados/${tentativaId}/respostas`, request);
}

export async function finalizarTentativa(tentativaId: number): Promise<TentativaDetalhe> {
  const response = await api.put<TentativaDetalhe>(
    `/api/v1/usuarios/me/simulados/${tentativaId}/finalizar`
  );
  return response.data;
}

// ============================================
// PROGRESSO E CADERNOS
// ============================================
export async function getMeuProgresso(): Promise<MeuProgresso> {
  const response = await api.get<MeuProgresso>('/api/v1/usuarios/me/progresso');
  return response.data;
}

export async function getCadernosResumo(): Promise<CadernoResumo> {
  const response = await api.get<CadernoResumo>('/api/v1/usuarios/me/cadernos');
  return response.data;
}

export async function getCadernoDetalhe(caderno: Caderno): Promise<CadernoDetalhe> {
  const response = await api.get<CadernoDetalhe>(`/api/v1/usuarios/me/cadernos/${caderno}`);
  return response.data;
}

// Sprint 2: resumo completo de assuntos de um caderno (sem limite)
export async function getResumoCaderno(caderno: Caderno): Promise<ResumoAssunto[]> {
  const response = await api.get<ResumoAssunto[]>(
    `/api/v1/usuarios/me/cadernos/${caderno}/resumo`
  );
  return response.data;
}