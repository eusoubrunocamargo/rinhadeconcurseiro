import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { SimuladoDetalhado, NivelConfianca, RespostaRequest } from '../types';
import { getSimuladoById } from '../services/simulado';
import { iniciarSimulado, salvarRespostas, getTentativaById } from '../services/tentativa';
import { isHttpStatus } from '../services/httpError';
import Layout from '../components/layout/Layout';
import QuestaoCard from '../components/ui/QuestaoCard';
import SimuladoLayout from '../components/layout/SimuladoLayout';

interface RespostaLocal {
  resposta: boolean | null;
  confianca: NivelConfianca | null;
  confirmada: boolean;
}

export default function SimuladoPlay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const tentativaIdFromState = location.state?.tentativaId as number | undefined;
  const refazerFromState     = location.state?.refazer     as boolean | undefined;

  const [simulado,       setSimulado]       = useState<SimuladoDetalhado | null>(null);
  const [tentativaId,    setTentativaId]    = useState<number | null>(tentativaIdFromState ?? null);
  const [respostas,      setRespostas]      = useState<Map<number, RespostaLocal>>(new Map());
  const [questaoAtual,   setQuestaoAtual]   = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [salvando,       setSalvando]       = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [mapaAberto,     setMapaAberto]     = useState(false);

  // useEffect(() => {
  //   if (id) loadSimulado(parseInt(id));
  // }, [id]);
  const carregarRespostasExistentes = useCallback(async (tentId: number, simuladoData: SimuladoDetalhado) => {
    try {
      const tentativa = await getTentativaById(tentId);
      const mapa = new Map<number, RespostaLocal>();

      tentativa.respostas.forEach((r) => {
        const sq = simuladoData.questoes.find((q) => q.id === r.simuladoQuestaoId);
        if (sq && r.resposta) {
          mapa.set(sq.questaoId, {
            resposta:  r.resposta === 'CERTO' ? true : r.resposta === 'ERRADO' ? false : null,
            confianca: r.confianca,
            confirmada: true,
          });
        }
      });

      setRespostas(mapa);

      const primeiraVazia = simuladoData.questoes.findIndex((sq) => !mapa.has(sq.questaoId));
      if (primeiraVazia !== -1) setQuestaoAtual(primeiraVazia);
    } catch (err) {
      console.error('Erro ao carregar respostas existentes:', err);
    }
  }, []);

  // const loadSimulado = useCallback(async (simuladoId: number) => {
  //   try {
  //     setLoading(true);
  //     const data = await getSimuladoById(simuladoId);
  //     setSimulado(data);


  // Fecha mapa ao trocar questão
  useEffect(() => {
    setMapaAberto(false);
  }, [questaoAtual]);

  // ── Carregamento ──────────────────────────────────────────────────────────

  const loadSimulado = useCallback(async (simuladoId: number) => {
    try {
      setLoading(true);
      const data = await getSimuladoById(simuladoId);
      setSimulado(data);

      if (tentativaIdFromState && !refazerFromState) {
        setTentativaId(tentativaIdFromState);
        await carregarRespostasExistentes(tentativaIdFromState, data);
      } else {
        const tentativa = await iniciarSimulado(simuladoId, refazerFromState ?? false);
        setTentativaId(tentativa.tentativaId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar simulado.');
    } finally {
      setLoading(false);
    }
  }, [tentativaIdFromState, refazerFromState, carregarRespostasExistentes]);
  
   useEffect(() => {
    if (id) loadSimulado(parseInt(id));
  }, [id, loadSimulado]);


  // async function carregarRespostasExistentes(tentId: number, simuladoData: SimuladoDetalhado) {
  //   try {
  //     const tentativa = await getTentativaById(tentId);
  //     const mapa = new Map<number, RespostaLocal>();

  //     tentativa.respostas.forEach((r) => {
  //       const sq = simuladoData.questoes.find((q) => q.id === r.simuladoQuestaoId);
  //       if (sq && r.resposta) {
  //         mapa.set(sq.questaoId, {
  //           resposta:  r.resposta === 'CERTO' ? true : r.resposta === 'ERRADO' ? false : null,
  //           confianca: r.confianca,
  //           confirmada: true,
  //         });
  //       }
  //     });

  //     setRespostas(mapa);

  //     const primeiraVazia = simuladoData.questoes.findIndex((sq) => !mapa.has(sq.questaoId));
  //     if (primeiraVazia !== -1) setQuestaoAtual(primeiraVazia);
  //   } catch (err) {
  //     console.error('Erro ao carregar respostas existentes:', err);
  //   }
  // }

  // ── Handlers de resposta ──────────────────────────────────────────────────

  function handleResponder(questaoId: number, valor: boolean | null) {
    setRespostas((prev) => {
      const novo = new Map(prev);
      if (valor === null) {
        novo.delete(questaoId);
      } else {
        const atual = novo.get(questaoId);
        novo.set(questaoId, { resposta: valor, confianca: atual?.confianca ?? null, confirmada: false });
      }
      return novo;
    });
  }

  function handleConfianca(questaoId: number, valor: NivelConfianca) {
    setRespostas((prev) => {
      const novo  = new Map(prev);
      const atual = novo.get(questaoId);
      if (atual) novo.set(questaoId, { ...atual, confianca: valor, confirmada: false });
      return novo;
    });
  }

  function handleConfirmar(questaoId: number) {
    setRespostas((prev) => {
      const novo  = new Map(prev);
      const atual = novo.get(questaoId);
      if (atual && atual.resposta !== null && atual.confianca !== null) {
        novo.set(questaoId, { ...atual, confirmada: true });
      }
      return novo;
    });

    if (simulado && questaoAtual < simulado.questoes.length - 1) {
      setQuestaoAtual((prev) => prev + 1);
    }
  }

  // ── Payload & ações ───────────────────────────────────────────────────────

  function montarPayload(): RespostaRequest[] {
    if (!simulado) return [];
    return simulado.questoes.map((sq) => {
      const r = respostas.get(sq.questaoId);
      return {
        simuladoQuestaoId: sq.id,
        resposta:  r?.resposta === true ? 'CERTO' : r?.resposta === false ? 'ERRADO' : null,
        confianca: r?.confianca ?? null,
        tipoErro:  null,
      };
    });
  }

  async function handlePausar() {
    if (!simulado || !tentativaId) return;
    try {
      setSalvando(true);
      await salvarRespostas(tentativaId, { respostas: montarPayload() });
      navigate('/dashboard');
    } catch (error) {
      if (isHttpStatus(error, 409)) {
        navigate(`/simulados/${id}/resultado`, { state: { tentativaId } });
        return;
      }
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleFinalizarConfirmado() {
    if (!simulado || !tentativaId) return;
    setModalFinalizar(false);
    try {
      setSalvando(true);
      const payload = montarPayload();
      await salvarRespostas(tentativaId, { respostas: payload });
      sessionStorage.setItem(
        `pendente_${tentativaId}`,
        JSON.stringify({ simulado, tentativaId, respostas: payload })
      );
      navigate(`/simulados/${id}/feedback`, { state: { tentativaId } });
    } catch (error) {
      if (isHttpStatus(error, 409)) {
        navigate(`/simulados/${id}/resultado`, { state: { tentativaId } });
        return;
      }
      setError('Erro ao salvar respostas. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  // ── Estados de carregamento e erro ────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !simulado) {
    return (
      <Layout>
        <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#FFF5F5', color: '#DC2626' }}>
          {error || 'Simulado não encontrado.'}
        </div>
      </Layout>
    );
  }

  // ── Derivados ─────────────────────────────────────────────────────────────

  const questaoAtualData = simulado.questoes[questaoAtual];
  const totalQuestoes    = simulado.questoes.length;
  const respondidas      = Array.from(respostas.values()).filter((r) => r.confirmada).length;
  const emBranco         = totalQuestoes - Array.from(respostas.values()).filter((r) => r.resposta !== null).length;
  const respostaAtual    = respostas.get(questaoAtualData.questaoId);
  const podeConfirmar    = respostaAtual?.resposta !== null && respostaAtual?.confianca !== null;

  // ── Slots ─────────────────────────────────────────────────────────────────

  const slotHeader = (
    <div className="px-6 h-14 flex items-center justify-between gap-8">
      <div className="flex items-center gap-5">
        {/* Título */}
        <div>
          <h1 className="text-xs font-black uppercase tracking-tighter text-dark-text leading-none">
            {simulado.titulo}
          </h1>
          <p className="text-[10px] text-subtle-text font-medium mt-0.5">
            {totalQuestoes} questões
          </p>
        </div>

        {/* Progresso */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-black text-dark-text">
            {respondidas}
            <span className="text-subtle-text font-normal"> / {totalQuestoes}</span>
          </span>
          <div className="w-28 h-1 rounded-full" style={{ backgroundColor: '#EEEEEE' }}>
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{ width: `${(respondidas / totalQuestoes) * 100}%`, backgroundColor: '#1A1A1A' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const slotNavRodape = (
    <div className="h-24 px-0">
      <div className="max-w-145 w-full mx-auto px-4 h-full">
        <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-1.5 md:gap-2 h-full items-stretch py-2">

          {/* Esquerda — Anterior */}
          <button
            onClick={() => setQuestaoAtual((prev) => prev - 1)}
            disabled={questaoAtual === 0}
            className="h-full w-full flex items-center justify-center gap-1.5 px-2 md:px-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all active:scale-95"
            style={
              questaoAtual === 0
                ? { backgroundColor: '#F5F5F5', color: '#CCC', cursor: 'not-allowed', border: '1px solid #EEEEEE' }
                : { backgroundColor: '#F5F5F5', color: '#1A1A1A', border: '1px solid #E5E5E5' }
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
            Anterior
          </button>

          {/* Centro — Pausar + Finalizar */}
          <div className="grid grid-rows-2 gap-1.5 md:gap-2 h-full">
            <button
              onClick={handlePausar}
              disabled={salvando}
              className="h-full w-full flex items-center justify-center gap-1.5 px-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
              style={{ backgroundColor: '#F5F5F5', color: '#666', border: '1px solid #E5E5E5' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>pause</span>
              {salvando ? 'Salvando...' : 'Pausar'}
            </button>
            <button
              onClick={() => setModalFinalizar(true)}
              disabled={salvando}
              className="h-full w-full flex items-center justify-center gap-1.5 px-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
              style={{ backgroundColor: '#FF4D4D', color: '#fff' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check_circle</span>
              {salvando ? 'Salvando...' : 'Finalizar'}
            </button>
          </div>

          {/* Direita — Próxima */}
          <button
            onClick={() => setQuestaoAtual((prev) => prev + 1)}
            disabled={questaoAtual === totalQuestoes - 1}
            className="h-full w-full flex items-center justify-center gap-1.5 px-2 md:px-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all active:scale-95"
            style={
              questaoAtual === totalQuestoes - 1
                ? { backgroundColor: '#F5F5F5', color: '#CCC', cursor: 'not-allowed', border: '1px solid #EEEEEE' }
                : { backgroundColor: '#F5F5F5', color: '#1A1A1A', border: '1px solid #E5E5E5' }
            }
          >
            Próxima
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <SimuladoLayout header={slotHeader} navRodape={slotNavRodape}>

        {/* Card da questão */}
        <QuestaoCard
          numero={questaoAtualData.ordem}
          comando={questaoAtualData.comando}
          materia={questaoAtualData.materiaNome}
          assunto={questaoAtualData.assuntoNome}
          resposta={respostaAtual?.resposta ?? null}
          confianca={respostaAtual?.confianca ?? null}
          confirmada={respostaAtual?.confirmada ?? false}
          onResponder={(valor) => handleResponder(questaoAtualData.questaoId, valor)}
          onConfianca={(valor) => handleConfianca(questaoAtualData.questaoId, valor)}
          onConfirmar={() => handleConfirmar(questaoAtualData.questaoId)}
          podeConfirmar={podeConfirmar && !respostaAtual?.confirmada}
        />

        {respondidas < totalQuestoes && (
          <p className="text-[11px] text-subtle-text mt-4 text-center">
            {totalQuestoes - respondidas} questões não confirmadas
          </p>
        )}

      </SimuladoLayout>

      {/* ── Botão flutuante do mapa ───────────────────────────────────────── */}
      <button
        onClick={() => setMapaAberto((v) => !v)}
        className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-3 py-2.5 rounded-2xl shadow-lg transition-all active:scale-95"
        style={{ backgroundColor: '#1A1A1A', color: '#fff' }}
        title="Mapa de questões"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
          grid_view
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
          {respondidas}/{totalQuestoes}
        </span>
      </button>

      {/* ── Drawer do mapa ────────────────────────────────────────────────── */}
      {mapaAberto && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setMapaAberto(false)}
          />

          {/* Painel */}
          <div
            className="fixed bottom-20 right-4 z-50 rounded-3xl shadow-2xl overflow-hidden"
            style={{ width: 'min(340px, calc(100vw - 32px))', maxHeight: 'calc(100dvh - 120px)', backgroundColor: '#fff', border: '1px solid #E5E5E5', overflowY: 'auto' }}
          >
            {/* Cabeçalho do mapa */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F0F0F0' }}>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-dark-text">
                  Mapa de questões
                </p>
                <p className="text-[10px] text-subtle-text mt-0.5">
                  {respondidas} confirmadas · {emBranco} em branco
                </p>
              </div>
              <button
                onClick={() => setMapaAberto(false)}
                className="p-1 rounded-lg transition-colors hover:bg-background-hub"
              >
                <span className="material-symbols-outlined text-subtle-text" style={{ fontSize: '18px' }}>
                  close
                </span>
              </button>
            </div>

            {/* Legenda */}
            <div className="px-5 pt-3 pb-2 flex items-center gap-4">
              {[
                { cor: '#059669', bg: '#F0FDF4', label: 'Certo' },
                { cor: '#DC2626', bg: '#FFF5F5', label: 'Errado' },
                { cor: '#D97706', bg: '#FFFBEB', label: 'Marcada' },
                { cor: '#999',    bg: '#F5F5F5', label: 'Em branco' },
              ].map(({ cor, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cor }} />
                  <span className="text-[9px] font-medium" style={{ color: '#999' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Grid de questões */}
            <div className="px-5 pb-5 pt-2 grid grid-cols-10 gap-1.5 overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 280px)' }}>
              {simulado.questoes.map((sq, index) => {
                const item    = respostas.get(sq.questaoId);
                const isAtual = index === questaoAtual;

                let bg     = '#F5F5F5';
                let cor    = '#999';
                let border = '1px solid #EEEEEE';

                if (isAtual) {
                  bg = '#1A1A1A'; cor = '#fff'; border = '1px solid #1A1A1A';
                } else if (item?.confirmada && item.resposta === true) {
                  bg = '#F0FDF4'; cor = '#059669'; border = '1px solid #BBF7D0';
                } else if (item?.confirmada && item.resposta === false) {
                  bg = '#FFF5F5'; cor = '#DC2626'; border = '1px solid #FECACA';
                } else if (item?.resposta !== null && item?.resposta !== undefined) {
                  bg = '#FFFBEB'; cor = '#D97706'; border = '1px solid #FDE68A';
                }

                return (
                  <button
                    key={sq.id}
                    onClick={() => setQuestaoAtual(index)}
                    className="aspect-square flex items-center justify-center rounded-lg text-[10px] font-black transition-all active:scale-90"
                    style={{ backgroundColor: bg, color: cor, border }}
                    title={`Questão ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Modal de confirmação de finalização ───────────────────────────── */}
      {modalFinalizar && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[3px]"
            onClick={() => setModalFinalizar(false)}
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setModalFinalizar(false)}
          >
            <div
              className="rounded-3xl shadow-2xl p-6 w-full max-w-sm"
              style={{ backgroundColor: '#fff', border: '1px solid #E5E5E5' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ícone */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: '#F5F5F5' }}
              >
                <span className="material-symbols-outlined text-dark-text" style={{ fontSize: '22px' }}>
                  flag
                </span>
              </div>

              {/* Título */}
              <h2 className="text-base font-black text-dark-text mb-1">
                Finalizar simulado?
              </h2>

              {/* Descrição */}
              <p className="text-sm text-subtle-text leading-relaxed mb-1">
                {emBranco > 0
                  ? `Você possui ${emBranco} quest${emBranco > 1 ? 'ões' : 'ão'} em branco. Questões sem resposta não pontuam.`
                  : 'Todas as questões foram respondidas. Sua pontuação será calculada pelo método CEBRASPE.'}
              </p>

              {/* Resumo rápido */}
              <div
                className="flex items-center gap-4 my-4 px-4 py-3 rounded-2xl"
                style={{ backgroundColor: '#F9F9F9' }}
              >
                <div className="text-center">
                  <p className="text-lg font-black text-dark-text">{respondidas}</p>
                  <p className="text-[10px] text-subtle-text uppercase tracking-widest">confirmadas</p>
                </div>
                <div className="h-8 w-px" style={{ backgroundColor: '#EEEEEE' }} />
                <div className="text-center">
                  <p className="text-lg font-black" style={{ color: emBranco > 0 ? '#D97706' : '#059669' }}>
                    {emBranco}
                  </p>
                  <p className="text-[10px] text-subtle-text uppercase tracking-widest">em branco</p>
                </div>
                <div className="h-8 w-px" style={{ backgroundColor: '#EEEEEE' }} />
                <div className="text-center">
                  <p className="text-lg font-black text-dark-text">{totalQuestoes}</p>
                  <p className="text-[10px] text-subtle-text uppercase tracking-widest">total</p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setModalFinalizar(false)}
                  className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                  style={{ backgroundColor: '#F5F5F5', color: '#666', border: '1px solid #EEEEEE' }}
                >
                  Voltar
                </button>
                <button
                  onClick={handleFinalizarConfirmado}
                  disabled={salvando}
                  className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                  style={{ backgroundColor: '#FF4D4D', color: '#fff' }}
                >
                  {salvando ? 'Salvando...' : 'Finalizar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
