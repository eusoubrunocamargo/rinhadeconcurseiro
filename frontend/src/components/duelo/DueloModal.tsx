import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDuelo } from '../../hooks/useDuelo';
import { buscarDuelo, buscarQuestoesDuelo, cancelarDuelo } from '../../services/duelo';
import FaseAguardando from './fases/FaseAguardando';
import FaseConfigurando from './fases/FaseConfigurando';
import FaseEmAndamento from './fases/FaseEmAndamento';
import FaseFinalizado from './fases/FaseFinalizado';
import type { DueloResponse, DueloQuestaoInfo } from '../../types';

interface Props {
  dueloId: number;
  onClose: () => void;
}

export default function DueloModal({ dueloId, onClose }: Props) {
  const { user } = useAuth();

  const [duelo, setDuelo] = useState<DueloResponse | null>(null);
  const [questoes, setQuestoes] = useState<DueloQuestaoInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [respondeuAtual, setRespondeuAtual] = useState(false);
  const [foiSegundo, setFoiSegundo] = useState(false);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  // const [oponenteRespondeuDepois, setOponenteRespondeuDepois] = useState(false);

  const { estado, responder } = useDuelo({ dueloId, primeiraQuestaoId: null, primeiraOrdem: null });

  const isHost = duelo?.host.id === user?.id;
  const oponente = duelo ? (isHost ? duelo.desafiado : duelo.host) : null;
  const nomeOponente = oponente?.apelido || oponente?.nome || 'Oponente';
  const euSouHost = duelo?.host.id === user?.id;
  const meusPontos = euSouHost ? estado.pontosHost : estado.pontosDesafiado;
  const pontosAdv = euSouHost ? estado.pontosDesafiado : estado.pontosHost;
  const euAcertei = euSouHost ? estado.ultimoResultado?.hostAcertou : estado.ultimoResultado?.desafiadoAcertou;
  const advAcertou = euSouHost ? estado.ultimoResultado?.desafiadoAcertou : estado.ultimoResultado?.hostAcertou;

  // dispara quando o evento chega - só marca se eu já havia respondido
  // useEffect(() => {
  //   if (estado.oponenteRespondeu && respondeuAtual && !foiSegundo) {
  //     setOponenteRespondeuDepois(true);
  //   }
  // }, [estado.oponenteRespondeu]);

  // reseta a marcação quando troca de questão
  useEffect(() => {
    setRespondeuAtual(false);
    setFoiSegundo(false);
    // setOponenteRespondeuDepois(false);
  }, [estado.dueloQuestaoIdAtual]);

  // ── carrega duelo ──────────────────────────────────────────────
  useEffect(() => {
    buscarDuelo(dueloId)
      .then(setDuelo)
      .finally(() => setLoading(false));
  }, [dueloId]);

  // ── recarrega duelo ao iniciar (para pegar totalQuestoes) ──────
  useEffect(() => {
    if (estado.iniciado) {
      buscarDuelo(dueloId).then(setDuelo).catch(() => { });
    }
  }, [estado.iniciado, dueloId]);

  // ── carrega questões quando o jogo começa ─────────────────────
  const carregarQuestoes = useCallback(() => {
    buscarQuestoesDuelo(dueloId).then(setQuestoes).catch(() => { });
  }, [dueloId]);

  useEffect(() => {
    const deveCarregar = (estado.iniciado || duelo?.status === 'EM_ANDAMENTO') && questoes.length === 0;
    if (deveCarregar) carregarQuestoes();
  }, [estado.iniciado, duelo?.status, questoes.length, carregarQuestoes]);

  // ── reset ao trocar de questão ────────────────────────────────
  useEffect(() => {
    setRespondeuAtual(false);
    setFoiSegundo(false);
  }, [estado.dueloQuestaoIdAtual]);

  // ── feedback entre questões ───────────────────────────────────
  useEffect(() => {
    if (estado.ultimoResultado && !estado.finalizado) {
      setMostrarFeedback(true);
      const t = setTimeout(() => setMostrarFeedback(false), 4000);
      return () => clearTimeout(t);
    }
  }, [estado.ultimoResultado, estado.finalizado]);

  // ── duelo cancelado pelo oponente ─────────────────────────────
  useEffect(() => {
    if (estado.cancelado) {
      const t = setTimeout(() => onClose(), 2500);
      return () => clearTimeout(t);
    }
  }, [estado.cancelado, onClose]);

  // ── handlers ─────────────────────────────────────────────────
  function handleResponder(resp: 'CERTO' | 'ERRADO' | null) {
    if (!estado.dueloQuestaoIdAtual || respondeuAtual) return;
    setFoiSegundo(estado.oponenteRespondeu);
    setRespondeuAtual(true);
    responder(estado.dueloQuestaoIdAtual, resp);
  }

  async function handleAbandonar() {
    try { await cancelarDuelo(dueloId); } catch { /* silencioso */ }
    finally { onClose(); }
  }

  // ── derivados ────────────────────────────────────────────────
  const jogoIniciado = estado.iniciado || duelo?.status === 'EM_ANDAMENTO';

  if (loading) return (
    <Overlay>
      <div className="bg-white w-full max-w-lg rounded-[28px] flex items-center justify-center py-24"
        style={{ border: '1px solid #E5E5E5' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#E5E5E5', borderTopColor: '#FF4D4D' }} />
      </div>
    </Overlay>
  );

  return (
    <Overlay>
      <div className="bg-white w-full max-w-lg rounded-[28px] overflow-hidden flex flex-col"
        style={{ border: '1px solid #E5E5E5', maxHeight: '90vh' }}>

        {/* Duelo cancelado pelo oponente */}
        {estado.cancelado && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FFF5F5' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#DC2626' }}>
                cancel
              </span>
            </div>
            <div className="text-center">
              <p className="text-base font-black text-dark-text mb-1">Duelo cancelado</p>
              <p className="text-sm" style={{ color: '#999' }}>{nomeOponente} encerrou o duelo.</p>
            </div>
          </div>
        )}

        {!estado.cancelado && !jogoIniciado && !estado.finalizado && isHost === false && (
          <FaseAguardando nomeOponente={nomeOponente} onCancelar={handleAbandonar} />
        )}

        {!estado.cancelado && !jogoIniciado && !estado.finalizado && isHost === true && (
          <FaseConfigurando
            dueloId={dueloId}
            nomeOponente={nomeOponente}
            onCancelar={handleAbandonar}
            onIniciado={() => { }}
          />
        )}

        {!estado.cancelado && jogoIniciado && !estado.finalizado && duelo && (
          <FaseEmAndamento
            estado={estado}
            duelo={duelo}
            questoes={questoes}
            eu={user ?? null}
            oponente={oponente}
            nomeOponente={nomeOponente}
            meusPontos={meusPontos}
            pontosOponente={pontosAdv}
            respondeuAtual={respondeuAtual}
            foiSegundo={foiSegundo}
            mostrarFeedback={mostrarFeedback}
            euAcertei={euAcertei}
            advAcertou={advAcertou}
            onResponder={handleResponder}
            onAbandonar={handleAbandonar}
            // oponenteRespondeuDepois={oponenteRespondeuDepois}
          />
        )}

        {!estado.cancelado && estado.finalizado && (
          <FaseFinalizado
            nomeOponente={nomeOponente}
            meusPontos={meusPontos}
            pontosOponente={pontosAdv}
            idVencedor={estado.idVencedor}
            meuId={user?.id}
            onFechar={onClose}
          />
        )}
      </div>
    </Overlay>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      {children}
    </div>
  );
}