import { useState, useEffect } from 'react';
import { useParams, Link, NavLink } from 'react-router-dom';
import type { CadernoDetalhe, Caderno, RespostaDetalhe, ResumoAssunto } from '../types';
import { getCadernoDetalhe, getResumoCaderno } from '../services/tentativa';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';

// ── Configuração visual por caderno ──────────────────────────────

const CADERNO_CONFIG = {
  VERMELHO: {
    label:      'Crítico',
    icon:       'cancel',
    cor:        '#FF4D6A',
    bgCor:      '#fff0f2',
    borderCor:  '#fecdd3',
    descricao:  'Erros por conteúdo ou com certeza — prioridade máxima',
  },
  AMARELO: {
    label:      'Reforço',
    icon:       'warning',
    cor:        '#D97706',
    bgCor:      '#fffbeb',
    borderCor:  '#fde68a',
    descricao:  'Acertos com dúvida ou por chute — revisar logo',
  },
  VERDE: {
    label:      'Domínio',
    icon:       'check_circle',
    cor:        '#059669',
    bgCor:      '#ecfdf5',
    borderCor:  '#a7f3d0',
    descricao:  'Acertos conscientes — manter com revisão espaçada',
  },
} as const;

const TIPO_RESULTADO_LABEL: Record<string, { texto: string; cor: string; bg: string }> = {
  ACERTO_CONSCIENTE:  { texto: 'Acerto consciente',   cor: '#059669', bg: '#ecfdf5' },
  ACERTO_COM_DUVIDA:  { texto: 'Acerto com dúvida',   cor: '#D97706', bg: '#fffbeb' },
  ACERTO_POR_CHUTE:   { texto: 'Acerto por chute',    cor: '#D97706', bg: '#fffbeb' },
  ERRO_CONTEUDO:      { texto: 'Erro de conteúdo',    cor: '#DC2626', bg: '#fef2f2' },
  ERRO_INTERPRETACAO: { texto: 'Erro de interpretação',cor: '#DC2626', bg: '#fef2f2' },
  ERRO_DISTRACAO:     { texto: 'Erro por distração',  cor: '#7C3AED', bg: '#f5f3ff' },
};

// ── Página ───────────────────────────────────────────────────────

export default function CadernoView() {
  const { caderno } = useParams<{ caderno: string }>();
  const { user } = useAuth();
  const [dados, setDados]       = useState<CadernoDetalhe | null>(null);
  const [resumo, setResumo]     = useState<ResumoAssunto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const cadernoKey = caderno?.toUpperCase() as Caderno;
  const config = CADERNO_CONFIG[cadernoKey as keyof typeof CADERNO_CONFIG];

  useEffect(() => {
    if (cadernoKey && config) loadCaderno();
  }, [cadernoKey]);

  async function loadCaderno() {
    try {
      setLoading(true);
      setError(null);
      const [data, resumoData] = await Promise.all([
        getCadernoDetalhe(cadernoKey),
        getResumoCaderno(cadernoKey),
      ]);
      setDados(data);
      setResumo(resumoData);
    } catch {
      setError('Não foi possível carregar o caderno.');
    } finally {
      setLoading(false);
    }
  }

  // ── Impressão ────────────────────────────────────────────────────
  function handlePrint() {
    if (!dados || dados.questoes.length === 0) return;

    const textoLimpo = (html?: string) =>
      html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';

    const dataImpressao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const nomeUsuario  = user?.nome    ?? user?.apelido ?? 'Usuário';
    const emailUsuario = user?.email   ?? '';

    const questoesHtml = dados.questoes.map((q, idx) => {
      const resultado = q.tipoResultado
        ? TIPO_RESULTADO_LABEL[q.tipoResultado]
        : null;

      return `
        <div class="questao">
          <div class="questao-header">
            <span class="numero">${idx + 1}</span>
            <div class="tags">
              <span class="tag-materia">${q.materiaNome}</span>
              ${q.assuntoNome ? `<span class="tag-assunto">${q.assuntoNome}</span>` : ''}
              ${resultado ? `<span class="tag-resultado" style="color:${resultado.cor}">${resultado.texto}</span>` : ''}
            </div>
          </div>
          <p class="enunciado">${textoLimpo(q.comando)}</p>
          <div class="gabarito">
            <span>Gabarito: <strong>${q.gabarito === 'CERTO' ? 'Certo' : 'Errado'}</strong></span>
            ${q.resposta ? `<span>Sua resposta: <strong>${q.resposta === 'CERTO' ? 'Certo' : q.resposta === 'ERRADO' ? 'Errado' : 'Em branco'}</strong></span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Caderno ${config.label} — Rinha de Concurseiro</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Georgia', serif;
            font-size: 11px;
            line-height: 1.55;
            color: #1A1A1A;
            padding: 24px 28px;
          }

          /* ── Cabeçalho — largura total, fora das colunas ── */
          .cabecalho {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding-bottom: 12px;
            margin-bottom: 14px;
            border-bottom: 2px solid ${config.cor};
            column-span: all;
          }
          .cabecalho-logo { display: flex; align-items: center; gap: 8px; }
          .logo-icone {
            width: 30px; height: 30px;
            background: #1A1A1A; border-radius: 6px;
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 13px; font-weight: 900; flex-shrink: 0;
          }
          .logo-texto { font-size: 9.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.3; }
          .logo-ponto { color: ${config.cor}; }
          .cabecalho-meta { text-align: right; font-size: 9.5px; color: #666; line-height: 1.8; }
          .cabecalho-meta strong { color: #1A1A1A; }

          /* ── Título — largura total ── */
          .titulo-bloco {
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #E5E5E5;
            column-span: all;
          }
          .titulo-caderno { display: inline-flex; align-items: center; gap: 7px; font-size: 15px; font-weight: 900; }
          .badge-caderno {
            font-size: 8.5px; font-weight: 900;
            padding: 2px 8px; border-radius: 999px;
            background: ${config.bgCor}; color: ${config.cor};
            letter-spacing: 0.04em; text-transform: uppercase;
          }
          .subtitulo-caderno { font-size: 10px; color: #666; margin-top: 3px; }
          .total-questoes    { font-size: 9.5px; color: #999; margin-top: 2px; }

          /* ── Grid de duas colunas ── */
          .questoes-grid {
            column-count: 2;
            column-gap: 20px;
            column-rule: 1px solid #E5E5E5;
          }

          /* ── Questão individual ── */
          .questao {
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px dashed #E5E5E5;
          }
          .questao:last-child { border-bottom: none; margin-bottom: 0; }

          /* Evita que o cabeçalho fique órfão no fim da coluna */
          .questao-header {
            display: flex; align-items: flex-start; gap: 7px; margin-bottom: 5px;
            break-after: avoid;
            -webkit-column-break-after: avoid;
          }
          .numero {
            min-width: 18px; height: 18px;
            background: #F5F5F5; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 8.5px; font-weight: 900; color: #999; flex-shrink: 0;
          }
          .tags { display: flex; flex-wrap: wrap; gap: 3px; }
          .tag-materia, .tag-assunto, .tag-resultado {
            font-size: 8.5px; font-weight: 700;
            padding: 1px 6px; border-radius: 999px;
          }
          .tag-materia  { background: #F5F5F5; color: #666; }
          .tag-assunto  { background: ${config.bgCor}; color: ${config.cor}; }
          .tag-resultado { background: #F5F5F5; }
          .enunciado {
            font-size: 11px; line-height: 1.6;
            margin: 5px 0 7px 25px;
            text-align: justify;
          }
          .gabarito { margin-left: 25px; font-size: 9.5px; color: #666; display: flex; gap: 14px; }
          .gabarito strong { color: #1A1A1A; }

          /* ── Rodapé — largura total ── */
          .rodape {
            column-span: all;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #E5E5E5;
            font-size: 8.5px; color: #BBBBBB;
            display: flex; justify-content: space-between;
          }

          @media print {
            body { padding: 0; }
            @page { margin: 1.2cm; size: A4 portrait; }
            .questoes-grid { column-count: 2; }
          }
        </style>
      </head>
      <body>

        <div class="cabecalho">
          <div class="cabecalho-logo">
            <div class="logo-icone">R</div>
            <div class="logo-texto">
              Rinha de<br/>Concurseiro<span class="logo-ponto">.</span>
            </div>
          </div>
          <div class="cabecalho-meta">
            <div><strong>${nomeUsuario}</strong></div>
            ${emailUsuario ? `<div>${emailUsuario}</div>` : ''}
            <div>Impresso em ${dataImpressao}</div>
          </div>
        </div>

        <div class="titulo-bloco">
          <div class="titulo-caderno">
            Caderno <span class="badge-caderno">${config.label}</span>
          </div>
          <p class="subtitulo-caderno">${config.descricao}</p>
          <p class="total-questoes">${dados.totalQuestoes} ${dados.totalQuestoes === 1 ? 'questão' : 'questões'}</p>
        </div>

        <div class="questoes-grid">
          ${questoesHtml}
        </div>

        <div class="rodape">
          <span>Rinha de Concurseiro — Preparação para concursos CEBRASPE</span>
          <span>Caderno ${config.label} · ${dataImpressao}</span>
        </div>

        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;

    const janela = window.open('', '_blank');
    janela?.document.write(html);
    janela?.document.close();
  }

  if (!config) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm">
          Caderno inválido. Use: vermelho, amarelo ou verde.
        </div>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-bold text-accent hover:underline">
          ← Voltar ao Dashboard
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>

      {/* ── Cabeçalho ── */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest mb-5 transition-colors"
          style={{ color: '#999' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#1A1A1A'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#999'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
          Dashboard
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: config.bgCor, border: `1px solid ${config.borderCor}` }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: config.cor }}>
                {config.icon}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-dark-text leading-none">
                Caderno {config.label}
              </h1>
              <p className="text-sm mt-1" style={{ color: '#999' }}>{config.descricao}</p>
            </div>
          </div>

          {/* Botão imprimir — desabilitado enquanto carrega ou sem questões */}
          <button
            onClick={handlePrint}
            disabled={loading || !dados || dados.questoes.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ border: '1px solid #E5E5E5', color: '#666', backgroundColor: '#fff' }}
            onMouseEnter={e => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.borderColor = config.cor;
                e.currentTarget.style.color = config.cor;
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E5E5E5';
              e.currentTarget.style.color = '#666';
            }}
            title="Imprimir questões do caderno"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* ── Abas de navegação ── */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-6"
        style={{ backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5' }}
      >
        {(Object.keys(CADERNO_CONFIG) as (keyof typeof CADERNO_CONFIG)[]).map(key => {
          const c = CADERNO_CONFIG[key];
          const isActive = key === cadernoKey;
          return (
            <NavLink
              key={key}
              to={`/cadernos/${key.toLowerCase()}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-xs font-black"
              style={{
                backgroundColor: isActive ? '#fff'       : 'transparent',
                color:           isActive ? c.cor        : '#999',
                boxShadow:       isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                border:          isActive ? `1px solid ${c.borderCor}` : '1px solid transparent',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{c.icon}</span>
              {c.label}
            </NavLink>
          );
        })}
      </div>

      {/* ── Conteúdo ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-[28px] animate-pulse"
              style={{ backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5' }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl text-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          {error}
          <button onClick={loadCaderno} className="ml-3 font-bold underline">Tentar novamente</button>
        </div>
      ) : !dados || dados.questoes.length === 0 ? (
        <EstadoVazio config={config} />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Contador */}
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#999' }}>
              {dados.totalQuestoes} {dados.totalQuestoes === 1 ? 'questão' : 'questões'}
            </span>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: config.bgCor, color: config.cor }}
            >
              {config.label}
            </span>
          </div>

          {/* Resumo por assunto — dados reais via GET /cadernos/{caderno}/resumo */}
          <ResumoCaderno config={config} label={dados.titulo ?? config.label} resumo={resumo} />

          {dados.questoes.map((q, idx) => (
            <QuestaoCard key={q.id} questao={q} idx={idx} config={config} />
          ))}
        </div>
      )}
    </Layout>
  );
}

// ── Card de questão expansível ────────────────────────────────────

function QuestaoCard({
  questao, idx, config,
}: {
  questao: RespostaDetalhe;
  idx: number;
  config: typeof CADERNO_CONFIG[keyof typeof CADERNO_CONFIG];
}) {
  const [aberto, setAberto] = useState(false);

  const resultado = questao.tipoResultado
    ? TIPO_RESULTADO_LABEL[questao.tipoResultado] ?? null
    : null;

  const acertou = questao.acertou;
  const textoLimpo = (html?: string) =>
    html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';

  function gerarUrlBusca() {
    const termos = textoLimpo(questao.comando ?? '').substring(0, 180);
    const sites = 'site:tecconcursos.com.br OR site:grancursosonline.com.br OR site:estrategiaconcursos.com.br';
    return `https://www.google.com/search?q=${encodeURIComponent(termos + ' ' + sites)}`;
  }

  return (
    <div
      className="bg-white rounded-[28px] overflow-hidden transition-all"
      style={{ border: '1px solid #E5E5E5' }}
    >
      {/* Linha clicável */}
      <button
        onClick={() => setAberto(v => !v)}
        className="w-full flex items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        {/* Número */}
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
          style={{ backgroundColor: '#F5F5F5', color: '#999' }}
        >
          {idx + 1}
        </span>

        <div className="flex-1 min-w-0">
          {/* Matéria + assunto */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#F5F5F5', color: '#666' }}
            >
              {questao.materiaNome}
            </span>
            {questao.assuntoNome && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: config.bgCor, color: config.cor }}
              >
                {questao.assuntoNome}
              </span>
            )}
          </div>

          {/* Enunciado resumido */}
          <p className="text-sm text-dark-text leading-relaxed line-clamp-2">
            {textoLimpo(questao.comando)}
          </p>
        </div>

        {/* Classificação + seta */}
        <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
          {resultado ? (
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap"
              style={{ backgroundColor: resultado.bg, color: resultado.cor }}
            >
              {resultado.texto}
            </span>
          ) : (
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: acertou ? '#ecfdf5' : '#fef2f2',
                color:           acertou ? '#059669' : '#DC2626',
              }}
            >
              {acertou ? 'Certo' : 'Errado'}
            </span>
          )}
          <span
            className="material-symbols-outlined transition-transform duration-200"
            style={{ fontSize: '18px', color: '#CCC', transform: aberto ? 'rotate(180deg)' : 'none' }}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* Expansão */}
      {aberto && (
        <div className="px-5 pb-5 flex flex-col gap-4" style={{ borderTop: '1px solid #F0F0F0' }}>

          {/* Enunciado completo */}
          {questao.comando && (
            <div className="pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#999' }}>Enunciado</p>
              <p className="text-sm text-dark-text leading-relaxed">{textoLimpo(questao.comando)}</p>
            </div>
          )}

          {/* Gabarito + classificação */}
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#999' }}>Gabarito</p>
              <span
                className="text-xs font-black px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: questao.gabarito === 'CERTO' ? '#ecfdf5' : '#fef2f2',
                  color:           questao.gabarito === 'CERTO' ? '#059669' : '#DC2626',
                }}
              >
                {questao.gabarito === 'CERTO' ? 'Certo' : 'Errado'}
              </span>
            </div>

            {questao.resposta && (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#999' }}>Sua resposta</p>
                <span
                  className="text-xs font-black px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: acertou ? '#ecfdf5' : '#fef2f2',
                    color:           acertou ? '#059669' : '#DC2626',
                  }}
                >
                  {questao.resposta === 'CERTO' ? 'Certo' : questao.resposta === 'ERRADO' ? 'Errado' : 'Em branco'}
                </span>
              </div>
            )}

            {resultado && (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#999' }}>Classificação</p>
                <span
                  className="text-xs font-black px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: resultado.bg, color: resultado.cor }}
                >
                  {resultado.texto}
                </span>
              </div>
            )}
          </div>

          {/* Link de pesquisa */}
          {!acertou && questao.comando && (
            <a
              href={gerarUrlBusca()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold transition-colors"
              style={{ color: config.cor }}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>search</span>
              Pesquisar sobre essa questão
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Resumo por assunto ───────────────────────────────────────────

function ResumoCaderno({
  config,
  label,
  resumo,
}: {
  config: typeof CADERNO_CONFIG[keyof typeof CADERNO_CONFIG];
  label:  string;
  resumo: ResumoAssunto[];
}) {
  const [modalAberto, setModalAberto] = useState(false);

  if (resumo.length === 0) return null;

  const totalQuestoes = resumo.reduce((acc, item) => acc + item.total, 0);

  return (
    <>
      <div
        className="bg-white rounded-[28px] overflow-hidden mb-2"
        style={{ border: '1px solid #E5E5E5' }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h3 className="text-sm font-black text-dark-text">
              Assuntos no Caderno
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: '#999' }}>
              {resumo.length} {resumo.length === 1 ? 'assunto' : 'assuntos'}
              {' · '}
              {totalQuestoes} {totalQuestoes === 1 ? 'questão' : 'questões'}
            </p>
          </div>

          {/* Botão Mini-simulado */}
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3.5 py-2 rounded-full transition-all hover:opacity-80 active:scale-95"
            style={{ backgroundColor: config.bgCor, color: config.cor, border: `1px solid ${config.borderCor}` }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
              quiz
            </span>
            Mini-simulado
          </button>
        </div>

        {/* Lista de assuntos — apenas nome + contagem */}
        <div className="px-6 pb-5 flex flex-col gap-0">
          {resumo.map((item, idx) => (
            <div
              key={item.assuntoId}
              className="flex items-center justify-between py-2.5"
              style={{
                borderTop: idx === 0 ? 'none' : '1px solid #F5F5F5',
              }}
            >
              <span className="text-xs font-bold text-dark-text truncate flex-1 mr-3">
                {item.assuntoNome}
              </span>
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full shrink-0"
                style={{ backgroundColor: config.bgCor, color: config.cor }}
              >
                {item.total} {item.total === 1 ? 'questão' : 'questões'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de seleção de assunto */}
      {modalAberto && (
        <ModalMiniSimulado
          config={config}
          label={label}
          assuntos={resumo}
          onClose={() => setModalAberto(false)}
        />
      )}
    </>
  );
}

// ── Modal Mini-simulado ───────────────────────────────────────────

function ModalMiniSimulado({
  config,
  label,
  assuntos,
  onClose,
}: {
  config:   typeof CADERNO_CONFIG[keyof typeof CADERNO_CONFIG];
  label:    string;
  assuntos: ResumoAssunto[];
  onClose:  () => void;
}) {
  const [assuntoSelecionado, setAssuntoSelecionado] = useState<ResumoAssunto | null>(null);

  function handleIniciar() {
    if (!assuntoSelecionado) return;
    // TODO: chamar endpoint do mini-simulado quando o backend estiver pronto
    // por ora fecha o modal
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white w-full max-w-md rounded-[28px] overflow-hidden"
        style={{ border: '1px solid #E5E5E5' }}
      >
        {/* Header do modal */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '16px', color: config.cor }}
              >
                quiz
              </span>
              <h2 className="text-sm font-black text-dark-text">Mini-simulado</h2>
            </div>
            <p className="text-[11px]" style={{ color: '#999' }}>
              Caderno {label} · 15 questões
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#999' }}>
              close
            </span>
          </button>
        </div>

        {/* Lista de assuntos para selecionar */}
        <div className="px-4 pb-2 max-h-64 overflow-y-auto flex flex-col gap-1.5">
          {assuntos.map(a => {
            const selecionado = assuntoSelecionado?.assuntoId === a.assuntoId;
            return (
              <button
                key={a.assuntoId}
                onClick={() => setAssuntoSelecionado(selecionado ? null : a)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all"
                style={
                  selecionado
                    ? { backgroundColor: config.bgCor, border: `1.5px solid ${config.cor}` }
                    : { backgroundColor: '#FAFAFA', border: '1.5px solid #EEEEEE' }
                }
              >
                <span
                  className="text-xs font-bold truncate flex-1 mr-3"
                  style={{ color: selecionado ? config.cor : '#1A1A1A' }}
                >
                  {a.assuntoNome}
                </span>
                <span
                  className="text-[10px] font-black shrink-0"
                  style={{ color: selecionado ? config.cor : '#999' }}
                >
                  {a.total} {a.total === 1 ? 'questão' : 'questões'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 pt-3 pb-5 flex flex-col gap-2">
          <button
            onClick={handleIniciar}
            disabled={!assuntoSelecionado}
            className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            style={
              assuntoSelecionado
                ? { backgroundColor: config.cor, color: '#fff' }
                : { backgroundColor: '#F0F0F0', color: '#BBB', cursor: 'not-allowed' }
            }
          >
            {assuntoSelecionado
              ? `Iniciar · ${assuntoSelecionado.assuntoNome}`
              : 'Selecione um assunto'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-center transition-opacity hover:opacity-60"
            style={{ color: '#999' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Estado vazio ─────────────────────────────────────────────────

function EstadoVazio({ config }: { config: typeof CADERNO_CONFIG[keyof typeof CADERNO_CONFIG] }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-[28px] text-center"
      style={{ backgroundColor: config.bgCor, border: `1px solid ${config.borderCor}` }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: '#fff', border: `1px solid ${config.borderCor}` }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px', color: config.cor }}>
          {config.icon}
        </span>
      </div>
      <p className="text-sm font-black text-dark-text mb-1">Nenhuma questão aqui ainda</p>
      <p className="text-xs mb-5" style={{ color: '#999' }}>
        Complete simulados para popular este caderno.
      </p>
      <Link
        to="/simulados"
        className="text-xs font-black px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: config.cor }}
      >
        Ir para Simulados →
      </Link>
    </div>
  );
}