import api from './api';
import type { User } from '../types';

/**
 * Atualiza o apelido do usuário logado.
 */
export async function updateApelido(apelido: string): Promise<User> {
  const response = await api.put<User>('/api/v1/usuarios/me/apelido', {
    apelido,
  });
  return response.data;
}