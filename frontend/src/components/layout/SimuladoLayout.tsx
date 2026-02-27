import React from 'react';

interface SimuladoLayoutProps {
  header: React.ReactNode;
  minimapa: React.ReactNode;
  navRodape: React.ReactNode;
  children: React.ReactNode;
}

export default function SimuladoLayout({
  header,
  minimapa,
  navRodape,
  children,
}: SimuladoLayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-hub font-display">

      {/* Zona 1 — Header fixo */}
      <header className="shrink-0 bg-white border-b border-border-hub z-50">
        {header}
      </header>

      {/* Zona 2 — Conteúdo rolável */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto px-6 py-8 pb-4">
          {children}
        </div>
      </main>

      {/* Zona 3 — Mini-mapa fixo */}
      <div className="shrink-0 bg-white/95 backdrop-blur-md border-t border-b border-border-hub z-30">
        {minimapa}
      </div>

      {/* Zona 4 — Nav de rodapé fixo */}
      <nav className="shrink-0 bg-white border-t border-border-hub z-40">
        {navRodape}
      </nav>

    </div>
  );
}