import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { SimuladoDetalhado, RespostaRequest, TipoErro } from '../types';
import { salvarRespostas, finalizarTentativa } from '../services/tentativa';
import { isHttpStatus } from '../services/httpError';
import Layout from '../components/layout/Layout';
import DOMPurify from 'dompurify';

interface DadosPendentes {
  simulado:    SimuladoDetalhado;
  tentativaId: number;
  respostas:   RespostaRequest[];
}

interface QuestaoErrada {
  index:              number;
  simuladoQuestaoId:  number;
  questaoId:          number;
  ordem:              number;
  comando?:           string;
  materiaNome:        string;
  assuntoNome?:       string;
  respostaUsuario:    'CERTO' | 'ERRADO';
  gabarito:           'CERTO' | 'ERRADO';
}

const ERRO_CONFIG: Record<TipoErro, { label: string; icon: string; cor: string; bg: string; border: string }> = {
  CONTEUDO:      { label: 'Não sabia o conteúdo', icon: 'menu_book',       cor: '#DC2626', bg: '#FFF5F5', border: '#FECACA' },
  INTERPRETACAO: { label: 'Errei a interpretação', icon: 'manage_search',  cor: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  DISTRACAO:     { label: 'Falta de atenção',      icon: 'sentiment_dissatisfied', cor: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
};

export default function SimuladoFeedback() {
  const { id }        = useParams<{ id: string }>();
  const navigate      = useNavigate();
  const location      = useLocation();
  const tentativaIdFromState = location.state?.tentativaId as number | undefined;

  const [dados,           setDados]           = useState<DadosPendentes | null>(null);
  const [questoesErradas, setQuestoesErradas] = useState<QuestaoErrada[]>([]);
  const [feedbacks,       setFeedbacks]       = useState<Map<number, TipoErro>>(new Map());
  const [expandida,       setExpandida]       = useState<number | null>(null);
  const [finalizando,     setFinalizando]     = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  

  // async function finalizarDireto(dadosParam: DadosPendentes) {
  const finalizarDireto = useCallback(async (dadosParam: DadosPendentes) => {
    try {
      setFinalizando(true);
      await finalizarTentativa(dadosParam.tentativaId);
      sessionStorage.removeItem(`pendente_${dadosParam.tentativaId}`);
      navigate(`/simulados/${id}/resultado`, { state: { tentativaId: dadosParam.tentativaId } });
    } catch (error) {
      if (isHttpStatus(error, 409)) {
        sessionStorage.removeItem(`pendente_${dadosParam.tentativaId}`);
        navigate(`/simulados/${id}/resultado`, { state: { tentativaId: dadosParam.tentativaId } });
        return;
      }
      setError('Erro ao finalizar. Tente novamente.');
      setFinalizando(false);
    }
  }, [navigate, id]);

  useEffect(() => {
    if (!tentativaIdFromState) { navigate('/simulados'); return; }

    const stored = sessionStorage.getItem(`pendente_${tentativaIdFromState}`);
    if (!stored) { navigate('/simulados'); return; }

    const parsed: DadosPendentes = JSON.parse(stored);
    setDados(parsed);

    const erradas: QuestaoErrada[] = [];
    parsed.respostas.forEach((r, index) => {
      if (r.resposta === null) return;
      const questao = parsed.simulado.questoes.find((q) => q.id === r.simuladoQuestaoId);
      if (!questao) return;
      if (r.resposta !== questao.gabarito) {
        erradas.push({
          index,
          simuladoQuestaoId: r.simuladoQuestaoId,
          questaoId:         questao.questaoId,
          ordem:             questao.ordem,
          comando:           questao.comando,
          materiaNome:       questao.materiaNome,
          assuntoNome:       questao.assuntoNome,
          respostaUsuario:   r.resposta as 'CERTO' | 'ERRADO',
          gabarito:          questao.gabarito,
        });
      }
    });

    setQuestoesErradas(erradas);
    if (erradas.length === 0) finalizarDireto(parsed);
  }, [tentativaIdFromState, navigate, finalizarDireto]);

  function handleFeedback(simuladoQuestaoId: number, tipo: TipoErro) {
    setFeedbacks((prev) => { const n = new Map(prev); n.set(simuladoQuestaoId, tipo); return n; });
  }

  async function handleConcluir() {
    if (!dados) return;
    try {
      setFinalizando(true);
      setError(null);
      const atualizadas: RespostaRequest[] = dados.respostas.map((r) => ({
        ...r,
        tipoErro: feedbacks.get(r.simuladoQuestaoId) ?? null,
      }));
      await salvarRespostas(dados.tentativaId, { respostas: atualizadas });
      await finalizarTentativa(dados.tentativaId);
      sessionStorage.removeItem(`pendente_${dados.tentativaId}`);
      navigate(`/simulados/${id}/resultado`, { state: { tentativaId: dados.tentativaId } });
    } catch (error) {
      if (isHttpStatus(error, 409)) {
        sessionStorage.removeItem(`pendente_${dados.tentativaId}`);
        navigate(`/simulados/${id}/resultado`, { state: { tentativaId: dados.tentativaId } });
        return;
      }
      setError('Erro ao finalizar. Tente novamente.');
    } finally {
      setFinalizando(false);
    }
  }

  const todosFeedbacks = questoesErradas.length === 0 ||
    questoesErradas.every((q) => feedbacks.has(q.simuladoQuestaoId));

  const progresso = questoesErradas.length > 0
    ? Math.round((feedbacks.size / questoesErradas.length) * 100)
    : 100;

  if (!dados || finalizando) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-dark-text border-t-transparent rounded-full animate-spin" />
          {finalizando && (
            <p className="text-xs font-medium text-subtle-text uppercase tracking-widest">
              Finalizando simulado...
            </p>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] font-black uppercase tracking-widest text-subtle-text">Simulados</span>
        <span className="text-subtle-text" style={{ fontSize: '10px' }}>/</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-dark-text">Análise dos Erros</span>
      </div>

      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-lg font-black text-dark-text">Análise dos Erros</h1>
        <p className="text-xs text-subtle-text mt-1">
          Classifique cada erro para criar seu plano de revisão personalizado.
        </p>
      </div>

      {/* Erro */}
      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-medium mb-4"
          style={{ backgroundColor: '#FFF5F5', color: '#DC2626', border: '1px solid #FECACA' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
          {error}
        </div>
      )}

      {/* Progresso */}
      <div
        className="bg-white rounded-3xl p-5 mb-6"
        style={{ border: '1px solid #E5E5E5' }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-subtle-text">
            Progresso da classificação
          </p>
          <span className="text-xs font-black text-dark-text">{feedbacks.size}/{questoesErradas.length}</span>
        </div>
        <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: '#F0F0F0' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progresso}%`, backgroundColor: '#1A1A1A' }}
          />
        </div>
      </div>

      {/* Lista de questões erradas */}
      <div className="flex flex-col gap-3 mb-8">
        {questoesErradas.map((q) => {
          const feedbackSelecionado = feedbacks.get(q.simuladoQuestaoId);
          const isAberta = expandida === q.simuladoQuestaoId;

          return (
            <div
              key={q.simuladoQuestaoId}
              className="bg-white rounded-3xl overflow-hidden transition-all"
              style={{ border: feedbackSelecionado ? '1px solid #E5E5E5' : '1px solid #E5E5E5' }}
            >
              {/* Header da questão */}
              <button
                onClick={() => setExpandida(isAberta ? null : q.simuladoQuestaoId)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 transition-colors hover:bg-background-hub"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status */}
                  <div
                    className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center"
                    style={
                      feedbackSelecionado
                        ? { backgroundColor: ERRO_CONFIG[feedbackSelecionado].bg }
                        : { backgroundColor: '#FFF5F5' }
                    }
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '14px',
                        color: feedbackSelecionado ? ERRO_CONFIG[feedbackSelecionado].cor : '#DC2626',
                      }}
                    >
                      {feedbackSelecionado ? ERRO_CONFIG[feedbackSelecionado].icon : 'close'}
                    </span>
                  </div>

                  <div className="min-w-0 text-left">
                    <p className="text-xs font-black text-dark-text">Questão {q.ordem}</p>
                    <p className="text-[10px] text-subtle-text truncate">{q.materiaNome}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {feedbackSelecionado ? (
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: ERRO_CONFIG[feedbackSelecionado].bg,
                        color:           ERRO_CONFIG[feedbackSelecionado].cor,
                      }}
                    >
                      {ERRO_CONFIG[feedbackSelecionado].label}
                    </span>
                  ) : (
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: '#FFF5F5', color: '#DC2626' }}
                    >
                      Classificar
                    </span>
                  )}
                  <span className="material-symbols-outlined text-subtle-text" style={{ fontSize: '16px', transform: isAberta ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}>
                    expand_more
                  </span>
                </div>
              </button>

              {/* Conteúdo expandido */}
              {isAberta && (
                <div style={{ borderTop: '1px solid #F0F0F0' }}>

                  {/* Comando */}
                  {q.comando && (
                    <div
                      className="mx-5 my-4 p-4 rounded-2xl text-sm leading-relaxed text-dark-text [&_p]:mb-3 [&_p:last-child]:mb-0 max-h-64 overflow-y-auto"
                      style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.comando) }}
                    />
                  )}

                  {/* Comparativo */}
                  <div className="mx-5 mb-4 flex gap-3">
                    <div
                      className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                      style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-subtle-text">Você</span>
                      <span
                        className="text-xs font-black"
                        style={{ color: q.respostaUsuario === 'CERTO' ? '#059669' : '#DC2626' }}
                      >
                        {q.respostaUsuario === 'CERTO' ? 'Certo' : 'Errado'}
                      </span>
                    </div>
                    <div
                      className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                      style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-subtle-text">Gabarito</span>
                      <span
                        className="text-xs font-black"
                        style={{ color: q.gabarito === 'CERTO' ? '#059669' : '#DC2626' }}
                      >
                        {q.gabarito === 'CERTO' ? 'Certo' : 'Errado'}
                      </span>
                    </div>
                  </div>

                  {/* Botões de tipo de erro */}
                  <div className="px-5 pb-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-subtle-text mb-2.5">
                      Por que você errou?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {(Object.keys(ERRO_CONFIG) as TipoErro[]).map((tipo) => {
                        const cfg        = ERRO_CONFIG[tipo];
                        const selecionado = feedbackSelecionado === tipo;
                        return (
                          <button
                            key={tipo}
                            onClick={() => handleFeedback(q.simuladoQuestaoId, tipo)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                            style={
                              selecionado
                                ? { backgroundColor: cfg.bg,     color: cfg.cor,   border: `1.5px solid ${cfg.border}` }
                                : { backgroundColor: '#FAFAFA',   color: '#999',    border: '1.5px solid #EEEEEE' }
                            }
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                              {cfg.icon}
                            </span>
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão concluir */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleConcluir}
          disabled={!todosFeedbacks || finalizando}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          style={
            todosFeedbacks && !finalizando
              ? { backgroundColor: '#1A1A1A', color: '#fff' }
              : { backgroundColor: '#F0F0F0', color: '#BBB', cursor: 'not-allowed' }
          }
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            {finalizando ? 'hourglass_top' : 'flag'}
          </span>
          {finalizando ? 'Finalizando...' : 'Ver Resultado'}
        </button>

        {!todosFeedbacks && (
          <p className="text-[11px] text-subtle-text">
            Classifique todos os erros para continuar.
          </p>
        )}
      </div>
    </Layout>
  );
}
