import React from 'react';

interface SimuladoLayoutProps {
  header:    React.ReactNode;
  navRodape: React.ReactNode;
  children:  React.ReactNode;
}

export default function SimuladoLayout({
  header,
  navRodape,
  children,
}: SimuladoLayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-hub font-display">

      {/* Zona 1 — Header fixo */}
      <header
        className="shrink-0 bg-white z-50"
        style={{ borderBottom: '1px solid #E5E5E5' }}
      >
        {header}
      </header>

      {/* Zona 2 — Conteúdo rolável */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[580px] w-full mx-auto px-4 py-6 pb-4">
          {children}
        </div>
      </main>

      {/* Zona 3 — Nav de rodapé fixo */}
      <nav
        className="shrink-0 bg-white z-40"
        style={{ borderTop: '1px solid #E5E5E5' }}
      >
        {navRodape}
      </nav>

    </div>
  );
}