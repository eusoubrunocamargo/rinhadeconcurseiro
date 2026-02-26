import { Routes, Route, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SimuladosList from './pages/SimuladosList';
import SimuladoPlay from './pages/SimuladoPlay';
import SimuladoResult from './pages/SimuladoResult';
import SimuladoFeedback from './pages/SimuladoFeedback';
import CadernoView from './pages/CadernoView';
import RankingPage from './pages/RankingPage';
import OAuthCallback from './pages/OAuthCallback';
import Estatisticas from './pages/Estatisticas';



export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/simulados"
        element={
          <ProtectedRoute>
            <SimuladosList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/simulados/:id"
        element={
          <ProtectedRoute>
            <SimuladoPlay />
          </ProtectedRoute>
        }
      />

      <Route
        path="/simulados/:id/feedback"
        element={
          <ProtectedRoute>
            <SimuladoFeedback />
          </ProtectedRoute>
        }
      />

      <Route
        path="/simulados/:id/resultado"
        element={
          <ProtectedRoute>
            <SimuladoResult />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadernos/:caderno"
        element={
          <ProtectedRoute>
            <CadernoView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ranking"
        element={
          <ProtectedRoute>
            <RankingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/estatisticas"
        element={
          <ProtectedRoute>
            <Estatisticas />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <span className="text-6xl mb-4 block">🚧</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600 mb-4">Em construção</p>

        <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}