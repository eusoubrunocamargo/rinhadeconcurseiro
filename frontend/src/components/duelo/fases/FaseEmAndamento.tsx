import { useState } from 'react';
import DOMPurify from 'dompurify';
import PlacarHeader from '../ui/PlacarHeader';
import BadgeEstado from '../ui/BadgeEstado';
import BotoesResposta from '../ui/BotoesResposta';
import ResultadoLinha from '../ui/ResultadoLinha';
import type { DueloGameState, DueloQuestaoInfo, DueloResponse } from '../../../types';

interface Participante {
  id: number;
  nome?: string;
  apelido?: string;
  fotoUrl?: string;
}

interface Props {
  estado: DueloGameState;
  duelo: DueloResponse;
  questoes: DueloQuestaoInfo[];
  eu: Participante | null;
  oponente: Participante | null;
  nomeOponente: string;
  meusPontos: number;
  pontosOponente: number;
  respondeuAtual: boolean;
  foiSegundo: boolean;
  mostrarFeedback: boolean;
  euAcertei: boolean | undefined;
  advAcertou: boolean | undefined;
  // oponenteRespondeuDepois: boolean;
  onResponder: (resp: 'CERTO' | 'ERRADO' | null) => void;
  onAbandonar: () => void;
}

export default function FaseEmAndamento({
  estado,
  duelo,
  questoes,
  eu,
  oponente,
  nomeOponente,
  meusPontos,
  pontosOponente,
  respondeuAtual,
  foiSegundo,
  // oponenteRespondeuDepois,
  mostrarFeedback,
  euAcertei,
  advAcertou,
  onResponder,
  onAbandonar,
}: Props) {
  const [confirmandoAbandono, setConfirmandoAbandono] = useState(false);

  const questaoAtual = questoes.find(q => q.dueloQuestaoId === estado.dueloQuestaoIdAtual);

  return (
    <>
      <PlacarHeader
        eu={eu}
        oponente={oponente}
        meusPontos={meusPontos}
        pontosOponente={pontosOponente}
      />

      {/* Badges de estado */}
      <div className="px-5 pt-3">
        <BadgeEstado
          respondeuAtual={respondeuAtual}
          foiSegundo={foiSegundo}
          oponenteRespondeu={estado.oponenteRespondeu}
          // oponenteRespondeuDepois={oponenteRespondeuDepois}
          nomeOponente={nomeOponente}
        />
      </div>

      {/* Questão */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!questaoAtual ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#E5E5E5', borderTopColor: '#FF4D4D' }} />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {estado.ordemAtual && duelo.totalQuestoes && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#1A1A1A', color: '#fff' }}>
                  Q{estado.ordemAtual}/{duelo.totalQuestoes}
                </span>
              )}
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#F5F5F5', color: '#666' }}>
                {questaoAtual.materiaNome}
              </span>
              {questaoAtual.assuntoNome && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#FFF0F0', color: '#FF4D4D' }}>
                  {questaoAtual.assuntoNome}
                </span>
              )}
            </div>

            {/* Enunciado */}
            <div
              className="text-sm leading-relaxed text-dark-text
                [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-black"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(questaoAtual.enunciado) }}
            />
          </div>
        )}
      </div>

      <BotoesResposta
        respondeuAtual={respondeuAtual}
        desabilitado={respondeuAtual || !questaoAtual}
        onResponder={(resp) => {
          if (resp === null && !respondeuAtual) {
            setConfirmandoAbandono(true);
          } else {
            onResponder(resp);
          }
        }}
      />

      {/* Feedback entre questões */}
      {mostrarFeedback && estado.ultimoResultado && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-[28px] p-7 w-full max-w-xs flex flex-col items-center gap-5"
            style={{ border: '1px solid #E5E5E5' }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>
              Questão {estado.ordemAtual}
            </p>
            <div className="flex flex-col gap-2.5 w-full">
              <ResultadoLinha nome="Você" acertou={euAcertei ?? false} />
              <ResultadoLinha nome={nomeOponente} acertou={advAcertou ?? false} />
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-dark-text leading-none">{meusPontos}</p>
                <p className="text-[10px] mt-1" style={{ color: '#999' }}>Você</p>
              </div>
              <span className="text-xl font-black" style={{ color: '#E5E5E5' }}>×</span>
              <div className="text-center">
                <p className="text-3xl font-black text-dark-text leading-none">{pontosOponente}</p>
                <p className="text-[10px] mt-1" style={{ color: '#999' }}>{nomeOponente}</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: '#CCC' }}>Próxima questão em instantes...</p>
          </div>
        </div>
      )}

      {/* Confirmação de abandono */}
      {confirmandoAbandono && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-[28px] p-6 w-full max-w-sm"
            style={{ border: '1px solid #E5E5E5' }}>
            <p className="text-base font-black text-dark-text mb-1">Cancelar o duelo?</p>
            <p className="text-sm mb-5" style={{ color: '#999' }}>
              O duelo será encerrado e não será salvo no histórico.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmandoAbandono(false)}
                className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest"
                style={{ backgroundColor: '#F5F5F5', color: '#666' }}>
                Continuar
              </button>
              <button
                onClick={onAbandonar}
                className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest"
                style={{ backgroundColor: '#FF4D4D', color: '#fff' }}>
                Cancelar Duelo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}