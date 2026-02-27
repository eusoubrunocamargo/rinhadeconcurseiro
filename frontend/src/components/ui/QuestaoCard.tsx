import DOMPurify from 'dompurify';
import type { NivelConfianca } from '../../types';

interface QuestaoCardProps {
  numero: number;
  comando?: string;
  materia: string;
  assunto?: string;
  resposta: boolean | null;
  confianca: NivelConfianca | null;
  confirmada: boolean;
  onResponder: (valor: boolean | null) => void;
  onConfianca: (valor: NivelConfianca) => void;
  onConfirmar: () => void;
  podeConfirmar: boolean;
}

// ── Configurações visuais ─────────────────────────────────────────

const CONFIANCA_CONFIG: Record<NivelConfianca, { label: string; cor: string; bg: string; border: string }> = {
  CERTEZA: { label: 'Certeza', cor: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
  DUVIDA:  { label: 'Dúvida',  cor: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  CHUTE:   { label: 'Chute',   cor: '#DC2626', bg: '#FFF5F5', border: '#FECACA' },
};

export default function QuestaoCard({
  numero,
  comando,
  materia,
  assunto,
  resposta,
  confianca,
  confirmada,
  onResponder,
  onConfianca,
  onConfirmar,
  podeConfirmar,
}: QuestaoCardProps) {
  const comandoSeguro = comando ? DOMPurify.sanitize(comando) : '';

  return (
    <div
      className="bg-white rounded-[28px] overflow-hidden"
      style={{
        border: confirmada ? '1px solid #BBF7D0' : '1px solid #E5E5E5',
        transition: 'border-color 0.3s ease',
      }}
    >

      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="px-6 pt-5 pb-4 flex items-start justify-between gap-4"
        style={{ borderBottom: '1px solid #F5F5F5' }}
      >
        <div className="flex items-center gap-2.5">
          {/* Número */}
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#F5F5F5', color: '#1A1A1A' }}
          >
            Questão {numero}
          </span>

          {/* Badge confirmada */}
          {confirmada && (
            <span
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#F0FDF4', color: '#059669' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>
                check_circle
              </span>
              Confirmada
            </span>
          )}
        </div>

        {/* Matéria + assunto */}
        <div className="text-right shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>
            {materia}
          </p>
          {assunto && (
            <p className="text-[10px] font-medium mt-0.5" style={{ color: '#BBB' }}>
              {assunto}
            </p>
          )}
        </div>
      </div>

      {/* ── Comando ─────────────────────────────────────────────── */}
      {comando && (
        <div
          className="px-6 py-5 text-sm leading-relaxed text-dark-text
            [&_p]:mb-3 [&_p:last-child]:mb-0
            [&_strong]:font-black
            [&_em]:italic
            [&_div]:mb-2
            [&_table]:w-full [&_table]:text-xs [&_td]:p-2 [&_th]:p-2
            [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic"
          style={{ borderBottom: '1px solid #F5F5F5', color: '#333' }}
          dangerouslySetInnerHTML={{ __html: comandoSeguro }}
        />
      )}

      {/* ── Ações ───────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-6 flex flex-col gap-4">

        {/* Botões CERTO / ERRADO */}
        <div className="flex gap-3">
          <RespostaButton
            label="Certo"
            icon="check"
            selecionado={resposta === true}
            corPadrao="#999"
            bgPadrao="#FAFAFA"
            borderPadrao="#EEEEEE"
            corSelecionado="#059669"
            bgSelecionado="#F0FDF4"
            borderSelecionado="#BBF7D0"
            onClick={() => onResponder(resposta === true ? null : true)}
          />
          <RespostaButton
            label="Errado"
            icon="close"
            selecionado={resposta === false}
            corPadrao="#999"
            bgPadrao="#FAFAFA"
            borderPadrao="#EEEEEE"
            corSelecionado="#DC2626"
            bgSelecionado="#FFF5F5"
            borderSelecionado="#FECACA"
            onClick={() => onResponder(resposta === false ? null : false)}
          />
        </div>

        {/* Nível de confiança — aparece após selecionar resposta */}
        {resposta !== null && (
          <div className="flex flex-col gap-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>
              Nível de confiança
            </p>
            <div className="flex gap-2">
              {(Object.keys(CONFIANCA_CONFIG) as NivelConfianca[]).map((nivel) => {
                const cfg       = CONFIANCA_CONFIG[nivel];
                const selecionado = confianca === nivel;
                return (
                  <button
                    key={nivel}
                    onClick={() => onConfianca(nivel)}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                    style={{
                      backgroundColor: cfg.bg,
                      color:           selecionado ? cfg.cor : `${cfg.cor}99`,
                      border:          selecionado ? `1.5px solid ${cfg.border}` : `1.5px solid ${cfg.border}66`,
                      opacity:         selecionado ? 1 : 0.7,
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Botão confirmar */}
        {resposta !== null && confianca !== null && (
          confirmada ? (
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest"
              style={{ backgroundColor: '#F0FDF4', color: '#059669', border: '1px solid #BBF7D0' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
              Confirmada · clique em CERTO ou ERRADO para alterar
            </div>
          ) : (
            <button
              onClick={onConfirmar}
              disabled={!podeConfirmar}
              className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
              style={
                podeConfirmar
                  ? { backgroundColor: '#1A1A1A', color: '#fff' }
                  : { backgroundColor: '#F0F0F0', color: '#BBB', cursor: 'not-allowed' }
              }
            >
              Confirmar e Avançar →
            </button>
          )
        )}

        {/* Dicas de progresso */}
        {resposta === null && (
          <p className="text-[11px] text-center" style={{ color: '#CCC' }}>
            Selecione Certo ou Errado para continuar
          </p>
        )}
        {resposta !== null && confianca === null && (
          <p className="text-[11px] text-center" style={{ color: '#CCC' }}>
            Agora selecione seu nível de confiança
          </p>
        )}

      </div>
    </div>
  );
}

// ── RespostaButton ────────────────────────────────────────────────

function RespostaButton({
  label,
  icon,
  selecionado,
  corPadrao,
  bgPadrao,
  borderPadrao,
  corSelecionado,
  bgSelecionado,
  borderSelecionado,
  onClick,
}: {
  label:             string;
  icon:              string;
  selecionado:       boolean;
  corPadrao:         string;
  bgPadrao:          string;
  borderPadrao:      string;
  corSelecionado:    string;
  bgSelecionado:     string;
  borderSelecionado: string;
  onClick:           () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
      style={
        selecionado
          ? { backgroundColor: bgSelecionado,  color: corSelecionado,  border: `1.5px solid ${borderSelecionado}` }
          : { backgroundColor: bgPadrao,        color: corPadrao,        border: `1.5px solid ${borderPadrao}` }
      }
    >
      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
        {icon}
      </span>
      {label}
    </button>
  );
}