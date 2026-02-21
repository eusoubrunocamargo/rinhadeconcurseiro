import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true, // Necessário para cookies de sessão (OAuth)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de resposta para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Verifica se a requisição tem uma flag para pular o redirecionamento
    const skipRedirect = (error.config as any)?.skipRedirect;

    // Se receber 401 (não autenticado), redireciona para login
    if (error.response?.status === 401 && !skipRedirect) {
      // Evita redirect loop se já estiver na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;