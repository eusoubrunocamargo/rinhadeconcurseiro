import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InterageLayout from '../layout/InterageLayout';
import { interageApi } from '../services/interageApi';
import { C } from '../tokens';
import type { Fase, StatusFase } from '../types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusFase(f: Fase): StatusFase {
  if (!f.desbloqueada) return 'bloqueada';
  if (f.etapa === 'CONCLUIDA') return 'concluida';
  return 'andamento';
}

function scoreLabel(f: Fase): string | null {
  if (f.etapa !== 'CONCLUIDA' || f.scorePct == null) return null;
  return `${f.scorePct}%`;
}

// ── Nodo de fase ──────────────────────────────────────────────────────────────

function NodoFase({ fase, onClick }: { fase: Fase; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const status = statusFase(fase);
  const locked = status === 'bloqueada';
  const done = status === 'concluida';
  const active = status === 'andamento';
  const score = scoreLabel(fase);

  const bg = done   ? C.green
           : active ? C.text
           : C.line;

  const fg = (done || active) ? '#fff' : C.subtle;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <button
        onClick={locked ? undefined : onClick}
        disabled={locked}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: bg, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: locked ? 'default' : 'pointer',
          opacity: locked ? 0.4 : 1,
          boxShadow: active ? `0 0 0 3px ${C.text}22` : 'none',
          transform: hovered && !locked ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          flexShrink: 0,
        }}
      >
        {locked
          ? <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.subtle }}>lock</span>
          : <span style={{ fontSize: 16, fontWeight: 800, color: fg, fontFamily: "'Manrope', sans-serif" }}>{fase.numero}</span>
        }
      </button>

      {/* Score da fase concluída */}
      {done && score != null && (
        <span style={{ fontSize: 10, fontWeight: 700, color: C.gold }}>
          {score}
        </span>
      )}

      <span style={{ fontSize: 10, fontWeight: 600, color: C.mid, textAlign: 'center', maxWidth: 64, lineHeight: 1.3 }}>
        {fase.nome}
      </span>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function MapaFases() {
  const { mundoId } = useParams<{ mundoId: string }>();
  const navigate = useNavigate();
  const [fases, setFases] = useState<Fase[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [nomesMundo, setNomesMundo] = useState({ numero: '', nome: '' });

  useEffect(() => {
    if (!mundoId) return;
    const id = Number(mundoId);

    Promise.all([
      interageApi.listarMundos(),
      interageApi.listarFases(id),
    ])
      .then(([mundos, fasesList]) => {
        const m = mundos.find(x => x.id === id);
        if (m) setNomesMundo({ numero: String(m.numero).padStart(2, '0'), nome: m.nome });
        setFases(fasesList);
      })
      .catch(() => setErro('Não foi possível carregar as fases.'))
      .finally(() => setLoading(false));
  }, [mundoId]);

  const concluidas = fases.filter(f => f.etapa === 'CONCLUIDA').length;

  return (
    <InterageLayout>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <button
          onClick={() => navigate('/interage')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: C.text }}>arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Mundo {nomesMundo.numero}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginTop: 1 }}>
            {nomesMundo.nome}
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.mid }}>
          {concluidas}/{fases.length} fases
        </span>
      </div>

      {/* Barra global */}
      <div style={{ padding: '0 20px 12px', flexShrink: 0 }}>
        <div style={{ height: 3, borderRadius: 99, background: C.line, overflow: 'hidden' }}>
          <div style={{ width: fases.length ? `${(concluidas / fases.length) * 100}%` : '0%', height: '100%', background: C.green, borderRadius: 99, transition: 'width 0.6s' }} />
        </div>
      </div>

      <div style={{ height: 1, background: C.line, flexShrink: 0 }} />

      {/* Grade */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 32px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
            <div style={{ width: 28, height: 28, border: `3px solid ${C.line}`, borderTopColor: C.text, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {erro && (
          <p style={{ fontSize: 13, color: C.red, textAlign: 'center', paddingTop: 48 }}>{erro}</p>
        )}

        {!loading && !erro && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px 16px' }}>
            {fases.map(fase => (
              <div key={fase.id} style={{ display: 'flex', justifyContent: 'center' }}>
                <NodoFase
                  fase={fase}
                  onClick={() => navigate(`/interage/${mundoId}/${fase.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </InterageLayout>
  );
}