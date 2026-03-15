import { useState, useEffect } from 'react';
import { getMaterias, getAssuntosPorMateria } from '../../../services/materia';
import { iniciarDuelo } from '../../../services/duelo';
import type { MateriaOption, AssuntoOption } from '../../../services/materia';

const MIN_Q = 10, MAX_Q = 50, STEP = 5;

interface UseConfiguracaoDueloProps {
  dueloId: number;
  onIniciado: () => void;
}

export function useConfiguracaoDuelo({ dueloId, onIniciado }: UseConfiguracaoDueloProps) {
  const [materias, setMaterias]               = useState<MateriaOption[]>([]);
  const [assuntos, setAssuntos]               = useState<AssuntoOption[]>([]);
  const [materiaId, setMateriaId]             = useState<number | null>(null);
  const [assuntoId, setAssuntoId]             = useState<number | null>(null);
  const [usarAssunto, setUsarAssunto]         = useState(false);
  const [totalQuestoes, setTotalQuestoes]     = useState(20);
  const [inputVal, setInputVal]               = useState('20');
  const [loadingAssuntos, setLoadingAssuntos] = useState(false);
  const [iniciando, setIniciando]             = useState(false);
  const [erro, setErro]                       = useState<string | null>(null);

  useEffect(() => {
    getMaterias().then(setMaterias).catch(() => {});
  }, []);

  useEffect(() => {
    if (!materiaId) { setAssuntos([]); setAssuntoId(null); return; }
    setLoadingAssuntos(true);
    setAssuntoId(null);
    getAssuntosPorMateria(materiaId)
      .then(setAssuntos)
      .finally(() => setLoadingAssuntos(false));
  }, [materiaId]);

  function clamp(v: number) {
    return Math.round(Math.min(MAX_Q, Math.max(MIN_Q, v)) / STEP) * STEP;
  }

  function handleSlider(v: number) {
    const clamped = clamp(v);
    setTotalQuestoes(clamped);
    setInputVal(String(clamped));
  }

  function handleInputBlur(raw: string) {
    const clamped = clamp(parseInt(raw, 10) || MIN_Q);
    setTotalQuestoes(clamped);
    setInputVal(String(clamped));
  }

  async function handleIniciar() {
    if (!materiaId) return;
    setIniciando(true);
    setErro(null);
    try {
      const tipoFiltro = usarAssunto && assuntoId ? 'ASSUNTO' : 'MATERIA';
      const filtroId   = usarAssunto && assuntoId ? assuntoId : materiaId;
      await iniciarDuelo(dueloId, { totalQuestoes, tipoFiltro, filtroId });
      onIniciado();
    } catch (e: any) {
      setErro(e?.response?.data?.message || 'Erro ao iniciar duelo.');
      setIniciando(false);
    }
  }

  const podeIniciar = !!materiaId && (!usarAssunto || !!assuntoId) && !iniciando;
  const sliderPct   = ((totalQuestoes - MIN_Q) / (MAX_Q - MIN_Q)) * 100;

  return {
    // dados
    materias, assuntos,
    // estado do form
    materiaId, setMateriaId,
    assuntoId, setAssuntoId,
    usarAssunto, setUsarAssunto,
    totalQuestoes, inputVal, setInputVal,
    loadingAssuntos, iniciando, erro,
    // derivados
    podeIniciar, sliderPct,
    MIN_Q, MAX_Q, STEP,
    // ações
    handleSlider, handleInputBlur, handleIniciar,
  };
}