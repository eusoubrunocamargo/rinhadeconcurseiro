import api from './api';
import type { User } from '../types';

/**
 * Verifica se o usuário está autenticado (tem token válido)
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token');
}

/**
 * Busca os dados do usuário logado.
 * Retorna null se não estiver autenticado.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const response = await api.get<User>('/api/v1/usuarios/me', {
      skipRedirect: true,
    });
    return response.data;
  } catch {
    // Token inválido ou expirado
    localStorage.removeItem('auth_token');
    return null;
  }
}

/**
 * Faz logout - remove o token local
 */
export function logout(): void {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}

/**
 * Retorna a URL para iniciar o login OAuth
 */
export function getOAuthLoginUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  return `${apiUrl}/oauth2/authorization/google`;
}