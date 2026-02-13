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