import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { buscarDuelo, iniciarDuelo } from '../services/duelo';
import { getMaterias, getAssuntosPorMateria } from '../services/materia';
import type { MateriaOption, AssuntoOption } from '../services/materia';
import type { DueloResponse } from '../types';

const MIN_QUESTOES = 10;
const MAX_QUESTOES = 50;
const STEP = 5;

export default function DueloConfigurar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [duelo, setDuelo] = useState<DueloResponse | null>(null);
  const [materias, setMaterias] = useState<MateriaOption[]>([]);
  const [assuntos, setAssuntos] = useState<AssuntoOption[]>([]);

  const [materiaId, setMateriaId] = useState<number | null>(null);
  const [assuntoId, setAssuntoId] = useState<number | null>(null);
  const [usarAssunto, setUsarAssunto] = useState(false);
  const [totalQuestoes, setTotalQuestoes] = useState(20);
  const [inputVal, setInputVal] = useState('20');

  const [loadingDuelo, setLoadingDuelo] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [loadingAssuntos, setLoadingAssuntos] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // ── Carrega duelo e verifica papel ──────────────────────────────
  useEffect(() => {
    if (!id) return;
    buscarDuelo(Number(id))
      .then((d) => {
        setDuelo(d);
        // Desafiado não configura — vai direto para o live
        if (d.desafiado.id === user?.id) {
          navigate(`/duelo/live/${id}`, { replace: true });
          return;
        }
        // Duelo já iniciado
        if (d.status !== 'CONFIGURANDO') {
          navigate(`/duelo/live/${id}`, { replace: true });
        }
      })
      .catch(() => setErro('Não foi possível carregar o duelo.'))
      .finally(() => setLoadingDuelo(false));
  }, [id, user, navigate]);

  // ── Carrega matérias ────────────────────────────────────────────
  useEffect(() => {
    getMaterias()
      .then(setMaterias)
      .catch(() => setErro('Erro ao carregar matérias.'))
      .finally(() => setLoadingMaterias(false));
  }, []);

  // ── Carrega assuntos ao selecionar matéria ──────────────────────
  useEffect(() => {
    if (!materiaId) { setAssuntos([]); setAssuntoId(null); return; }
    setLoadingAssuntos(true);
    setAssuntoId(null);
    getAssuntosPorMateria(materiaId)
      .then(setAssuntos)
      .catch(() => setErro('Erro ao carregar assuntos.'))
      .finally(() => setLoadingAssuntos(false));
  }, [materiaId]);

  // ── Slider helpers ───────────────────────────────────────────────
  function clampStep(val: number): number {
    const clamped = Math.min(MAX_QUESTOES, Math.max(MIN_QUESTOES, val));
    return Math.round(clamped / STEP) * STEP;
  }

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = clampStep(Number(e.target.value));
    setTotalQuestoes(v);
    setInputVal(String(v));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputVal(e.target.value);
  }

  function handleInputBlur() {
    const parsed = parseInt(inputVal, 10);
    if (isNaN(parsed)) { setInputVal(String(totalQuestoes)); return; }
    const v = clampStep(parsed);
    setTotalQuestoes(v);
    setInputVal(String(v));
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  }

  // ── Iniciar ──────────────────────────────────────────────────────
  async function handleIniciar() {
    if (!id || !materiaId) return;
    setIniciando(true);
    setErro(null);
    try {
      const tipoFiltro = usarAssunto && assuntoId ? 'ASSUNTO' : 'MATERIA';
      const filtroId   = usarAssunto && assuntoId ? assuntoId : materiaId;
      await iniciarDuelo(Number(id), { totalQuestoes, tipoFiltro, filtroId });
      navigate(`/duelo/live/${id}`);
    } catch (err: any) {
      setErro(err?.response?.data?.message || 'Não foi possível iniciar o duelo.');
      setIniciando(false);
    }
  }

  const podeIniciar = !!materiaId && (!usarAssunto || !!assuntoId) && !iniciando;
  const sliderPct = ((totalQuestoes - MIN_QUESTOES) / (MAX_QUESTOES - MIN_QUESTOES)) * 100;

  // ── Loading / erro inicial ────────────────────────────────────────
  if (loadingDuelo || loadingMaterias) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#E5E5E5', borderTopColor: '#FF4D4D' }} />
        </div>
      </Layout>
    );
  }

  if (!duelo) {
    return (
      <Layout>
        <p className="text-sm text-center py-10" style={{ color: '#999' }}>
          Duelo não encontrado.
        </p>
      </Layout>
    );
  }

  const oponente = duelo.desafiado;

  return (
    <Layout>
      <div className="max-w-lg mx-auto flex flex-col gap-6">

        {/* ── Cabeçalho ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: '#999' }}>
            Duelo · Configuração
          </p>
          <h1 className="text-3xl font-black text-dark-text tracking-tight leading-none">
            Configurar<span style={{ color: '#FF4D4D' }}>.</span>
          </h1>
          <p className="text-sm mt-1.5" style={{ color: '#999' }}>
            vs <strong style={{ color: '#1A1A1A' }}>{oponente.nome}</strong>
          </p>
        </div>

        {/* ── Erro ── */}
        {erro && (
          <div className="px-4 py-3 rounded-2xl text-xs font-bold"
            style={{ backgroundColor: '#FFF5F5', color: '#DC2626', border: '1px solid #FECACA' }}>
            {erro}
          </div>
        )}

        {/* ── Card: Matéria ── */}
        <div className="bg-white rounded-[28px] p-6 flex flex-col gap-4"
          style={{ border: '1px solid #E5E5E5' }}>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#F5F5F5' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#1A1A1A' }}>
                library_books
              </span>
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-dark-text">Matéria</h2>
              <p className="text-[11px] mt-0.5" style={{ color: '#999' }}>Escolha a área de conhecimento</p>
            </div>
          </div>

          {/* Dropdown Matéria */}
          <select
            value={materiaId ?? ''}
            onChange={(e) => {
              setMateriaId(Number(e.target.value) || null);
              setUsarAssunto(false);
            }}
            className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-dark-text appearance-none outline-none transition-all"
            style={{ backgroundColor: '#FAFAFA', border: '1.5px solid #E5E5E5' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF4D4D'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; }}
          >
            <option value="">Selecione uma matéria...</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} ({m.totalQuestoes} questões)
              </option>
            ))}
          </select>

          {/* Toggle: filtrar por assunto */}
          {materiaId && (
            <button
              onClick={() => setUsarAssunto((v) => !v)}
              className="flex items-center gap-2.5 text-xs font-bold transition-colors self-start"
              style={{ color: usarAssunto ? '#FF4D4D' : '#999' }}
            >
              <div className="w-9 h-5 rounded-full relative transition-colors"
                style={{ backgroundColor: usarAssunto ? '#FF4D4D' : '#E5E5E5' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: usarAssunto ? '18px' : '2px' }} />
              </div>
              Filtrar por assunto específico
            </button>
          )}

          {/* Dropdown Assunto — encadeado */}
          {usarAssunto && materiaId && (
            loadingAssuntos ? (
              <div className="flex items-center gap-2 text-xs" style={{ color: '#999' }}>
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: '#E5E5E5', borderTopColor: '#999' }} />
                Carregando assuntos...
              </div>
            ) : (
              <select
                value={assuntoId ?? ''}
                onChange={(e) => setAssuntoId(Number(e.target.value) || null)}
                className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-dark-text appearance-none outline-none transition-all"
                style={{ backgroundColor: '#FAFAFA', border: '1.5px solid #E5E5E5' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF4D4D'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; }}
              >
                <option value="">Selecione um assunto...</option>
                {assuntos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} ({a.totalQuestoes} questões)
                  </option>
                ))}
              </select>
            )
          )}
        </div>

        {/* ── Card: Nº de questões ── */}
        <div className="bg-white rounded-[28px] p-6 flex flex-col gap-5"
          style={{ border: '1px solid #E5E5E5' }}>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#F5F5F5' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#1A1A1A' }}>
                  format_list_numbered
                </span>
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-dark-text">Questões</h2>
                <p className="text-[11px] mt-0.5" style={{ color: '#999' }}>Entre {MIN_QUESTOES} e {MAX_QUESTOES}</p>
              </div>
            </div>

            {/* Input manual */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={inputVal}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                min={MIN_QUESTOES}
                max={MAX_QUESTOES}
                step={STEP}
                className="w-16 text-center px-2 py-2 rounded-xl text-sm font-black outline-none transition-all"
                style={{ backgroundColor: '#FAFAFA', border: '1.5px solid #E5E5E5', color: '#1A1A1A' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF4D4D'; }}
              />
              <span className="text-xs font-bold" style={{ color: '#999' }}>questões</span>
            </div>
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-2">
            <div className="relative h-6 flex items-center">
              {/* Track */}
              <div className="absolute w-full h-2 rounded-full" style={{ backgroundColor: '#F0F0F0' }} />
              {/* Progresso */}
              <div className="absolute h-2 rounded-full" style={{ width: `${sliderPct}%`, backgroundColor: '#FF4D4D' }} />
              {/* Input range */}
              <input
                type="range"
                min={MIN_QUESTOES}
                max={MAX_QUESTOES}
                step={STEP}
                value={totalQuestoes}
                onChange={handleSlider}
                className="absolute w-full appearance-none bg-transparent cursor-pointer"
                style={{ height: '24px' }}
              />
            </div>

            {/* Marcadores */}
            <div className="flex justify-between">
              {[10, 20, 30, 40, 50].map((v) => (
                <button
                  key={v}
                  onClick={() => { setTotalQuestoes(v); setInputVal(String(v)); }}
                  className="text-[10px] font-black transition-colors"
                  style={{ color: totalQuestoes === v ? '#FF4D4D' : '#CCC' }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Botão iniciar ── */}
        <button
          onClick={handleIniciar}
          disabled={!podeIniciar}
          className="w-full py-4 rounded-[28px] text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98]"
          style={
            podeIniciar
              ? { backgroundColor: '#FF4D4D', color: '#fff' }
              : { backgroundColor: '#F0F0F0', color: '#BBB', cursor: 'not-allowed' }
          }
        >
          {iniciando ? 'Iniciando...' : 'Iniciar Duelo →'}
        </button>

        {!podeIniciar && !iniciando && (
          <p className="text-[11px] text-center" style={{ color: '#CCC' }}>
            {!materiaId
              ? 'Selecione uma matéria para continuar'
              : 'Selecione um assunto para continuar'}
          </p>
        )}

      </div>

      {/* Estilo do thumb do slider */}
      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #FF4D4D;
          border: 3px solid #fff;
          box-shadow: 0 1px 6px rgba(255,77,77,0.4);
          cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #FF4D4D;
          border: 3px solid #fff;
          box-shadow: 0 1px 6px rgba(255,77,77,0.4);
          cursor: pointer;
        }
      `}</style>
    </Layout>
  );
}