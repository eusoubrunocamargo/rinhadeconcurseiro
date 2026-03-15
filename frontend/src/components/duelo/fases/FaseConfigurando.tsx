import ModalHeader from '../ui/ModalHeader';
import { useConfiguracaoDuelo } from '../hooks/useConfiguracaoDuelo';

interface Props {
  dueloId: number;
  nomeOponente: string;
  onCancelar: () => void;
  onIniciado: () => void;
}

export default function FaseConfigurando({ dueloId, nomeOponente, onCancelar, onIniciado }: Props) {
  const {
    materias, assuntos,
    materiaId, setMateriaId,
    assuntoId, setAssuntoId,
    usarAssunto, setUsarAssunto,
    totalQuestoes, inputVal, setInputVal,
    loadingAssuntos, iniciando, erro,
    podeIniciar, sliderPct,
    MIN_Q, MAX_Q, STEP,
    handleSlider, handleInputBlur, handleIniciar,
  } = useConfiguracaoDuelo({ dueloId, onIniciado });

  return (
    <>
      <ModalHeader
        titulo="Configurar Duelo"
        subtitulo={`vs ${nomeOponente}`}
        onFechar={onCancelar}
      />

      <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">

        {erro && (
          <div className="px-4 py-3 rounded-2xl text-xs font-bold"
            style={{ backgroundColor: '#FFF5F5', color: '#DC2626', border: '1px solid #FECACA' }}>
            {erro}
          </div>
        )}

        {/* Matéria */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>
            Matéria
          </p>
          <select
            value={materiaId ?? ''}
            onChange={e => { setMateriaId(Number(e.target.value) || null); setUsarAssunto(false); }}
            className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-dark-text appearance-none outline-none"
            style={{ backgroundColor: '#FAFAFA', border: '1.5px solid #E5E5E5' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#FF4D4D'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E5E5E5'; }}>
            <option value="">Selecione uma matéria...</option>
            {materias.map(m => (
              <option key={m.id} value={m.id}>{m.nome} ({m.totalQuestoes} questões)</option>
            ))}
          </select>

          {materiaId && (
            <button
              onClick={() => setUsarAssunto(v => !v)}
              className="flex items-center gap-2.5 text-xs font-bold self-start"
              style={{ color: usarAssunto ? '#FF4D4D' : '#999' }}>
              <div className="w-9 h-5 rounded-full relative transition-colors shrink-0"
                style={{ backgroundColor: usarAssunto ? '#FF4D4D' : '#E5E5E5' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: usarAssunto ? '18px' : '2px' }} />
              </div>
              Filtrar por assunto específico
            </button>
          )}

          {usarAssunto && materiaId && (
            loadingAssuntos
              ? <p className="text-xs" style={{ color: '#999' }}>Carregando assuntos...</p>
              : (
                <select
                  value={assuntoId ?? ''}
                  onChange={e => setAssuntoId(Number(e.target.value) || null)}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold text-dark-text appearance-none outline-none"
                  style={{ backgroundColor: '#FAFAFA', border: '1.5px solid #E5E5E5' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#FF4D4D'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#E5E5E5'; }}>
                  <option value="">Selecione um assunto...</option>
                  {assuntos.map(a => (
                    <option key={a.id} value={a.id}>{a.nome} ({a.totalQuestoes} questões)</option>
                  ))}
                </select>
              )
          )}
        </div>

        {/* Questões */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#999' }}>
              Questões
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onBlur={() => handleInputBlur(inputVal)}
                onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                min={MIN_Q} max={MAX_Q} step={STEP}
                className="w-14 text-center px-2 py-1.5 rounded-xl text-sm font-black outline-none"
                style={{ backgroundColor: '#FAFAFA', border: '1.5px solid #E5E5E5', color: '#1A1A1A' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#FF4D4D'; }}
              />
              <span className="text-xs font-bold" style={{ color: '#999' }}>questões</span>
            </div>
          </div>

          <div className="relative h-6 flex items-center">
            <div className="absolute w-full h-2 rounded-full" style={{ backgroundColor: '#F0F0F0' }} />
            <div className="absolute h-2 rounded-full"
              style={{ width: `${sliderPct}%`, backgroundColor: '#FF4D4D' }} />
            <input
              type="range" min={MIN_Q} max={MAX_Q} step={STEP} value={totalQuestoes}
              onChange={e => handleSlider(Number(e.target.value))}
              className="absolute w-full appearance-none bg-transparent cursor-pointer"
              style={{ height: '24px' }} />
          </div>

          <div className="flex justify-between px-0.5">
            {[10, 20, 30, 40, 50].map(v => (
              <button key={v}
                onClick={() => handleSlider(v)}
                className="text-[10px] font-black transition-colors"
                style={{ color: totalQuestoes === v ? '#FF4D4D' : '#CCC' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleIniciar}
          disabled={!podeIniciar}
          className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98]"
          style={podeIniciar
            ? { backgroundColor: '#FF4D4D', color: '#fff' }
            : { backgroundColor: '#F0F0F0', color: '#BBB', cursor: 'not-allowed' }}>
          {iniciando ? 'Iniciando...' : 'Iniciar Duelo →'}
        </button>

        {!podeIniciar && !iniciando && (
          <p className="text-[11px] text-center -mt-3" style={{ color: '#CCC' }}>
            {!materiaId ? 'Selecione uma matéria para continuar' : 'Selecione um assunto para continuar'}
          </p>
        )}
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #FF4D4D; border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(255,77,77,0.4); cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #FF4D4D; border: 3px solid #fff; cursor: pointer;
        }
      `}</style>
    </>
  );
}