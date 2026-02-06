// ============================================
// USUÁRIO
// ============================================
export interface User {
  id: number;
  email: string;
  nome: string;
  fotoPerfil?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ============================================
// QUESTÃO
// ============================================
export interface Questao {
  id: number;
  textoMotivador?: string;
  comando?: string;
  textoQuestao: string;
  gabarito: boolean;
  justificativa?: string;
  materia: string;
  assunto?: string;
  ano?: number;
  banca?: string;
  orgao?: string;
  imagemUrl?: string;
  hasLatex: boolean;
}

// ============================================
// SIMULADO
// ============================================
export interface Simulado {
  id: number;
  nome: string;
  descricao?: string;
  totalQuestoes: number;
  criadoEm: string;
}

export interface SimuladoQuestao {
  id: number;
  simuladoId: number;
  questao: Questao;
  ordem: number;
}

export interface SimuladoDetalhado extends Simulado {
  questoes: SimuladoQuestao[];
}

// ============================================
// RESPOSTAS E RESULTADO (para Etapa F7)
// ============================================
export interface RespostaUsuario {
  questaoId: number;
  resposta: boolean | null; // true = Certo, false = Errado, null = Em branco
}

export interface ResultadoSimulado {
  simuladoId: number;
  totalQuestoes: number;
  acertos: number;
  erros: number;
  emBranco: number;
  pontuacao: number; // CEBRASPE: acertos - erros
  percentualAcerto: number;
}