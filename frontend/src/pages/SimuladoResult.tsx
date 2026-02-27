import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import type { TentativaDetalhe, RespostaDetalhe, Caderno } from '../types';
import { getTentativaById } from '../services/tentativa';
import Layout from '../components/layout/Layout';
import DOMPurify from 'dompurify';

// ── Configurações visuais ──────────────────────────────────────────

const CADERNO_CONFIG: Record<Caderno, { label: string; icon: string; cor: string; bg: string; border: string; desc: string }> = {
  VERMELHO: { label: 'Crítico',   icon: 'priority_high', cor: '#DC2626', bg: '#FFF5F5', border: '#FECACA', desc: 'Revisão urgente — prioridade alta' },
  AMARELO:  { label: 'Reforço',   icon: 'bolt',          cor: '#D97706', bg: '#FFFBEB', border: '#FDE68A', desc: 'Reforçar o conteúdo — prioridade média' },
  VERDE:    { label: 'Domínio',   icon: 'check_circle',  cor: '#059669', bg: '#F0FDF4', border: '#BBF7D0', desc: 'Manutenção — continue assim' },
};

const TIPO_RESULTADO_LABELS: Record<string, { label: string; cor: string }> = {
  ACERTO_CONSCIENTE:  { label: 'Acerto consciente',   cor: '#059669' },
  ACERTO_COM_DUVIDA:  { label: 'Acerto com dúvida',   cor: '#D97706' },
  ACERTO_POR_CHUTE:   { label: 'Acerto por chute',    cor: '#7C3AED' },
  ERRO_CONTEUDO:      { label: 'Erro de conteúdo',    cor: '#DC2626' },
  ERRO_INTERPRETACAO: { label: 'Erro de interpretação', cor: '#EA580C' },
  ERRO_DISTRACAO:     { label: 'Erro por distração',  cor: '#6B7280' },
};

export default function SimuladoResult() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const location     = useLocation();
  const tentativaIdFromState = location.state?.tentativaId as number | undefined;

  const [tentativa,     setTentativa]     = useState<TentativaDetalhe | null>(null);
  const [cadernoAberto, setCadernoAberto] = useState<Caderno | null>(null);
  const [questaoAberta, setQuestaoAberta] = useState<number | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  useEffect(() => {
    if (tentativaIdFromState) loadTentativa(tentativaIdFromState);
    else { setError('Tentativa não encontrada.'); setLoading(false); }
  }, [tentativaIdFromState]);

  async function loadTentativa(tentativaId: number) {
    try {
      setLoading(true);
      setTentativa(await getTentativaById(tentativaId));
    } catch {
      setError('Erro ao carregar resultado.');
    } finally {
      setLoading(false);
    }
  }

  function agruparPorCaderno(respostas: RespostaDetalhe[]): Record<Caderno, RespostaDetalhe[]> {
    const grupos: Record<Caderno, RespostaDetalhe[]> = { VERMELHO: [], AMARELO: [], VERDE: [] };
    respostas.forEach((r) => { if (r.caderno) grupos[r.caderno].push(r); });
    return grupos;
  }

  function gerarUrlBusca(comando?: string): string {
    const sites = [
      'site:tecconcursos.com.br',
      'site:grancursosonline.com.br',
      'site:qconcursos.com',
      'site:estrategiaconcursos.com.br',
    ].join(' OR ');
    const texto = comando ? comando.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200) : '';
    return `https://www.google.com/search?q=${encodeURIComponent(texto + ' ' + sites)}`;
  }

  // ── Loading / erro ────────────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-dark-text border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !tentativa) {
    return (
      <Layout>
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-medium mb-4"
          style={{ backgroundColor: '#FFF5F5', color: '#DC2626', border: '1px solid #FECACA' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
          {error || 'Resultado não encontrado.'}
        </div>
        <Link to="/simulados" className="text-xs font-black uppercase tracking-widest text-dark-text underline">
          Voltar para simulados
        </Link>
      </Layout>
    );
  }

  const cadernos   = agruparPorCaderno(tentativa.respostas);
  const percentual = tentativa.percentualAcerto ?? 0;
  const aprovado   = percentual >= 70;

  return (
    <Layout>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] font-black uppercase tracking-widest text-subtle-text">Simulados</span>
        <span className="text-subtle-text" style={{ fontSize: '10px' }}>/</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-dark-text">Resultado</span>
      </div>

      {/* ── Hero do resultado ─────────────────────────────────────── */}
      <div
        className="bg-white rounded-3xl p-6 mb-4 flex flex-col sm:flex-row items-center sm:items-start gap-6"
        style={{ border: '1px solid #E5E5E5' }}
      >
        {/* Círculo de aproveitamento */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-3xl flex flex-col items-center justify-center"
            style={{
              backgroundColor: aprovado ? '#F0FDF4' : '#FFF5F5',
              border: `2px solid ${aprovado ? '#BBF7D0' : '#FECACA'}`,
            }}
          >
            <p
              className="text-xl font-black leading-none"
              style={{ color: aprovado ? '#059669' : '#DC2626' }}
            >
              {percentual.toFixed(0)}%
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: aprovado ? '#059669' : '#DC2626' }}>
              Acerto
            </p>
          </div>
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={
              aprovado
                ? { backgroundColor: '#F0FDF4', color: '#059669' }
                : { backgroundColor: '#FFF5F5', color: '#DC2626' }
            }
          >
            {aprovado ? 'Aprovado' : 'Reprovado'}
          </span>
        </div>

        {/* Detalhes */}
        <div className="flex-1 flex flex-col gap-3 w-full">
          <div>
            <h1 className="text-base font-black text-dark-text">{tentativa.simuladoTitulo}</h1>
            <p className="text-xs text-subtle-text mt-0.5">Resultado da tentativa finalizada</p>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { valor: tentativa.acertos  ?? 0, label: 'Acertos',  cor: '#059669', bg: '#F0FDF4' },
              { valor: tentativa.erros    ?? 0, label: 'Erros',    cor: '#DC2626', bg: '#FFF5F5' },
              { valor: tentativa.emBranco ?? 0, label: 'Branco',   cor: '#999',    bg: '#F5F5F5' },
              { valor: tentativa.pontuacao ?? 0, label: 'Pts CEBRASPE', cor: (tentativa.pontuacao ?? 0) >= 0 ? '#1A1A1A' : '#DC2626', bg: '#F5F5F5' },
            ].map(({ valor, label, cor, bg }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-3 rounded-2xl"
                style={{ backgroundColor: bg }}
              >
                <p className="text-lg font-black" style={{ color: cor }}>{valor}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-subtle-text mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Barra de aproveitamento */}
          <div>
            <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: '#F0F0F0' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${percentual}%`, backgroundColor: aprovado ? '#059669' : '#DC2626' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Cadernos de Revisão ───────────────────────────────────── */}
      <p className="text-[10px] font-black uppercase tracking-widest text-subtle-text mb-3 mt-6">
        Cadernos de revisão
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {(['VERMELHO', 'AMARELO', 'VERDE'] as Caderno[]).map((caderno) => {
          const cfg      = CADERNO_CONFIG[caderno];
          const questoes = cadernos[caderno];
          const isAberto = cadernoAberto === caderno;

          if (questoes.length === 0) return null;

          return (
            <div
              key={caderno}
              className="bg-white rounded-3xl overflow-hidden"
              style={{ border: '1px solid #E5E5E5' }}
            >
              {/* Header do caderno */}
              <button
                onClick={() => setCadernoAberto(isAberto ? null : caderno)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-background-hub transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: cfg.cor }}>
                      {cfg.icon}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-dark-text">{cfg.label}</p>
                    <p className="text-[10px] text-subtle-text">{cfg.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[10px] font-black px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: cfg.bg, color: cfg.cor }}
                  >
                    {questoes.length}
                  </span>
                  <span
                    className="material-symbols-outlined text-subtle-text"
                    style={{ fontSize: '16px', transform: isAberto ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {/* Lista de questões */}
              {isAberto && (
                <div style={{ borderTop: '1px solid #F0F0F0' }}>
                  {questoes.map((r) => {
                    const tipoLabel = r.tipoResultado ? TIPO_RESULTADO_LABELS[r.tipoResultado] : null;
                    const isQAberta = questaoAberta === r.id;

                    return (
                      <div key={r.id} style={{ borderBottom: '1px solid #F8F8F8' }}>

                        {/* Linha da questão */}
                        <button
                          onClick={() => setQuestaoAberta(isQAberta ? null : r.id)}
                          className="w-full px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-background-hub transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-black text-dark-text shrink-0">
                              Q{r.ordem}
                            </span>
                            {tipoLabel && (
                              <span
                                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0"
                                style={{ backgroundColor: `${tipoLabel.cor}18`, color: tipoLabel.cor }}
                              >
                                {tipoLabel.label}
                              </span>
                            )}
                            <span className="text-[10px] text-subtle-text truncate">
                              {r.materiaNome}{r.assuntoNome ? ` · ${r.assuntoNome}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!r.acertou && (
                              <a
                                href={gerarUrlBusca(r.comando)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-colors hover:bg-background-hub"
                                style={{ color: '#999' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>search</span>
                                Pesquisar
                              </a>
                            )}
                            <span
                              className="material-symbols-outlined text-subtle-text"
                              style={{ fontSize: '14px', transform: isQAberta ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
                            >
                              expand_more
                            </span>
                          </div>
                        </button>

                        {/* Conteúdo expandido da questão */}
                        {isQAberta && (
                          <div className="px-5 pb-4" style={{ borderTop: '1px solid #F8F8F8' }}>
                            {r.comando && (
                              <div
                                className="mt-3 p-4 rounded-2xl text-sm leading-relaxed text-dark-text [&_p]:mb-3 [&_p:last-child]:mb-0 max-h-64 overflow-y-auto"
                                style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(r.comando) }}
                              />
                            )}
                            <div className="flex gap-3 mt-3">
                              <div
                                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
                              >
                                <span className="text-[9px] font-black uppercase tracking-widest text-subtle-text">Você</span>
                                <span className="text-xs font-black" style={{ color: r.resposta === 'CERTO' ? '#059669' : r.resposta === 'ERRADO' ? '#DC2626' : '#999' }}>
                                  {r.resposta === 'CERTO' ? 'Certo' : r.resposta === 'ERRADO' ? 'Errado' : 'Em branco'}
                                </span>
                              </div>
                              <div
                                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
                              >
                                <span className="text-[9px] font-black uppercase tracking-widest text-subtle-text">Gabarito</span>
                                <span className="text-xs font-black" style={{ color: r.gabarito === 'CERTO' ? '#059669' : '#DC2626' }}>
                                  {r.gabarito === 'CERTO' ? 'Certo' : 'Errado'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {tentativa.totalVermelho === 0 && tentativa.totalAmarelo === 0 && tentativa.totalVerde === 0 && (
          <div
            className="flex flex-col items-center gap-2 py-10 rounded-3xl"
            style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
          >
            <span className="material-symbols-outlined text-subtle-text" style={{ fontSize: '32px' }}>inbox</span>
            <p className="text-xs text-subtle-text">Nenhuma questão classificada nos cadernos.</p>
          </div>
        )}
      </div>

      {/* ── Ações ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center mb-8">
        <button
          onClick={() => navigate(`/simulados/${id}`)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          style={{ backgroundColor: '#F5F5F5', color: '#1A1A1A', border: '1px solid #E5E5E5' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>replay</span>
          Refazer Simulado
        </button>
        <Link
          to="/simulados"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          style={{ backgroundColor: '#1A1A1A', color: '#fff' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>grid_view</span>
          Ver Outros Simulados
        </Link>
      </div>

    </Layout>
  );
}