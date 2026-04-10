import api from '../../services/api'; // axios instance existente
import type {
  Mundo, Fase, SessaoFaseDto,
  FeedbackResposta, CheckpointResultado,
  BlocoFase,
} from '../types/index';

export const interageApi = {

  listarMundos: (): Promise<Mundo[]> =>
    api.get('/interage/mundos').then(r => r.data),

  listarFases: (mundoId: number): Promise<Fase[]> =>
    api.get(`/interage/mundos/${mundoId}/fases`).then(r => r.data),

  iniciarSessao: (faseId: number): Promise<SessaoFaseDto> =>
    api.get(`/interage/fases/${faseId}/sessao`).then(r => r.data),

  concluirBloco1: (faseId: number): Promise<void> =>
    api.post(`/interage/fases/${faseId}/bloco1/concluir`),

  concluirRodada: (faseId: number, rodada: number): Promise<void> =>
    api.post(`/interage/fases/${faseId}/rodadas/${rodada}/concluir`),

  responder: (
    faseId: number,
    payload: {
      exercicioId?: number;
      questaoClassificadaId?: number;
      bloco: BlocoFase;
      rodada?: number;
      tentativaDesafio?: number;
      respostaDada: string;
    }
  ): Promise<FeedbackResposta> =>
    api.post(`/interage/fases/${faseId}/responder`, payload).then(r => r.data),

  checkpointPratica: (faseId: number): Promise<CheckpointResultado> =>
    api.post(`/interage/fases/${faseId}/pratica/checkpoint`).then(r => r.data),

  checkpointDesafio: (faseId: number): Promise<CheckpointResultado> =>
    api.post(`/interage/fases/${faseId}/desafio/checkpoint`).then(r => r.data),
};