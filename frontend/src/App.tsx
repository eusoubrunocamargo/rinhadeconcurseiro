import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import { NotificacoesProvider } from './contexts/NotificacoesContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificacoesProvider>
        <AppRoutes />
        </NotificacoesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}