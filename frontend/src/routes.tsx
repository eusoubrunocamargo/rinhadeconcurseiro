import { Routes, Route, Navigate } from 'react-router-dom';

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
import Duelo from './pages/Duelo';
import DueloConfigurar from './pages/DueloConfigurar';

const DueloLive = () => <div>Live em breve</div>
const DueloHistorico = () => <div>Histórico em breve</div>

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Home />} />
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

      <Route
        path="/duelo"
        element={
          <ProtectedRoute>
            <Duelo />
          </ProtectedRoute>
        }
      />

      <Route path="/duelo/configurar/:id" element={<ProtectedRoute><DueloConfigurar /></ProtectedRoute>} />
      <Route path="/duelo/live/:id" element={<ProtectedRoute><DueloLive /></ProtectedRoute>} />
      <Route path="/duelo/historico" element={<ProtectedRoute><DueloHistorico /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
