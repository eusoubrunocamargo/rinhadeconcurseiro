import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="font-bold text-gray-800 hidden sm:inline">
              Rinha de Concurseiro
            </span>
          </Link>

          {/* Navegação Central */}
          <nav className="hidden md:flex items-center gap-6">
            
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Início
            </Link>
            
            <Link to="/simulados" className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Simulados
            </Link>
            
            <Link to="/ranking" className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Ranking
            </Link>
          </nav>

          {/* Usuário */}
          <div className="flex items-center gap-4">
            <Link to="/perfil" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {user?.fotoUrl ? (
                <img
                  src={user.fotoUrl}
                  alt={user.nome}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                  {user?.nome?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-gray-700 text-sm hidden sm:inline">
                {user?.apelido || user?.nome?.split(' ')[0]}
              </span>
            </Link>

            <button
              onClick={logout}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="Sair"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}