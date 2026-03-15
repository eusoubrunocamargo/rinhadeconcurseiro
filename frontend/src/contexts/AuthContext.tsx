import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import type { User } from '../types';
import { getCurrentUser, getOAuthLoginUrl, logout as logoutService } from '../services/auth';
import { AuthContext, type AuthContextType } from './auth-context';

// Tipos do contexto
// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   isAuthenticated: boolean;
//   login: () => void;
//   logout: () => Promise<void>;
//   refreshUser: () => Promise<void>;
// }

// Valor padrão (nunca usado diretamente, mas necessário para tipagem)
// const defaultValue: AuthContextType = {
//   user: null,
//   loading: true,
//   isAuthenticated: false,
//   login: () => {},
//   logout: async () => {},
//   refreshUser: async () => {},
// };

// Criar o contexto
// export const AuthContext = createContext<AuthContextType>(defaultValue);

// Props do Provider
interface AuthProviderProps {
  children: ReactNode;
}

// Componente Provider
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica autenticação ao montar o componente
  useEffect(() => {
    checkAuth();
  }, []);

  // Busca usuário atual no backend
  async function checkAuth() {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Redireciona para login OAuth
  function login() {
    window.location.href = getOAuthLoginUrl();
  }

  // Faz logout e limpa estado
  async function logout() {
    await logoutService();
    setUser(null);
    window.location.href = '/';
  }

  // Recarrega dados do usuário (útil após ações)
  async function refreshUser() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  // Valor disponibilizado para a aplicação
  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
