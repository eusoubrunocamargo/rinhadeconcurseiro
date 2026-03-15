import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { listarMeusDuelos, buscarResultadoQuestoes } from '../services/duelo';
import type { DueloResponse, DueloResultadoQuestao } from '../types';

// ── Helpers ───────────────────────────────────────────────────────

type Resultado = 'VITORIA' | 'DERROTA' | 'EMPATE' | 'CANCELADO';

function calcularResultado(duelo: DueloResponse, meuId: number): Resultado {
  if (duelo.status === 'CANCELADO') return 'CANCELADO';
  if (!duelo.vencedor) return 'EMPATE';
  return duelo.vencedor.id === meuId ? 'VITORIA' : 'DERROTA';
}

const RESULTADO_CONFIG: Record<Resultado, {
  label: string; cor: string; bg: string; border: string; icon: string;
}> = {
  VITORIA:   { label: 'Vitória',   cor: '#059669', bg: '#F0FDF4', border: '#BBF7D0', icon: 'emoji_events'           },
  DERROTA:   { label: 'Derrota',   cor: '#DC2626', bg: '#FFF5F5', border: '#FECACA', icon: 'sentiment_dissatisfied' },
  EMPATE:    { label: 'Empate',    cor: '#666666', bg: '#F5F5F5', border: '#E5E5E5', icon: 'handshake'              },
  CANCELADO: { label: 'Cancelado', cor: '#999999', bg: '#F9F9F9', border: '#E5E5E5', icon: 'cancel'                 },
};

function formatarData(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function textoLimpo(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Impressão ─────────────────────────────────────────────────────

function abrirJanelaImpressao(
  duelo: DueloResponse,
  questoes: DueloResultadoQuestao[],
  nomeUsuario: string,
  nomeOponente: string,
  meusPontos: number,
  pontosOponente: number,
) {
  const dataImpressao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const acertadas = questoes.filter(q => q.acertou);
  const erradas   = questoes.filter(q => !q.acertou);

  function renderSecao(
    lista: DueloResultadoQuestao[],
    titulo: string,
    cor: string,
    bg: string,
  ): string {
    if (lista.length === 0) return '';

    const itens = lista.map(q => `
      <div class="questao">
        <div class="questao-header">
          <span class="numero">${q.ordem}</span>
          <div class="tags">
            <span class="tag-materia">${q.materiaNome}</span>
            ${q.assuntoNome
              ? `<span class="tag-assunto" style="background:${bg};color:${cor}">${q.assuntoNome}</span>`
              : ''}
          </div>
        </div>
        <p class="enunciado">${textoLimpo(q.enunciado)}</p>
        <div class="gabarito">
          <span>Gabarito: <strong>${q.gabarito === 'CERTO' ? 'Certo' : 'Errado'}</strong></span>
          <span>Minha resposta: <strong style="color:${
            q.minhaResposta === q.gabarito ? '#059669' : '#DC2626'
          }">${
            q.minhaResposta === 'CERTO'  ? 'Certo'  :
            q.minhaResposta === 'ERRADO' ? 'Errado' : 'Em branco'
          }</strong></span>
        </div>
      </div>
    `).join('');

    return `
      <div class="secao-titulo" style="background:${bg};border-left:4px solid ${cor};color:${cor}">
        <span>${titulo}</span>
        <span class="secao-count">${lista.length} questão${lista.length !== 1 ? 'ões' : ''}</span>
      </div>
      <div class="questoes-grid">${itens}</div>
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Duelo vs ${nomeOponente} — Rinha de Concurseiro</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Georgia', serif; font-size: 11px; line-height: 1.55; color: #1A1A1A; padding: 24px 28px; }

    .cabecalho { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 12px; margin-bottom: 14px; border-bottom: 2px solid #1A1A1A; }
    .logo-wrap { display: flex; align-items: center; gap: 8px; }
    .logo-box { width: 30px; height: 30px; background: #1A1A1A; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 900; }
    .logo-txt { font-size: 9.5px; font-weight: 900; text-transform: uppercase; letter-spacing: .05em; line-height: 1.3; }
    .logo-ponto { color: #FF4D4D; }
    .meta { text-align: right; font-size: 9.5px; color: #666; line-height: 1.8; }
    .meta strong { color: #1A1A1A; }

    .duelo-bloco { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #E5E5E5; }
    .duelo-titulo { font-size: 15px; font-weight: 900; }
    .duelo-sub { font-size: 10px; color: #666; margin-top: 3px; }
    .placar { display: flex; align-items: center; gap: 10px; font-size: 22px; font-weight: 900; }
    .placar-meu { color: #FF4D4D; }
    .placar-sep { font-size: 16px; color: #CCC; }

    .secao-titulo { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .05em; padding: 8px 12px; margin-bottom: 12px; margin-top: 20px; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; }
    .secao-count { font-size: 9px; font-weight: 700; opacity: .8; }

    .questoes-grid { column-count: 2; column-gap: 20px; column-rule: 1px solid #E5E5E5; }

    .questao { break-inside: avoid; -webkit-column-break-inside: avoid; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px dashed #E5E5E5; }
    .questao:last-child { border-bottom: none; margin-bottom: 0; }

    .questao-header { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 5px; break-after: avoid; }
    .numero { min-width: 18px; height: 18px; background: #F5F5F5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8.5px; font-weight: 900; color: #999; flex-shrink: 0; }
    .tags { display: flex; flex-wrap: wrap; gap: 3px; }
    .tag-materia, .tag-assunto { font-size: 8.5px; font-weight: 700; padding: 1px 6px; border-radius: 999px; }
    .tag-materia { background: #F5F5F5; color: #666; }

    .enunciado { font-size: 10.5px; line-height: 1.6; margin: 4px 0 7px 24px; text-align: justify; }
    .gabarito { margin-left: 24px; font-size: 9.5px; color: #666; display: flex; gap: 14px; }
    .gabarito strong { }

    .rodape { margin-top: 22px; padding-top: 10px; border-top: 1px solid #E5E5E5; font-size: 8.5px; color: #BBB; display: flex; justify-content: space-between; }

    @media print { body { padding: 0; } @page { margin: 1.2cm; size: A4 portrait; } }
  </style>
</head>
<body>

  <div class="cabecalho">
    <div class="logo-wrap">
      <div class="logo-box">R</div>
      <div class="logo-txt">Rinha de<br/>Concurseiro<span class="logo-ponto">.</span></div>
    </div>
    <div class="meta">
      <div><strong>${nomeUsuario}</strong></div>
      <div>Impresso em ${dataImpressao}</div>
    </div>
  </div>

  <div class="duelo-bloco">
    <div>
      <div class="duelo-titulo">Duelo vs ${nomeOponente}</div>
      <div class="duelo-sub">
        ${formatarData(duelo.finalizadoEm)}${duelo.totalQuestoes ? ` · ${duelo.totalQuestoes} questões` : ''}
      </div>
    </div>
    <div class="placar">
      <span class="placar-meu">${meusPontos}</span>
      <span class="placar-sep">×</span>
      <span>${pontosOponente}</span>
    </div>
  </div>

  ${renderSecao(acertadas, '✓ Você Acertou', '#059669', '#F0FDF4')}
  ${renderSecao(erradas,   '✗ Você Errou',   '#DC2626', '#FFF5F5')}

  <div class="rodape">
    <span>Rinha de Concurseiro — Preparação para concursos CEBRASPE</span>
    <span>Duelo vs ${nomeOponente} · ${dataImpressao}</span>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const janela = window.open('', '_blank');
  janela?.document.write(html);
  janela?.document.close();
}

// ── Componente principal ─────────────────────────────────────────

export default function DueloHistorico() {
  const { user } = useAuth();
  const [todos,   setTodos]   = useState<DueloResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filtro,  setFiltro]  = useState<'TODOS' | Resultado>('TODOS');

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarMeusDuelos();
      const historico = data
        .filter(d => d.status === 'FINALIZADO' || d.status === 'CANCELADO')
        .sort((a, b) =>
          new Date(b.finalizadoEm ?? b.createdAt).getTime() -
          new Date(a.finalizadoEm ?? a.createdAt).getTime()
        );
      setTodos(historico);
    } catch {
      setError('Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const meuId = user?.id ?? -1;

  const duelos = filtro === 'TODOS'
    ? todos
    : todos.filter(d => calcularResultado(d, meuId) === filtro);

  const contadores: Record<string, number> = {
    TODOS:     todos.length,
    VITORIA:   todos.filter(d => calcularResultado(d, meuId) === 'VITORIA').length,
    DERROTA:   todos.filter(d => calcularResultado(d, meuId) === 'DERROTA').length,
    EMPATE:    todos.filter(d => calcularResultado(d, meuId) === 'EMPATE').length,
    CANCELADO: todos.filter(d => calcularResultado(d, meuId) === 'CANCELADO').length,
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Cabeçalho */}
        <div>
          <Link
            to="/duelo"
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-5 transition-colors"
            style={{ color: '#999' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1A1A1A'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#999'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
            Duelos
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#999' }}>
            Modo Competitivo
          </p>
          <h1 className="text-3xl font-black text-dark-text tracking-tight leading-none">
            Histórico<span style={{ color: '#FF4D4D' }}>.</span>
          </h1>
          {!loading && (
            <p className="text-sm mt-1.5" style={{ color: '#999' }}>
              {todos.length} {todos.length === 1 ? 'duelo registrado' : 'duelos registrados'}
            </p>
          )}
        </div>

        {/* Estatísticas */}
        {!loading && todos.length > 0 && <Estatisticas duelos={todos} meuId={meuId} />}

        {/* Filtros */}
        {!loading && todos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['TODOS', 'VITORIA', 'DERROTA', 'EMPATE', 'CANCELADO'] as const).map(f => {
              const ativo = filtro === f;
              const cfg   = f === 'TODOS' ? null : RESULTADO_CONFIG[f];
              return (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full transition-all"
                  style={
                    ativo
                      ? { backgroundColor: cfg?.cor ?? '#1A1A1A', color: '#fff' }
                      : { backgroundColor: '#F0F0F0', color: '#888' }
                  }
                >
                  {f === 'TODOS' ? 'Todos' : cfg!.label}
                  <span
                    className="ml-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: ativo ? 'rgba(255,255,255,0.25)' : '#E0E0E0',
                      color: ativo ? '#fff' : '#666',
                    }}
                  >
                    {contadores[f]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-[28px] animate-pulse"
                style={{ backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5' }} />
            ))}
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="px-4 py-3 rounded-2xl text-xs font-bold"
            style={{ backgroundColor: '#FFF5F5', color: '#DC2626', border: '1px solid #FECACA' }}>
            {error}
            <button onClick={carregar} className="ml-3 underline">Tentar novamente</button>
          </div>
        )}

        {/* Lista */}
        {!loading && duelos.length > 0 && (
          <div className="flex flex-col gap-3">
            {duelos.map(d => (
              <DueloCard
                key={d.id}
                duelo={d}
                meuId={meuId}
                nomeUsuario={user?.apelido || user?.nome || ''}
              />
            ))}
          </div>
        )}

        {/* Vazio com filtro ativo */}
        {!loading && duelos.length === 0 && todos.length > 0 && (
          <div className="flex flex-col items-center justify-center py-14 rounded-[28px]"
            style={{ backgroundColor: '#F9F9F9', border: '1px solid #E5E5E5' }}>
            <span className="material-symbols-outlined mb-3" style={{ fontSize: '32px', color: '#CCC' }}>
              filter_list
            </span>
            <p className="text-sm font-bold" style={{ color: '#999' }}>Nenhum duelo nesta categoria</p>
          </div>
        )}

        {/* Sem histórico nenhum */}
        {!loading && todos.length === 0 && !error && <EstadoVazio />}

      </div>
    </Layout>
  );
}

// ── DueloCard ─────────────────────────────────────────────────────

function DueloCard({
  duelo, meuId, nomeUsuario,
}: {
  duelo: DueloResponse;
  meuId: number;
  nomeUsuario: string;
}) {
  const [printing, setPrinting] = useState(false);

  const euSouHost      = duelo.host.id === meuId;
  const oponente       = euSouHost ? duelo.desafiado : duelo.host;
  const meusPontos     = euSouHost ? duelo.pontosHost      : duelo.pontosDesafiado;
  const pontosOponente = euSouHost ? duelo.pontosDesafiado : duelo.pontosHost;
  const nomeOponente   = oponente.apelido || oponente.nome;
  const inicial        = (oponente.apelido || oponente.nome || '?').charAt(0).toUpperCase();

  const resultado = calcularResultado(duelo, meuId);
  const cfg       = RESULTADO_CONFIG[resultado];

  async function handlePrint() {
    if (printing) return;
    setPrinting(true);
    try {
      const questoes = await buscarResultadoQuestoes(duelo.id);
      abrirJanelaImpressao(
        duelo, questoes, nomeUsuario, nomeOponente, meusPontos, pontosOponente,
      );
    } catch {
      alert('Não foi possível carregar as questões. Tente novamente.');
    } finally {
      setPrinting(false);
    }
  }

  return (
    <div className="bg-white rounded-[28px] overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
      <div className="px-5 py-4 flex items-center gap-4">

        {/* Badge resultado */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: cfg.cor }}>
            {cfg.icon}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {oponente.fotoUrl ? (
              <img src={oponente.fotoUrl} alt={oponente.nome}
                className="w-5 h-5 rounded-full object-cover shrink-0"
                style={{ border: '1px solid #E5E5E5' }} />
            ) : (
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                style={{ backgroundColor: '#F5F5F5', color: '#666' }}>
                {inicial}
              </div>
            )}
            <span className="text-sm font-black text-dark-text truncate">{nomeOponente}</span>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cfg.bg, color: cfg.cor }}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {duelo.status === 'FINALIZADO' && duelo.totalQuestoes && (
              <span className="text-[10px]" style={{ color: '#999' }}>{duelo.totalQuestoes} questões</span>
            )}
            <span className="text-[10px]" style={{ color: '#CCC' }}>·</span>
            <span className="text-[10px]" style={{ color: '#999' }}>
              {formatarData(duelo.finalizadoEm ?? duelo.createdAt)}
            </span>
          </div>
        </div>

        {/* Placar */}
        {duelo.status === 'FINALIZADO' && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-black" style={{ color: cfg.cor }}>{meusPontos}</span>
            <span className="text-sm font-black" style={{ color: '#E5E5E5' }}>×</span>
            <span className="text-xl font-black text-dark-text">{pontosOponente}</span>
          </div>
        )}

        {duelo.status === 'CANCELADO' && (
          <span className="text-xs font-bold shrink-0" style={{ color: '#CCC' }}>cancelado</span>
        )}

        {/* 🖨 Botão imprimir — só duelos finalizados */}
        {duelo.status === 'FINALIZADO' && (
          <button
            onClick={handlePrint}
            disabled={printing}
            title="Imprimir questões do duelo"
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all shrink-0 disabled:opacity-50"
            style={{ border: '1px solid #E5E5E5', color: '#CCC', backgroundColor: '#FAFAFA' }}
            onMouseEnter={e => {
              if (!printing) {
                e.currentTarget.style.borderColor = '#1A1A1A';
                e.currentTarget.style.color = '#1A1A1A';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E5E5E5';
              e.currentTarget.style.color = '#CCC';
            }}
          >
            {printing ? (
              <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#DDD', borderTopColor: '#666' }} />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>print</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Estatísticas ──────────────────────────────────────────────────

function Estatisticas({ duelos, meuId }: { duelos: DueloResponse[]; meuId: number }) {
  const finalizados = duelos.filter(d => d.status === 'FINALIZADO');
  const vitorias    = finalizados.filter(d => calcularResultado(d, meuId) === 'VITORIA').length;
  const derrotas    = finalizados.filter(d => calcularResultado(d, meuId) === 'DERROTA').length;
  const empates     = finalizados.filter(d => calcularResultado(d, meuId) === 'EMPATE').length;
  const winRate     = finalizados.length > 0
    ? Math.round((vitorias / finalizados.length) * 100) : 0;

  return (
    <div className="bg-white rounded-[28px] overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
      <div className="grid grid-cols-4 divide-x divide-[#F0F0F0]">
        {[
          { valor: `${winRate}%`, label: 'Win Rate', cor: winRate >= 50 ? '#059669' : '#DC2626' },
          { valor: vitorias,      label: 'Vitórias', cor: '#059669' },
          { valor: derrotas,      label: 'Derrotas', cor: '#DC2626' },
          { valor: empates,       label: 'Empates',  cor: '#666'    },
        ].map(({ valor, label, cor }) => (
          <div key={label} className="flex flex-col items-center justify-center py-4 px-2 gap-0.5">
            <span className="text-xl font-black leading-none" style={{ color: cor }}>{valor}</span>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#BBB' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Estado vazio ──────────────────────────────────────────────────

function EstadoVazio() {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-[28px] gap-4"
      style={{ backgroundColor: '#F9F9F9', border: '1px solid #E5E5E5' }}>
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
        style={{ backgroundColor: '#F0F0F0' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#CCC' }}>
          history
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm font-black text-dark-text mb-1">Nenhum duelo ainda</p>
        <p className="text-xs max-w-xs" style={{ color: '#999' }}>
          Complete seu primeiro duelo para ver o histórico aqui.
        </p>
      </div>
      <Link
        to="/duelo"
        className="text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl text-white"
        style={{ backgroundColor: '#FF4D4D' }}>
        Ir para Duelos →
      </Link>
    </div>
  );
}