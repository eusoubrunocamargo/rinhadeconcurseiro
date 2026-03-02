import { getOAuthLoginUrl } from '../services/auth';

const FEATURES = [
  { icon: 'calendar_month',  label: 'Simulados até a prova' },
  { icon: 'gavel',           label: 'Padrão de correção da banca' },
  { icon: 'psychology',      label: 'Sistema de autofeedback' },
  { icon: 'menu_book',       label: 'Revisões orientadas' },
];

export default function Home() {
  const handleGoogleLogin = () => {
    window.location.href = getOAuthLoginUrl();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-display"
      style={{ backgroundColor: '#F5F5F5' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-3">

        {/* ── Card principal ─────────────────────────────────── */}
        <div
          className="bg-white rounded-3xl p-8 flex flex-col gap-6"
          style={{ border: '1px solid #E5E5E5' }}
        >
          {/* Logotipo / título */}
          <div className="flex flex-col gap-1">
            {/* <p className="text-[10px] font-black uppercase tracking-widest text-subtle-text">
              
            </p> */}
            <h1 className="text-2xl font-black text-dark-text leading-tight">
              Rinha de<br />Concurseiro.
            </h1>
            <p className="text-xs text-subtle-text font-medium mt-1">
              Preparação avançada no seu pós-edital
            </p>
          </div>

          {/* Divisor */}
          <div style={{ borderTop: '1px solid #F0F0F0' }} />

          {/* Features */}
          <div className="flex flex-col gap-2.5">
            {FEATURES.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#F5F5F5' }}
                >
                  <span
                    className="material-symbols-outlined text-dark-text"
                    style={{ fontSize: '14px' }}
                  >
                    {icon}
                  </span>
                </div>
                <span className="text-xs font-medium text-dark-text">{label}</span>
              </div>
            ))}
          </div>

          {/* Divisor */}
          <div style={{ borderTop: '1px solid #F0F0F0' }} />

          {/* Botão Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: '#1A1A1A', color: '#fff' }}
          >
            {/* SVG Google */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#fff" fillOpacity=".9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#fff" fillOpacity=".75" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" fillOpacity=".6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#fff" fillOpacity=".85" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>
        </div>

        {/* ── Rodapé ─────────────────────────────────────────── */}
        <p className="text-center text-[10px] text-subtle-text font-medium">
          Plataforma em fase de testes para usuários restritos
        </p>

      </div>
    </div>
  );
}