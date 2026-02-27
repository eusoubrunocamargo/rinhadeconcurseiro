import axios from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipRedirect?: boolean;
  }
  interface InternalAxiosRequestConfig {
    skipRedirect?: boolean;
  }
}


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipRedirect = error.config?.skipRedirect;

    // Se receber 401 (não autenticado), limpa o token e redireciona
    if (error.response?.status === 401 && !skipRedirect) {
      localStorage.removeItem('auth_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;