import { Routes, Route } from 'react-router-dom';

// Pages (criaremos em seguida)
import Home from './pages/Home';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      
      {/* 
        Rotas futuras (descomentar conforme implementar):
        
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/simulados" element={<SimuladosList />} />
        <Route path="/simulados/:id" element={<SimuladoPlay />} />
        <Route path="/simulados/:id/resultado" element={<SimuladoResultado />} />
      */}
    </Routes>
  );
}