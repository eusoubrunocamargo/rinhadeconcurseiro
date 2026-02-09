import api from './api';
import type { User } from '../types';

/**
 * Busca os dados do usuário logado.
 * Retorna null se não estiver autenticado.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<User>('api/v1/usuarios/me');
    return response.data;
  } catch (error) {
    // 401 = não autenticado, retorna null
    return null;
  }
}

/**
 * Faz logout no backend (invalida sessão).
 */
export async function logout(): Promise<void> {
  try {
    await api.post('/logout');
  } catch (error) {
    // Ignora erros de logout
  }
}