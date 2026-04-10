export type StatusMundo = 'ativo' | 'bloqueado' | 'concluido';
export type StatusFase  = 'concluida' | 'andamento' | 'bloqueada';
export type BlocoFase   = 'PRATICA' | 'DESAFIO';
export type TipoExercicio = 'A' | 'B' | 'C' | 'D';
export type PontoRetomada =
  | 'BLOCO_1'
  | 'RODADA_1'
  | 'RODADA_2'
  | 'RODADA_3'
  | 'DESAFIO'
  | 'CONCLUIDA';
export type ResultadoCheckpoint =
  | 'APROVADO'
  | 'REPROVADO_PRATICA'
  | 'REPROVADO_DESAFIO_RETRY'
  | 'REPROVADO_MUNDO_ZERADO';

export interface OpcaoDto {
  id: string;
  texto: string;
}

export interface Mundo {
  id: number;
  numero: number;
  nome: string;
  descricao: string;
  materia: string;
  totalFases: number;
  desbloqueado: boolean;
  fasesConcluidasCount?: number;
}

export interface Fase {
  id: number;
  numero: number;
  nome: string;
  ordemNoMundo: number;
  etapa: PontoRetomada;
  desbloqueada: boolean;
}

export interface Exercicio {
  id: number;
  bloco: BlocoFase;
  rodada?: number;
  ordemNaRodada: number;
  tipo: TipoExercicio;
  enunciado: string;
  fraseContexto?: string;
  palavraAlvo?: string;
  opcoes?: OpcaoDto[];
  nivel: string;
}

export interface QuestaoClassificada {
  id: number;
  questaoExternaId: string;
  bloco: BlocoFase;
  classificadoPor: string;
}

export interface SessaoFaseDto {
  faseId: number;
  faseNome: string;
  etapa: PontoRetomada;
  conteudoIntroducaoHtml?: string;
  exercicios?: Exercicio[];
  questoes?: QuestaoClassificada[];
  tentativasDesafioConsumidas?: number;
}

export interface FeedbackResposta {
  correto: boolean;
  gabarito: string;
  explicacao: string;
}

export interface CheckpointResultado {
  resultado: ResultadoCheckpoint;
  acertos: number;
  total: number;
  mensagem: string;
}