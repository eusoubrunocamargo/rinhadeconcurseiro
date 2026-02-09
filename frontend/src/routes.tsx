import { Routes, Route } from 'react-router-dom';

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

      {/* 
        Rotas futuras:
        
        <Route path="/simulados" element={<ProtectedRoute><SimuladosList /></ProtectedRoute>} />
        <Route path="/simulados/:id" element={<ProtectedRoute><SimuladoPlay /></ProtectedRoute>} />
        <Route path="/simulados/:id/resultado" element={<ProtectedRoute><SimuladoResultado /></ProtectedRoute>} />
      */}
    </Routes>
  );
}