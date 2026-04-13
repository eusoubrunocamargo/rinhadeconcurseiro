import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InterageLayout from '../layout/InterageLayout';
import { interageApi } from '../services/interageApi';
import { C } from '../tokens';
import type { Mundo, StatusMundo } from '../types/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

function statusMundo(m: Mundo): StatusMundo {
  if (!m.desbloqueado) return 'bloqueado';
  if (m.fasesConcluidasCount === m.totalFases && m.totalFases > 0) return 'concluido';
  return 'ativo';
}

const STATUS_CONFIG: Record<StatusMundo, { label: string; color: string; bg: string }> = {
  ativo:     { label: 'Em andamento', color: C.blue,   bg: C.blueBg  },
  concluido: { label: 'Concluído',    color: C.gold,   bg: C.goldBg  },
  bloqueado: { label: 'Bloqueado',    color: C.subtle, bg: C.line    },
};

const MUNDO_ICONS: Record<number, string> = {
  1: 'graphic_eq',
  2: 'translate',
  3: 'schema',
  4: 'account_tree',
  5: 'brush',
};

// ── Componentes ───────────────────────────────────────────────────────────────

function StatusTag({ status }: { status: StatusMundo }) {
  const s = STATUS_CONFIG[status];
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 6,
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase' as const,
      whiteSpace: 'nowrap' as const,
    }}>
      {s.label}
    </span>
  );
}

function MundoCard({ mundo, onClick }: { mundo: Mundo; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const status = statusMundo(mundo);
  const locked = status === 'bloqueado';
  const concluidas = mundo.fasesConcluidasCount ?? 0;
  const pct = mundo.totalFases > 0 ? (concluidas / mundo.totalFases) * 100 : 0;
  const icon = MUNDO_ICONS[mundo.numero] ?? 'folder';

  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left',
        background: C.surface,
        border: `1px solid ${hovered && !locked ? '#C8C8C8' : C.line}`,
        borderRadius: 16, padding: '18px 18px 16px',
        cursor: locked ? 'default' : 'pointer',
        opacity: locked ? 0.45 : 1,
        boxShadow: hovered && !locked ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.15s',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: C.bg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: locked ? C.subtle : C.text }}>
              {icon}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Mundo {String(mundo.numero).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginTop: 2 }}>
              {mundo.nome}
            </div>
            {mundo.descricao && (
              <div style={{ fontSize: 11, color: C.subtle, marginTop: 1 }}>
                {mundo.descricao}
              </div>
            )}
          </div>
        </div>
        <StatusTag status={status} />
      </div>

      {/* Barra de progresso */}
      {!locked && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 3, borderRadius: 99, background: C.line, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: C.green, borderRadius: 99, transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ fontSize: 11, color: C.subtle, fontWeight: 600 }}>
            {concluidas} de {mundo.totalFases} fases concluídas
          </div>
        </div>
      )}
    </button>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function MapaMundos() {
  const navigate = useNavigate();
  const [mundos, setMundos] = useState<Mundo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    interageApi.listarMundos()
      .then(setMundos)
      .catch(() => setErro('Não foi possível carregar os mundos.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <InterageLayout>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', flexShrink: 0 }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', marginBottom: 16 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: C.text }}>arrow_back</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
              Módulo
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1, margin: 0 }}>
              Interage
            </h1>
          </div>
          <span style={{
            padding: '3px 9px', borderRadius: 6,
            background: C.blueBg, color: C.blue,
            fontSize: 10, fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase' as const,
          }}>
            Língua Portuguesa
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: C.line, flexShrink: 0 }} />

      {/* Conteúdo */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
            <div style={{ width: 28, height: 28, border: `3px solid ${C.line}`, borderTopColor: C.text, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {erro && (
          <p style={{ fontSize: 13, color: C.red, textAlign: 'center', paddingTop: 48 }}>{erro}</p>
        )}

        {!loading && !erro && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mundos.map(m => (
              <MundoCard
                key={m.id}
                mundo={m}
                onClick={() => navigate(`/interage/${m.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </InterageLayout>
  );
}