import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/dashboard',    icon: 'dashboard',   label: 'Dashboard'        },
  { to: '/simulados',    icon: 'edit_note',    label: 'Simulados'        },
  { to: '/ranking',      icon: 'leaderboard',  label: 'Rankings'         },
  { to: '/cadernos',     icon: 'menu_book',    label: 'Caderno de Erros' },
  { to: '/estatisticas', icon: 'query_stats',  label: 'Estatísticas'     },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const sidebarContent = (
    <div className="p-6 flex-1 flex flex-col">

      {/* Logomarca */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 bg-dark-text rounded-lg flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>school</span>
        </div>
        <h1 className="text-sm font-extrabold uppercase tracking-tight text-dark-text leading-tight">
          Rinha de<br />Concurseiro<span className="text-accent">.</span>
        </h1>
      </div>

      {/* Avatar */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-gray-200 mb-3 overflow-hidden border-2 border-border-hub p-1">
          {user?.fotoUrl
            ? <img src={user.fotoUrl} alt={user.nome} className="w-full h-full object-cover rounded-full" />
            : <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-2xl font-black text-gray-400">
                {user?.nome?.[0]?.toUpperCase() ?? '?'}
              </div>
          }
        </div>
        <h2 className="font-bold text-dark-text text-sm">{user?.apelido || user?.nome}</h2>
        <p className="text-xs text-subtle-text font-medium">Concurseiro</p>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-bold ${
                isActive
                  ? 'bg-red-50 text-accent'
                  : 'text-subtle-text hover:bg-gray-100 hover:text-dark-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '18px', color: isActive ? '#FF4D4D' : undefined }}
                >
                  {icon}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sair */}
      <div className="mt-4 pt-4 border-t border-border-hub">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'inherit' }}>logout</span>
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-background-hub font-display">

      {/* ── Sidebar desktop ── */}
      <aside className="w-64 bg-white border-r border-border-hub shrink-0 flex-col hidden md:flex z-50">
        {sidebarContent}
      </aside>

      {/* ── Sidebar mobile (drawer) ── */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-xl md:hidden overflow-y-auto">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* ── Área de conteúdo ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header mobile */}
        <header className="md:hidden bg-white border-b border-border-hub shrink-0 px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-dark-text" style={{ fontSize: '22px' }}>menu</span>
          </button>
          <h1 className="text-sm font-extrabold uppercase tracking-tight text-dark-text">
            Rinha de Concurseiro<span className="text-accent">.</span>
          </h1>
        </header>

        {/* Conteúdo rolável */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
