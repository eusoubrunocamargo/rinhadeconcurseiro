import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Salva o token no localStorage
      localStorage.setItem('auth_token', token);
      // Redireciona para o dashboard
      navigate('/dashboard', { replace: true });
    } else if (error) {
      console.error('Erro no OAuth:', error);
      navigate('/login?error=' + error, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Autenticando...</p>
    </div>
  );
}