import { Routes, Route, Navigate } from 'react-router-dom';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />

      {/* Rotas Protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Placeholder para rotas futuras */}
      <Route
        path="/simulados"
        element={
          <ProtectedRoute>
            <ComingSoon title="Simulados" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ranking"
        element={
          <ProtectedRoute>
            <ComingSoon title="Ranking" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/estatisticas"
        element={
          <ProtectedRoute>
            <ComingSoon title="Estatísticas" />
          </ProtectedRoute>
        }
      />

      {/* Rota 404 - redireciona para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Componente temporário para páginas em construção
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <span className="text-6xl mb-4 block">🚧</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600 mb-4">Em construção</p>
        
        <a href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Voltar ao início
        </a>
      </div>
    </div>
  );
}