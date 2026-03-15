import api from './api';

export interface MateriaOption {
  id: number;
  nome: string;
  totalQuestoes: number;
}

export interface AssuntoOption {
  id: number;
  nome: string;
  totalQuestoes: number;
}

export async function getMaterias(): Promise<MateriaOption[]> {
  const { data } = await api.get('/api/v1/materias');
  return data;
}

export async function getAssuntosPorMateria(materiaId: number): Promise<AssuntoOption[]> {
  const { data } = await api.get(`/api/v1/materias/${materiaId}/assuntos`);
  return data;
}