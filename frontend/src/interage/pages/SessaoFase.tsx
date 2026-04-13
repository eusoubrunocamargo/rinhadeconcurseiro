import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import InterageLayout from '../layout/InterageLayout';
import { interageApi } from '../services/interageApi';
import { C } from '../tokens';
import type {
  CheckpointResultado,
  Exercicio,
  FeedbackResposta,
  QuestaoClassificada,
} from '../types/index';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS LOCAIS
// ─────────────────────────────────────────────────────────────────────────────

type Tela =
  | 'LOADING'
  | 'ERRO'
  | 'INTRODUCAO'
  | 'PRATICA'
  | 'CHECKPOINT'
  | 'DESAFIO'
  | 'RESULTADO';

type ItemDesafio =
  | { kind: 'exercicio'; data: Exercicio }
  | { kind: 'questao';   data: QuestaoClassificada };

type ResultadoTipo = 'aprovado' | 'retry' | 'zerado';

// ─────────────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
      <div style={{
        width: 28, height: 28,
        border: `3px solid ${C.line}`,
        borderTopColor: C.text,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

function Divider({ dark }: { dark?: boolean }) {
  return <div style={{ height: 1, background: dark ? '#2A2A2A' : C.line, flexShrink: 0 }} />;
}

interface BtnProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'ghostDark';
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

function Btn({ children, variant = 'primary', onClick, disabled, style }: BtnProps) {
  const map = {
    primary:   { bg: C.text,          fg: '#fff',  border: 'none'                      },
    secondary: { bg: C.surface,       fg: C.text,  border: `1px solid ${C.line}`        },
    danger:    { bg: C.red,           fg: '#fff',  border: 'none'                      },
    ghost:     { bg: 'transparent',   fg: C.mid,   border: `1px solid ${C.line}`        },
    ghostDark: { bg: 'transparent',   fg: '#fff',  border: '1px solid #ffffff28'        },
  };
  const v = map[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '13px 20px',
        borderRadius: 10, border: v.border,
        background: disabled ? C.line : v.bg,
        color:      disabled ? C.subtle : v.fg,
        fontSize: 12, fontWeight: 700,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        fontFamily: "'Manrope', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.15s, transform 0.1s',
        ...style,
      }}
      onMouseDown={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
      onMouseUp={e =>   { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}

function Tag({ children, color = C.blue, bg }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 6,
      background: bg ?? (color + '18'),
      color, fontSize: 10, fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TELA: INTRODUÇÃO
// ─────────────────────────────────────────────────────────────────────────────

function TelaIntroducao({
  faseNome,
  html,
  onConcluir,
}: {
  faseNome: string;
  html:     string;
  onConcluir: () => Promise<void>;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const safeHtml = DOMPurify.sanitize(html);
  const isEmpty  = !html.trim();

  // Se o conteúdo já cabe na tela sem rolar, desbloqueia o botão imediatamente
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isEmpty) return;
    if (el.scrollHeight <= el.clientHeight + 56) setScrolled(true);
  }, [safeHtml, isEmpty]);

  async function handleConcluir() {
    setSaving(true);
    try { await onConcluir(); }
    finally { setSaving(false); }
  }

  return (
    <>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{faseNome}</span>
        <Tag color={C.blue} bg={C.blueBg}>Introdução</Tag>
      </div>
      <Divider />

      {/* Corpo */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 100px' }}
        onScroll={e => {
          const el = e.currentTarget;
          if (el.scrollHeight - el.scrollTop <= el.clientHeight + 56) setScrolled(true);
        }}
      >
        {isEmpty ? (
          <p style={{ fontSize: 14, color: C.subtle, textAlign: 'center', paddingTop: 32 }}>
            Conteúdo de introdução não disponível ainda.
          </p>
        ) : (
          <div
            className="interage-intro"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        )}
        {!scrolled && !isEmpty && (
          <p style={{ textAlign: 'center', fontSize: 11, color: C.subtle, fontWeight: 600, marginTop: 28 }}>
            ↓ Leia até o fim para continuar
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 20px 28px', borderTop: `1px solid ${C.line}`, flexShrink: 0 }}>
        <Btn
          disabled={(!scrolled && !isEmpty) || saving}
          onClick={handleConcluir}
        >
          {saving ? 'Salvando…' : 'Entendi — Vamos praticar'}
        </Btn>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXERCÍCIO: MÚLTIPLA ESCOLHA (Tipos A e C)
// ─────────────────────────────────────────────────────────────────────────────

function MultiplaEscolha({
  exercicio, feedback, onSelect,
}: {
  exercicio: Exercicio;
  feedback:  FeedbackResposta | null;
  onSelect:  (id: string) => void;
}) {
  const [sel, setSel] = useState<string | null>(null);

  function pick(id: string) {
    if (feedback) return;
    setSel(id);
    onSelect(id);
  }

  function obg(id: string): React.CSSProperties {
    if (!feedback) return { background: C.surface, borderColor: C.line, color: C.text };
    if (id === feedback.gabarito)                        return { background: C.greenBg, borderColor: C.green, color: C.text };
    if (id === sel && id !== feedback.gabarito)          return { background: C.redBg,   borderColor: C.red,   color: C.red  };
    return { background: C.surface, borderColor: C.line, color: C.subtle };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(exercicio.opcoes ?? []).map(op => {
        const s = obg(op.id);
        return (
          <button key={op.id} onClick={() => pick(op.id)} style={{
            padding: '13px 16px', borderRadius: 10,
            background: s.background as string,
            border: `1px solid ${s.borderColor as string}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 14, fontWeight: 600, color: s.color as string,
            fontFamily: "'Manrope', sans-serif",
            cursor: feedback ? 'default' : 'pointer',
            textAlign: 'left', transition: 'all 0.2s',
          }}>
            <span>
              <span style={{ color: C.subtle, marginRight: 10, fontSize: 12 }}>{op.id}</span>
              {op.texto}
            </span>
            {feedback && op.id === feedback.gabarito && (
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.green, flexShrink: 0 }}>check_circle</span>
            )}
            {feedback && op.id === sel && op.id !== feedback.gabarito && (
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.red, flexShrink: 0 }}>cancel</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXERCÍCIO: SELEÇÃO EM CONTEXTO (Tipo B)
// ─────────────────────────────────────────────────────────────────────────────

function SelecaoContexto({
  exercicio, feedback, onSelect,
}: {
  exercicio: Exercicio;
  feedback:  FeedbackResposta | null;
  onSelect:  (word: string) => void;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const tokens = (exercicio.fraseContexto ?? '').split(/\s+/).filter(Boolean);

  function pick(raw: string) {
    if (feedback) return;
    const clean = raw.replace(/[.,;:!?]/g, '');
    setSel(clean);
    onSelect(clean);
  }

  function wStyle(raw: string): React.CSSProperties {
    const clean = raw.replace(/[.,;:!?]/g, '');
    const base: React.CSSProperties = {
      padding: '5px 10px', borderRadius: 8,
      fontSize: 14, fontWeight: 600,
      fontFamily: "'Manrope', sans-serif",
      border: `1px solid ${C.line}`,
      cursor: feedback ? 'default' : 'pointer',
      transition: 'all 0.15s',
    };
    if (!feedback) return { ...base, background: C.bg, color: C.text };
    if (clean === feedback.gabarito) return { ...base, background: C.greenBg, borderColor: C.green, color: C.text };
    if (clean === sel)               return { ...base, background: C.redBg,   borderColor: C.red,   color: C.red  };
    return { ...base, background: C.bg, color: C.subtle };
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {tokens.map((t, i) => (
        <button key={i} onClick={() => pick(t)} style={wStyle(t)} disabled={!!feedback}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXERCÍCIO: CERTO / ERRADO (Tipo D e questões externas)
// ─────────────────────────────────────────────────────────────────────────────

function CertoErrado({
  feedback, onSelect, dark,
}: {
  feedback: FeedbackResposta | null;
  onSelect: (op: string) => void;
  dark?:    boolean;
}) {
  const [sel, setSel] = useState<string | null>(null);

  function pick(op: string) {
    if (feedback) return;
    setSel(op);
    onSelect(op);
  }

  function bStyle(op: string): React.CSSProperties {
    const base: React.CSSProperties = {
      flex: 1, padding: '18px 0', borderRadius: 12, border: '1.5px solid',
      fontSize: 13, fontWeight: 800, letterSpacing: '0.06em',
      fontFamily: "'Manrope', sans-serif",
      cursor: feedback ? 'default' : 'pointer',
      transition: 'all 0.2s',
    };
    if (!feedback) return { ...base, background: dark ? '#242424' : C.surface, borderColor: dark ? '#2E2E2E' : C.line, color: dark ? '#E0E0E0' : C.text };
    if (op === feedback.gabarito)                   return { ...base, background: C.green + '22', borderColor: C.green, color: C.green };
    if (op === sel && op !== feedback.gabarito)     return { ...base, background: C.red   + '22', borderColor: C.red,   color: C.red   };
    return { ...base, background: dark ? '#242424' : C.surface, borderColor: dark ? '#2E2E2E' : C.line, color: C.subtle };
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {['CERTO', 'ERRADO'].map(op => (
        <button key={op} onClick={() => pick(op)} style={bStyle(op)}>{op}</button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE EXERCÍCIO — unifica todos os tipos
// ─────────────────────────────────────────────────────────────────────────────

function ExercicioCard({
  exercicio, faseId, bloco, rodada, tentativaDesafio, onNext, dark,
}: {
  exercicio:         Exercicio;
  faseId:            number;
  bloco:             'PRATICA' | 'DESAFIO';
  rodada?:           number;
  tentativaDesafio?: number;
  onNext:            (correto: boolean) => void;
  dark?:             boolean;
}) {
  const [feedback, setFeedback] = useState<FeedbackResposta | null>(null);
  const [loading,  setLoading]  = useState(false);

  const surface = dark ? '#242424' : C.surface;
  const border  = dark ? '#2E2E2E' : C.line;
  const text    = dark ? '#F0F0F0' : C.text;
  const subtle  = dark ? '#777777' : C.subtle;

  async function handleSelect(resposta: string) {
    if (loading || feedback) return;
    setLoading(true);
    try {
      const fb = await interageApi.responder(faseId, {
        exercicioId: exercicio.id,
        bloco,
        rodada:           rodada           ?? undefined,
        tentativaDesafio: tentativaDesafio ?? undefined,
        respostaDada: resposta,
      });
      setFeedback(fb);
    } catch {
      setFeedback({ correto: false, gabarito: '', explicacao: 'Erro ao registrar resposta.' });
    } finally {
      setLoading(false);
    }
  }

  const tipoLabel = exercicio.tipo === 'B'  ? 'Selecione na frase'
                  : exercicio.tipo === 'D'  ? 'Julgue o item'
                  : 'Identifique a resposta';

  return (
    <>
      {/* Card da questão */}
      <div style={{ background: surface, borderRadius: 16, border: `1.5px solid ${border}`, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Tag color={C.blue} bg={C.blue + '18'}>{tipoLabel}</Tag>

        <p style={{ fontSize: 15, fontWeight: 600, color: text, lineHeight: 1.55, margin: 0 }}>
          {exercicio.enunciado}
        </p>

        {/* Frase de contexto (Tipos A, C, D) */}
        {exercicio.fraseContexto && exercicio.tipo !== 'B' && (
          <div style={{ background: dark ? '#1A1A1A' : C.bg, borderRadius: 10, padding: '11px 14px', fontSize: 14, color: text, fontWeight: 500, lineHeight: 1.6 }}>
            {exercicio.palavraAlvo
              ? exercicio.fraseContexto.split(exercicio.palavraAlvo).flatMap((part, i, arr) =>
                  i < arr.length - 1
                    ? [part, <strong key={i} style={{ borderBottom: `2px solid ${C.blue}` }}>{exercicio.palavraAlvo}</strong>]
                    : [part]
                )
              : exercicio.fraseContexto
            }
          </div>
        )}

        {/* Área de resposta */}
        {(exercicio.tipo === 'A' || exercicio.tipo === 'C') && (
          <MultiplaEscolha exercicio={exercicio} feedback={feedback} onSelect={handleSelect} />
        )}
        {exercicio.tipo === 'B' && (
          <SelecaoContexto exercicio={exercicio} feedback={feedback} onSelect={handleSelect} />
        )}
        {exercicio.tipo === 'D' && (
          <CertoErrado feedback={feedback} onSelect={handleSelect} dark={dark} />
        )}

        {loading && (
          <p style={{ fontSize: 12, color: subtle, textAlign: 'center', margin: 0 }}>Registrando…</p>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          background: dark ? '#1A1A1A' : C.text,
          borderRadius: 14,
          border: dark ? '1px solid #2E2E2E' : 'none',
          padding: '14px 16px',
          display: 'flex', gap: 10,
          animation: 'fadeUp 0.25s ease',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.gold, flexShrink: 0, marginTop: 1 }}>lightbulb</span>
          <p style={{ fontSize: 13, color: dark ? '#BDBDBD' : '#E8E8E8', lineHeight: 1.65, fontWeight: 500, margin: 0 }}>
            {feedback.explicacao || (feedback.correto
              ? 'Resposta correta!'
              : `Resposta incorreta. Gabarito: ${feedback.gabarito}`)}
          </p>
        </div>
      )}

      {/* Próxima */}
      {feedback && (
        <Btn onClick={() => onNext(feedback.correto)} style={dark ? { background: C.gold, color: C.text } : undefined}>
          Próxima
        </Btn>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE QUESTÃO EXTERNA — placeholder até pipeline de classificação
// ─────────────────────────────────────────────────────────────────────────────

function QuestaoExternaCard({
  questao, faseId, tentativaDesafio, onNext,
}: {
  questao:           QuestaoClassificada;
  faseId:            number;
  tentativaDesafio:  number;
  onNext:            () => void;
}) {
  const [feedback, setFeedback] = useState<FeedbackResposta | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSelect(resposta: string) {
    if (loading || feedback) return;
    setLoading(true);
    try {
      const fb = await interageApi.responder(faseId, {
        questaoClassificadaId: questao.id,
        bloco: 'DESAFIO',
        tentativaDesafio,
        respostaDada: resposta,
      });
      setFeedback(fb);
    } catch {
      setFeedback({ correto: false, gabarito: '', explicacao: 'Erro ao registrar resposta.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ background: '#242424', borderRadius: 16, border: '1px solid #2E2E2E', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Tag color={C.gold} bg={C.gold + '18'}>Questão Real · CEBRASPE</Tag>
        <p style={{ fontSize: 11, color: '#666', margin: 0, fontWeight: 600, letterSpacing: '0.04em' }}>
          REF. {questao.questaoExternaId}
        </p>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, fontWeight: 500, margin: 0, fontStyle: 'italic' }}>
          Conteúdo disponível após carregamento do banco de questões.
        </p>
        <CertoErrado feedback={feedback} onSelect={handleSelect} dark />
        {loading && <p style={{ fontSize: 12, color: '#555', textAlign: 'center', margin: 0 }}>Registrando…</p>}
      </div>

      {feedback && (
        <div style={{ background: '#1A1A1A', borderRadius: 14, border: '1px solid #2E2E2E', padding: '14px 16px', display: 'flex', gap: 10, animation: 'fadeUp 0.25s ease' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.gold, flexShrink: 0 }}>lightbulb</span>
          <p style={{ fontSize: 13, color: '#BDBDBD', lineHeight: 1.65, fontWeight: 500, margin: 0 }}>
            {feedback.explicacao || (feedback.correto ? 'Resposta correta!' : `Gabarito: ${feedback.gabarito}`)}
          </p>
        </div>
      )}

      {feedback && (
        <Btn onClick={onNext} style={{ background: C.gold, color: C.text }}>Próxima</Btn>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER DA PRÁTICA
// ─────────────────────────────────────────────────────────────────────────────

function HeaderPratica({
  rodada, indexAtual, total, acertos, onClose,
}: {
  rodada:    number;
  indexAtual: number;
  total:     number;
  acertos:   number;
  onClose:   () => void;
}) {
  return (
    <div style={{ padding: '16px 20px 12px', background: C.surface, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: C.mid }}>close</span>
        </button>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.subtle }}>
          Rodada {rodada} de 3 · Questão {indexAtual + 1} de {total}
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.green }}>{acertos} ✓</span>
      </div>
      {/* Barras por questão */}
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i < indexAtual ? C.green : i === indexAtual ? C.text : C.line,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER DO DESAFIO
// ─────────────────────────────────────────────────────────────────────────────

function HeaderDesafio({
  indexAtual, total, tentativa, onClose,
}: {
  indexAtual: number;
  total:      number;
  tentativa:  number;
  onClose:    () => void;
}) {
  return (
    <div style={{ padding: '18px 20px 14px', background: C.text, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#666' }}>close</span>
        </button>
        <Tag color="#fff" bg="#ffffff18">Desafio</Tag>
        {/* Vidas */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i <= (3 - tentativa) ? C.red : '#333',
            }} />
          ))}
        </div>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: '#2A2A2A', overflow: 'hidden' }}>
        <div style={{ width: total ? `${(indexAtual / total) * 100}%` : '0%', height: '100%', background: C.gold, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>
      <div style={{ fontSize: 10, color: '#555', marginTop: 6, textAlign: 'center', fontWeight: 600, letterSpacing: '0.04em' }}>
        QUESTÃO {indexAtual + 1} DE {total}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TELA: CHECKPOINT
// ─────────────────────────────────────────────────────────────────────────────

function TelaCheckpoint({
  resultado, onContinuar, onRevisar,
}: {
  resultado:   CheckpointResultado;
  onContinuar: () => Promise<void>;
  onRevisar:   () => void;
}) {
  const [loading, setLoading] = useState(false);
  const aprovado = resultado.resultado === 'APROVADO';

  async function handleContinuar() {
    setLoading(true);
    try { await onContinuar(); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: aprovado ? C.greenBg : C.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: aprovado ? C.green : C.gold }}>
            {aprovado ? 'check_circle' : 'pending'}
          </span>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>
            {aprovado ? 'Prática concluída' : 'Quase lá'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 44, fontWeight: 800, color: aprovado ? C.green : C.gold }}>{resultado.acertos}</span>
            <span style={{ fontSize: 20, color: C.subtle, fontWeight: 500 }}>/{resultado.total}</span>
          </div>
          <div style={{ width: 160, height: 4, borderRadius: 99, background: C.line, overflow: 'hidden' }}>
            <div style={{ width: `${(resultado.acertos / resultado.total) * 100}%`, height: '100%', background: aprovado ? C.green : C.gold, borderRadius: 99 }} />
          </div>
          <p style={{ fontSize: 13, color: C.mid, lineHeight: 1.65, maxWidth: 260, margin: '4px 0 0' }}>
            {resultado.mensagem}
          </p>
        </div>
      </div>

      <div style={{ padding: '14px 20px 28px', borderTop: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn onClick={handleContinuar} disabled={loading}>
          {loading ? 'Carregando…' : aprovado ? 'Enfrentar o Desafio' : 'Tentar novamente'}
        </Btn>
        {!aprovado && (
          <Btn variant="ghost" onClick={onRevisar}>Revisar introdução</Btn>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TELA: RESULTADO FINAL
// ─────────────────────────────────────────────────────────────────────────────

function TelaResultado({
  tipo, resultado, onContinuar, onMapa,
}: {
  tipo:        ResultadoTipo;
  resultado:   CheckpointResultado | null;
  onContinuar: () => Promise<void>;
  onMapa:      () => void;
}) {
  const [loading, setLoading] = useState(false);

  const cfg = {
    aprovado: { dark: false, icon: 'military_tech', iconColor: C.gold,   iconBg: C.goldBg,    titleColor: C.text, scoreColor: C.green, sub: 'Próxima fase desbloqueada' },
    retry:    { dark: false, icon: 'replay',        iconColor: C.gold,   iconBg: C.goldBg,    titleColor: C.text, scoreColor: C.gold,  sub: null },
    zerado:   { dark: true,  icon: 'refresh',       iconColor: C.red,    iconBg: C.red + '22', titleColor: C.red,  scoreColor: C.red,   sub: null },
  };
  const c = cfg[tipo];

  async function handleContinuar() {
    setLoading(true);
    try { await onContinuar(); }
    finally { setLoading(false); }
  }

  const titleLabel = tipo === 'aprovado' ? 'Fase concluída'
                   : tipo === 'retry'    ? 'Não foi dessa vez'
                   : 'Mundo zerado';

  return (
    <div style={{ background: c.dark ? C.text : C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: c.iconColor }}>{c.icon}</span>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: c.dark ? '#F0F0F0' : c.titleColor, margin: 0 }}>{titleLabel}</h2>

          {resultado && (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 52, fontWeight: 800, color: c.scoreColor }}>{resultado.acertos}</span>
                <span style={{ fontSize: 20, color: c.dark ? '#555' : C.subtle, fontWeight: 500 }}>/{resultado.total}</span>
              </div>
              <div style={{ width: 160, height: 4, borderRadius: 99, background: c.dark ? '#2A2A2A' : C.line, overflow: 'hidden' }}>
                <div style={{ width: `${(resultado.acertos / resultado.total) * 100}%`, height: '100%', background: c.scoreColor, borderRadius: 99 }} />
              </div>
            </>
          )}

          {c.sub && (
            <Tag color={C.green} bg={C.greenBg}>{c.sub}</Tag>
          )}

          {resultado?.mensagem && (
            <p style={{ fontSize: 13, color: c.dark ? '#888' : C.mid, lineHeight: 1.65, maxWidth: 260, margin: '4px 0 0' }}>
              {resultado.mensagem}
            </p>
          )}
        </div>
      </div>

      <div style={{
        padding: '16px 20px 28px',
        borderTop: c.dark ? '1px solid #2A2A2A' : `1px solid ${C.line}`,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {tipo === 'aprovado' && <Btn onClick={handleContinuar} disabled={loading}>{loading ? 'Carregando…' : 'Continuar'}</Btn>}
        {tipo === 'retry'    && <Btn onClick={handleContinuar} disabled={loading}>{loading ? 'Carregando…' : 'Tentar Desafio Novamente'}</Btn>}
        {tipo === 'zerado'   && <Btn variant="danger" onClick={onMapa}>Recomeçar Mundo</Btn>}
        <Btn variant={c.dark ? 'ghostDark' : 'ghost'} onClick={onMapa}>Voltar ao Mapa</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL — MÁQUINA DE ESTADOS
// ─────────────────────────────────────────────────────────────────────────────

export default function SessaoFase() {
  const { mundoId, faseId: faseIdParam } = useParams<{ mundoId: string; faseId: string }>();
  const navigate = useNavigate();
  const faseId = Number(faseIdParam);

  // ── Estado da máquina ──────────────────────────────────────────────────────
  const [tela,     setTela]     = useState<Tela>('LOADING');
  const [faseNome, setFaseNome] = useState('');
  const [erro,     setErro]     = useState('');

  // Introdução
  const [introHtml, setIntroHtml] = useState('');

  // Prática
  const [praticaRodada,     setPraticaRodada]     = useState<1 | 2 | 3>(1);
  const [praticaExercicios, setPraticaExercicios] = useState<Exercicio[]>([]);
  const [praticaIndex,      setPraticaIndex]      = useState(0);
  const [praticaAcertos,    setPraticaAcertos]    = useState(0);  // display only

  // Checkpoint
  const [checkpointResultado, setCheckpointResultado] = useState<CheckpointResultado | null>(null);

  // Desafio
  const [desafioItems,    setDesafioItems]    = useState<ItemDesafio[]>([]);
  const [desafioIndex,    setDesafioIndex]    = useState(0);
  const [desafioTentativa, setDesafioTentativa] = useState(1);

  // Resultado
  const [resultadoTipo,       setResultadoTipo]       = useState<ResultadoTipo>('aprovado');
  const [resultadoCheckpoint, setResultadoCheckpoint] = useState<CheckpointResultado | null>(null);

  // ── Carrega / recarrega sessão ──────────────────────────────────────────────

  const carregarSessao = useCallback(async (id: number) => {
    setTela('LOADING');
    try {
      const sessao = await interageApi.iniciarSessao(id);
      setFaseNome(sessao.faseNome);

      switch (sessao.etapa) {
        case 'BLOCO_1':
          setIntroHtml(sessao.conteudoIntroducaoHtml ?? '');
          setTela('INTRODUCAO');
          break;

        case 'RODADA_1':
        case 'RODADA_2':
        case 'RODADA_3': {
          const num = Number(sessao.etapa.split('_')[1]) as 1 | 2 | 3;
          setPraticaRodada(num);
          setPraticaExercicios(sessao.exercicios ?? []);
          setPraticaIndex(0);
          setPraticaAcertos(0);
          setTela('PRATICA');
          break;
        }

        case 'DESAFIO': {
          const items: ItemDesafio[] = [
            ...(sessao.exercicios ?? []).map(e => ({ kind: 'exercicio' as const, data: e })),
            ...(sessao.questoes   ?? []).map(q => ({ kind: 'questao'   as const, data: q })),
          ];
          setDesafioItems(items);
          setDesafioIndex(0);
          setDesafioTentativa((sessao.tentativasDesafioConsumidas ?? 0) + 1);
          setTela('DESAFIO');
          break;
        }

        case 'CONCLUIDA':
          setResultadoTipo('aprovado');
          setResultadoCheckpoint(null);
          setTela('RESULTADO');
          break;
      }
    } catch {
      setErro('Não foi possível carregar a sessão. Tente novamente.');
      setTela('ERRO');
    }
  }, []);

  useEffect(() => {
    if (faseId) carregarSessao(faseId);
  }, [faseId, carregarSessao]);

  // ── Handlers de transição ──────────────────────────────────────────────────

  // Bloco 1 → salva save point → carrega próxima etapa
  async function handleBloco1Concluido() {
    await interageApi.concluirBloco1(faseId);
    await carregarSessao(faseId);
  }

  // Prática: avança exercício; ao fim da rodada salva e avança
  async function handlePraticaNext(correto: boolean) {
    if (correto) setPraticaAcertos(prev => prev + 1);

    const proximoIndex = praticaIndex + 1;

    if (proximoIndex < praticaExercicios.length) {
      setPraticaIndex(proximoIndex);
      return;
    }

    // Fim da rodada
    setTela('LOADING');
    try {
      await interageApi.concluirRodada(faseId, praticaRodada);

      if (praticaRodada < 3) {
        await carregarSessao(faseId); // retorna RODADA_{N+1}
      } else {
        const resultado = await interageApi.checkpointPratica(faseId);
        setCheckpointResultado(resultado);
        setTela('CHECKPOINT');
      }
    } catch {
      setErro('Erro ao salvar progresso. Tente novamente.');
      setTela('ERRO');
    }
  }

  // Checkpoint: APROVADO → desafio | REPROVADO → reinicia da RODADA_1
  async function handleCheckpointContinuar() {
    await carregarSessao(faseId);
    // Backend retorna DESAFIO se aprovado, RODADA_1 se reprovado
  }

  // Desafio: avança item; ao fim chama checkpoint
  async function handleDesafioNext() {
    const proximoIndex = desafioIndex + 1;

    if (proximoIndex < desafioItems.length) {
      setDesafioIndex(proximoIndex);
      return;
    }

    // Fim do desafio
    setTela('LOADING');
    try {
      const resultado = await interageApi.checkpointDesafio(faseId);
      setResultadoCheckpoint(resultado);

      switch (resultado.resultado) {
        case 'APROVADO':                setResultadoTipo('aprovado'); break;
        case 'REPROVADO_DESAFIO_RETRY': setResultadoTipo('retry');    break;
        case 'REPROVADO_MUNDO_ZERADO':  setResultadoTipo('zerado');   break;
      }
      setTela('RESULTADO');
    } catch {
      setErro('Erro ao processar resultado do desafio. Tente novamente.');
      setTela('ERRO');
    }
  }

  // Resultado: continuar (retry = novo desafio | aprovado = próximo mapa)
  async function handleResultadoContinuar() {
    if (resultadoTipo === 'aprovado') {
      navigate(`/interage/${mundoId}`);
    } else {
      await carregarSessao(faseId); // retorna DESAFIO (tentativa 2)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function renderTela() {
    switch (tela) {

      case 'LOADING':
        return <Spinner />;

      case 'ERRO':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 16 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: C.red }}>error</span>
            <p style={{ fontSize: 14, color: C.mid, textAlign: 'center', lineHeight: 1.6 }}>{erro}</p>
            <Btn onClick={() => carregarSessao(faseId)} style={{ maxWidth: 220 }}>
              Tentar novamente
            </Btn>
            <Btn variant="ghost" onClick={() => navigate(`/interage/${mundoId}`)} style={{ maxWidth: 220 }}>
              Voltar ao mapa
            </Btn>
          </div>
        );

      case 'INTRODUCAO':
        return (
          <TelaIntroducao
            faseNome={faseNome}
            html={introHtml}
            onConcluir={handleBloco1Concluido}
          />
        );

      case 'PRATICA': {
        const ex = praticaExercicios[praticaIndex];
        if (!ex) return <Spinner />;
        return (
          <>
            <HeaderPratica
              rodada={praticaRodada}
              indexAtual={praticaIndex}
              total={praticaExercicios.length}
              acertos={praticaAcertos}
              onClose={() => navigate(`/interage/${mundoId}`)}
            />
            <Divider />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ExercicioCard
                key={`${praticaRodada}-${praticaIndex}`}
                exercicio={ex}
                faseId={faseId}
                bloco="PRATICA"
                rodada={praticaRodada}
                onNext={handlePraticaNext}
              />
            </div>
          </>
        );
      }

      case 'CHECKPOINT':
        return checkpointResultado ? (
          <TelaCheckpoint
            resultado={checkpointResultado}
            onContinuar={handleCheckpointContinuar}
            onRevisar={() => {
              // Se introHtml disponível mostra intro, senão recarrega sessão
              introHtml ? setTela('INTRODUCAO') : carregarSessao(faseId);
            }}
          />
        ) : <Spinner />;

      case 'DESAFIO': {
        const item = desafioItems[desafioIndex];
        if (!item) return <Spinner />;
        return (
          <div style={{ background: C.text, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
            <HeaderDesafio
              indexAtual={desafioIndex}
              total={desafioItems.length}
              tentativa={desafioTentativa}
              onClose={() => navigate(`/interage/${mundoId}`)}
            />
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {item.kind === 'exercicio' ? (
                <ExercicioCard
                  key={`desafio-ex-${desafioIndex}`}
                  exercicio={item.data}
                  faseId={faseId}
                  bloco="DESAFIO"
                  tentativaDesafio={desafioTentativa}
                  onNext={correto => { void correto; handleDesafioNext(); }}
                  dark
                />
              ) : (
                <QuestaoExternaCard
                  key={`desafio-q-${desafioIndex}`}
                  questao={item.data}
                  faseId={faseId}
                  tentativaDesafio={desafioTentativa}
                  onNext={handleDesafioNext}
                />
              )}
            </div>
          </div>
        );
      }

      case 'RESULTADO':
        return (
          <TelaResultado
            tipo={resultadoTipo}
            resultado={resultadoCheckpoint}
            onContinuar={handleResultadoContinuar}
            onMapa={() => navigate(`/interage/${mundoId}`)}
          />
        );

      default:
        return null;
    }
  }

  return (
    <InterageLayout>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .interage-intro { font-size: 14px; color: ${C.text}; line-height: 1.7; font-weight: 500; }
        .interage-intro strong { font-weight: 700; }
        .interage-intro p  { margin-bottom: 16px; }
        .interage-intro ul, .interage-intro ol { padding-left: 20px; margin-bottom: 16px; }
        .interage-intro li { margin-bottom: 6px; }
        .interage-intro h2 { font-size: 21px; font-weight: 800; color: ${C.text}; margin: 0 0 16px; }
        .interage-intro blockquote {
          background: ${C.bg};
          border-left: 3px solid ${C.gold};
          border-radius: 12px;
          padding: 14px 16px;
          margin: 16px 0;
        }
      `}</style>
      {renderTela()}
    </InterageLayout>
  );
}