// ============================================
// USUÁRIO
// ============================================
export interface User {
  id: number;
  email: string;
  nome: string;
  apelido?: string;
  fotoUrl?: string;
  createdAt: string;
  ultimoAcesso?: string;
}

// ============================================
// SIMULADO
// ============================================
export interface Simulado {
  id: number;
  numero: number;
  titulo: string;
  dataDisponivel: string;
  totalQuestoes: number;
  questoesBasicas: number;
  questoesEspecificas: number;
}

export interface SimuladoQuestao {
  id: number;
  ordem: number;
  caderno: 'BASICO' | 'ESPECIFICO';
  questaoId: number;
  materiaNome: string;
  assuntoNome?: string;
  comando?: string;
  enunciado: string;
  imagemUrl?: string;
  gabarito: 'CERTO' | 'ERRADO';
}

export interface SimuladoDetalhado extends Simulado {
  questoes: SimuladoQuestao[];
}

// ============================================
// CONFIANÇA E CLASSIFICAÇÃO
// ============================================

export type NivelConfianca = 'CERTEZA' | 'DUVIDA' | 'CHUTE';

// ============================================
// RESPOSTAS E RESULTADO
// ============================================

export interface RespostaUsuario {
  questaoId: number;
  resposta: boolean | null;
  confianca: NivelConfianca | null;
  tipoErro?: TipoErro | null;
}

export interface ResultadoSimulado {
  simuladoId: number;
  totalQuestoes: number;
  acertos: number;
  erros: number;
  emBranco: number;
  pontuacao: number;
  percentualAcerto: number;
}

// ============================================
// ENUMS DE CLASSIFICAÇÃO
// ============================================

export type TipoErro = 'CONTEUDO' | 'INTERPRETACAO' | 'DISTRACAO';

export type TipoResultado =
  | 'ACERTO_CONSCIENTE'
  | 'ACERTO_COM_DUVIDA'
  | 'ACERTO_POR_CHUTE'
  | 'ERRO_CONTEUDO'
  | 'ERRO_INTERPRETACAO'
  | 'ERRO_DISTRACAO';

export type Caderno = 'VERMELHO' | 'AMARELO' | 'VERDE';

// ============================================
// API: TENTATIVAS
// ============================================
export interface TentativaIniciada {
  tentativaId: number;
  simuladoId: number;
  simuladoTitulo: string;
  totalQuestoes: number;
  dataInicio: string;
}

export interface TentativaResumo {
  id: number;
  simuladoId: number;
  simuladoNumero: number;
  simuladoTitulo: string;
  dataInicio: string;
  dataFim?: string;
  finalizada: boolean;
  totalQuestoes: number;
  respondidas: number;
  acertos?: number;
  erros?: number;
  emBranco?: number;
  pontuacao?: number;
  percentualAcerto?: number;
}

export interface RespostaDetalhe {
  id: number;
  simuladoQuestaoId: number;
  ordem: number;
  questaoId: number;
  materiaNome: string;
  assuntoNome?: string;
  comando?: string;
  resposta: 'CERTO' | 'ERRADO' | 'BRANCO' | null;
  confianca: NivelConfianca | null;
  tipoErro: TipoErro | null;
  gabarito: 'CERTO' | 'ERRADO';
  acertou: boolean;
  tipoResultado: TipoResultado | null;
  caderno: Caderno | null;
}

export interface TentativaDetalhe {
  id: number;
  simuladoId: number;
  simuladoNumero: number;
  simuladoTitulo: string;
  dataInicio: string;
  dataFim?: string;
  finalizada: boolean;
  totalQuestoes: number;
  acertos?: number;
  erros?: number;
  emBranco?: number;
  pontuacao?: number;
  percentualAcerto?: number;
  respostas: RespostaDetalhe[];
  totalVermelho: number;
  totalAmarelo: number;
  totalVerde: number;
}

// ============================================
// API: CADERNOS E PROGRESSO
// ============================================
export interface CadernoResumo {
  totalVermelho: number;
  totalAmarelo: number;
  totalVerde: number;
  totalQuestoes: number;
}

export interface CadernoDetalhe {
  caderno: Caderno;
  titulo: string;
  descricao: string;
  totalQuestoes: number;
  questoes: RespostaDetalhe[];
}

export interface ResumoAssunto {
  assuntoId: number;
  assuntoNome: string;
  total: number;
  acertos: number;
  erros: number;
  percentual: number;
}

export interface MeuProgresso {
  simuladosEmAndamento: number;
  simuladosFinalizados: number;
  mediaAproveitamento: number;
  cadernos: CadernoResumo;
  topAssuntos: Record<string, ResumoAssunto[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADICIONAR ao types.ts
// ─────────────────────────────────────────────────────────────────────────────

export interface EstatisticaAssunto {
  assuntoId: number;
  assuntoNome: string;
  materiaNome: string;
  total: number;
  acertos: number;
  erros: number;
  percentual: number;
  tier: 'DOMINIO' | 'ATENCAO' | 'CRITICO';
}

// ============================================
// API: REQUESTS
// ============================================
export interface RespostaRequest {
  simuladoQuestaoId: number;
  resposta: 'CERTO' | 'ERRADO' | 'BRANCO' | null;
  confianca: NivelConfianca | null;
  tipoErro?: TipoErro | null;
}

export interface SalvarRespostasRequest {
  respostas: RespostaRequest[];
}

// ============================================
// RANKING
// ============================================
export interface RankingItem {
  posicao: number;
  usuarioId: number;
  nome: string;
  apelido?: string;
  fotoUrl?: string;
  pontuacao: number;
  acertos: number;
  erros: number;
  emBranco: number;
  percentualAcerto: number;
  simuladosFinalizados: number;
  isCurrentUser: boolean;
}

export interface Ranking {
  tipo: 'SIMULADO' | 'GERAL';
  simuladoId?: number;
  simuladoTitulo?: string;
  totalParticipantes: number;
  ranking: RankingItem[];
  currentUserPosition?: RankingItem;
}

// ============================================
// DUELO
// ============================================

export type StatusConvite = 'PENDENTE' | 'ACEITO' | 'RECUSADO' | 'EXPIRADO';
export type StatusDuelo = 'CONFIGURANDO' | 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';

// O que o servidor envia de volta após criar um convite
export interface ConviteResponse {
  id: number;
  token: string;
  remetente: User;
  status: StatusConvite;
  expiresAt: string;
  createdAt: string;
}

// O que o servidor envia sobre o estado do duelo
export interface DueloResponse {
  id: number;
  status: StatusDuelo;
  host: User;
  desafiado: User;
  pontosHost: number;
  pontosDesafiado: number;
  totalQuestoes: number | null;
  vencedor: User | null;
  createdAt: string;
  finalizadoEm: string | null;
}

// Tipos de eventos que chegam via WebSocket
export type EventoDueloTipo =
  | 'DUELO_INICIADO'
  | 'OPONENTE_RESPONDEU'
  | 'QUESTAO_RESOLVIDA'
  | 'DUELO_FINALIZADO'
  | 'DUELO_CANCELADO';

//novo tipo para informacao das questoes do duelo
export interface DueloQuestaoInfo {
  dueloQuestaoId: number;
  ordem: number;
  enunciado: string;
  materiaNome: string;
  assuntoNome?: string;
}

// Payload de cada evento WebSocket vindo do servidor
export interface EventoDueloMessage {
  evento: EventoDueloTipo;
  dueloQuestaoId: number | null;
  ordemQuestao: number | null;
  hostAcertou: boolean | null;
  desafiadoAcertou: boolean | null;
  pontosHost: number;
  pontosDesafiado: number;
  idVencedor: number | null;
  proximaDueloQuestaoId: number | null;
  proximaOrdem: number | null;
}

// O que o cliente envia ao servidor para responder uma questão
export interface RespostaDueloMessage {
  dueloQuestaoId: number;
  resposta: 'CERTO' | 'ERRADO' | null; // null = em branco
}

// Estado interno do jogo mantido pelo hook useDuelo
export interface DueloGameState {
  // ID da questão atual que está sendo exibida
  dueloQuestaoIdAtual: number | null;
  ordemAtual: number | null;

  // Placar em tempo real
  pontosHost: number;
  pontosDesafiado: number;

  // Feedback visual — o oponente já respondeu a questão atual?
  oponenteRespondeu: boolean;

  // Resultado da última questão resolvida, para exibir o feedback
  ultimoResultado: {
    hostAcertou: boolean;
    desafiadoAcertou: boolean;
  } | null;

  // true quando o duelo terminou
  finalizado: boolean;
  cancelado: boolean;
  idVencedor: number | null;

  // Controle de conexão
  conectado: boolean;
  iniciado: boolean;
}