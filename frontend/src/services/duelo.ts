// src/services/duelo.ts
import api from './api';
import type {
  ConviteResponse,
  DueloQuestaoInfo,
  DueloResponse,
  DueloResultadoQuestao,
} from '../types';

// ── Convites ──────────────────────────────────────────────────────

export async function enviarConvite(emailDestinatario: string): Promise<ConviteResponse> {
  const { data } = await api.post('/api/v1/duelos/convites', { emailDestinatario });
  return data;
}

export async function buscarConvitePorToken(token: string): Promise<ConviteResponse> {
  const { data } = await api.get(`/api/v1/duelos/convites/${token}`);
  return data;
}

export async function aceitarConvite(token: string): Promise<DueloResponse> {
  const { data } = await api.post(`/api/v1/duelos/convites/${token}/aceitar`);
  return data;
}

export async function listarConvitesPendentes(): Promise<ConviteResponse[]> {
  const { data } = await api.get('/api/v1/duelos/convites/pendentes');
  return data;
}

// ── Duelos ────────────────────────────────────────────────────────

export async function iniciarDuelo(
  dueloId: number,
  payload: { totalQuestoes: number; tipoFiltro: string; filtroId: number }
): Promise<DueloResponse> {
  const { data } = await api.post(`/api/v1/duelos/${dueloId}/iniciar`, payload);
  return data;
}

export async function buscarDuelo(dueloId: number): Promise<DueloResponse> {
  const { data } = await api.get(`/api/v1/duelos/${dueloId}`);
  return data;
}

export async function listarMeusDuelos(): Promise<DueloResponse[]> {
  const { data } = await api.get('/api/v1/duelos/meus');
  return data;
}

export async function buscarQuestoesDuelo(dueloId: number): Promise<DueloQuestaoInfo[]> {
  const { data } = await api.get(`/api/v1/duelos/${dueloId}/questoes`);
  return data;
}

export async function cancelarDuelo(dueloId: number): Promise<void> {
  await api.post(`/api/v1/duelos/${dueloId}/cancelar`);
}

export async function buscarResultadoQuestoes(dueloId: number): Promise<DueloResultadoQuestao[]> {
  const { data } = await api.get(`/api/v1/duelos/${dueloId}/resultado-questoes`);
  return data;
}

export async function recusarConvite(token:string): Promise<void> {
  await api.post(`/api/v1/duelos/convites/${token}/recusar`);
}

export async function buscarConviteEnviado(): Promise<ConviteResponse| undefined> {
  const res = await api.get<ConviteResponse>('/api/v1/duelos/convites/enviado');
  return res.status === 204 ? undefined : res.data;
}