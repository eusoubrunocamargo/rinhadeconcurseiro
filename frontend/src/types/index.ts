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