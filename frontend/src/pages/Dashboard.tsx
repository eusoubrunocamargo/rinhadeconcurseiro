import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import type { MeuProgresso, TentativaResumo } from '../types';
import { getMeuProgresso, getSimuladosEmAndamento, getSimuladosFinalizados } from '../services/tentativa';

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const [progresso, setProgresso] = useState<MeuProgresso | null>(null);
  const [emAndamento, setEmAndamento] = useState<TentativaResumo[]>([]);
  const [finalizados, setFinalizados] = useState<TentativaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.apelido || user?.nome?.split(' ')[0] || 'Concurseiro';

  const loadDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [progressoData, emAndamentoData, finalizadosData] = await Promise.all([
        getMeuProgresso(),
        getSimuladosEmAndamento(),
        getSimuladosFinalizados(),
      ]);
      setProgresso(progressoData);
      setEmAndamento(emAndamentoData);
      setFinalizados(finalizadosData.slice(0, 5));
    } catch {
      setError('Erro ao carregar dados. Tente recarregar a página.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDados();
  }, [loadDados, location.key]);

  const totalQuestoes = progresso?.cadernos.totalQuestoes ?? 0;
  const aproveitamento = progresso?.mediaAproveitamento ?? 0;
  const nivel = Math.floor(totalQuestoes / 50) + 1;
  const xpAtual = totalQuestoes % 50;
  const xpPct = Math.round((xpAtual / 50) * 100);
  const metaPct = Math.min(Math.round((aproveitamento / 70) * 100), 100);
  const metaColor = metaPct >= 100 ? '#059669' : '#FF4D4D';

  const rank =
    aproveitamento >= 85 ? { label: 'Elite',         cor: '#FF4D4D' } :
    aproveitamento >= 70 ? { label: 'Avançado',      cor: '#059669' } :
    aproveitamento >= 50 ? { label: 'Intermediário', cor: '#D97706' } :
                           { label: 'Iniciante',     cor: '#666666' };

  return (
    <Layout>

      {/* ── HERO ── */}
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-widest text-subtle-text mb-1">Bem-vindo de volta</p>
        <h1 className="text-3xl font-black text-dark-text tracking-tight leading-none">
          {firstName}<span className="text-accent">.</span>
        </h1>
        {!loading && progresso && (
          <p className="text-sm text-subtle-text mt-1.5">
            {progresso.simuladosEmAndamento > 0
              ? `Você tem ${progresso.simuladosEmAndamento} simulado${progresso.simuladosEmAndamento > 1 ? 's' : ''} em andamento.`
              : 'Pronto para começar uma nova sessão?'}
          </p>
        )}
      </div>

      {/* ── ERRO ── */}
      {error && (
        <div className="bg-red-50 p-4 rounded-2xl mb-6 flex items-center justify-between text-sm" style={{ border: '1px solid #fecaca', color: '#dc2626' }}>
          <span>{error}</span>
          <button onClick={loadDados} className="font-bold underline ml-4 cursor-pointer">Tentar novamente</button>
        </div>
      )}

      {/* ── GRID ── */}
      <div className="flex flex-col gap-5">

        {/* Coluna principal */}
        <div className="flex flex-col gap-5">

          {/* ── Widget de Gamificação ── */}
          {!loading && (
            <div
              className="bg-white rounded-[28px] shadow-minimal overflow-hidden"
              style={{ border: '1px solid #E5E5E5' }}
            >
              {/* Mobile: grid 2×2 | Desktop: linha horizontal */}
              <div className="grid grid-cols-2 sm:flex sm:items-stretch">

                {/* Nível */}
                <div
                  className="flex flex-col items-center justify-center px-6 py-5 gap-1"
                  style={{ borderRight: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5' }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#999' }}>Nível</span>
                  <span className="text-4xl font-black text-dark-text leading-none">{nivel}</span>
                </div>

                {/* Rank — aparece ao lado do Nível no mobile */}
                <div
                  className="flex flex-col items-center justify-center px-6 py-5 gap-1 sm:order-last"
                  style={{ borderLeft: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5' }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#999' }}>Rank</span>
                  <span className="text-base font-black leading-none" style={{ color: rank.cor }}>{rank.label}</span>
                </div>

                {/* XP — ocupa largura total no mobile (col-span-2), flex-1 no desktop */}
                <div
                  className="col-span-2 sm:col-span-1 flex flex-col justify-center px-6 py-5 gap-2 sm:flex-1 sm:order-2"
                  style={{ borderRight: '1px solid #E5E5E5', borderTop: '0' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#999' }}>XP</span>
                    <span className="text-[11px] font-bold text-dark-text">{xpAtual} / 50</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#F0F0F0' }}>
                    <div
                      className="h-full bg-dark-text rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(xpPct, 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px]" style={{ color: '#BBBBBB' }}>{50 - xpAtual} questões para o próx. nível</span>
                </div>

                {/* Meta 70% — ocupa largura total no mobile (col-span-2), flex-1 no desktop */}
                <div
                  className="col-span-2 sm:col-span-1 flex flex-col justify-center px-6 py-5 gap-2 sm:flex-1 sm:order-3"
                  style={{ borderTop: '1px solid #E5E5E5' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: metaColor }}>emoji_events</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#999' }}>Meta 70%</span>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: metaColor }}>{aproveitamento.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#F0F0F0' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(metaPct, 2)}%`, backgroundColor: metaColor }}
                    />
                  </div>
                  <span className="text-[10px]" style={{ color: '#BBBBBB' }}>
                    {metaPct >= 100 ? 'Meta atingida!' : `${(70 - aproveitamento).toFixed(1)}pp para a meta`}
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* Métricas */}
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-[28px] h-32 animate-pulse" style={{ backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5' }} />
              ))}
            </div>
          ) : progresso ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard value={progresso.simuladosFinalizados}   label="Finalizados"    icon="check_circle" destaque />
              <MetricCard value={progresso.simuladosEmAndamento}   label="Em andamento"   icon="pending"      />
              <MetricCard value={`${aproveitamento.toFixed(1)}%`}  label="Aproveitamento" icon="trending_up"  />
              <MetricCard value={totalQuestoes}                    label="Questões"       icon="bolt"         />
            </div>
          ) : null}

          {/* ── Cadernos de Revisão ── */}
          {!loading && progresso && progresso.cadernos.totalQuestoes > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-dark-text px-1">
                Cadernos de Revisão
              </h2>
              <CadernoCard
                to="/cadernos/vermelho"
                label="Crítico"
                descricao="Questões que você errou com certeza ou por conteúdo"
                cor="#FF4D6A"
                bgCor="#fff0f2"
                icon="cancel"
                count={progresso.cadernos.totalVermelho}
                // TODO: substituir por progresso.topAssuntos.VERMELHO quando o backend expor
                assuntos={(progresso.topAssuntos?.['VERMELHO'] ?? []).slice(0, 5).map(a => a.assuntoNome)}
              />
              <CadernoCard
                to="/cadernos/amarelo"
                label="Reforço"
                descricao="Acertos com dúvida ou por chute — revisar logo"
                cor="#D97706"
                bgCor="#fffbeb"
                icon="warning"
                count={progresso.cadernos.totalAmarelo}
                assuntos={(progresso.topAssuntos?.['AMARELO'] ?? []).slice(0, 5).map(a => a.assuntoNome)}
              />
              <CadernoCard
                to="/cadernos/verde"
                label="Domínio"
                descricao="Acertos conscientes — manter com revisão espaçada"
                cor="#059669"
                bgCor="#ecfdf5"
                icon="check_circle"
                count={progresso.cadernos.totalVerde}
                assuntos={(progresso.topAssuntos?.['VERDE'] ?? []).slice(0, 5).map(a => a.assuntoNome)}
              />
            </div>
          )}

          {/* Continuar de onde parou */}
          {!loading && emAndamento.length > 0 && (
            <div className="bg-white rounded-[28px] shadow-minimal overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
              <div className="flex items-center justify-between px-6 pt-5 pb-2">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-dark-text">Continuar de onde parou</h2>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide" style={{ backgroundColor: '#fff0f0', color: '#FF4D4D' }}>
                  {emAndamento.length} ativo{emAndamento.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="px-4 pb-4 flex flex-col gap-2 mt-1">
                {emAndamento.map((t) => {
                  const pct = Math.round((t.respondidas / t.totalQuestoes) * 100);
                  return (
                    <Link
                      key={t.id}
                      to={`/simulados/${t.simuladoId}`}
                      state={{ tentativaId: t.id }}
                      className="group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all"
                      style={{ backgroundColor: '#FAFAFA', border: '1px solid #EEEEEE' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#D0D0D0'; e.currentTarget.style.backgroundColor = '#F5F5F5'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#EEEEEE'; e.currentTarget.style.backgroundColor = '#FAFAFA'; }}
                    >
                      {/* Ícone play */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#fff0f0', border: '1px solid #fecaca' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#FF4D4D' }}>play_arrow</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-dark-text truncate">{t.simuladoTitulo}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden max-w-40" style={{ backgroundColor: '#EEEEEE' }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: '#FF4D4D' }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold shrink-0" style={{ color: '#999' }}>
                            {t.respondidas}/{t.totalQuestoes} questões
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black shrink-0 group-hover:translate-x-0.5 transition-transform" style={{ color: '#FF4D4D' }}>
                        {pct}% →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Atividade recente */}
          <div className="bg-white rounded-[28px] shadow-minimal overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
            <div className="px-6 pt-5 pb-2">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-dark-text">Atividade Recente</h2>
            </div>
            {loading ? (
              <div className="px-4 pb-4 flex flex-col gap-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ backgroundColor: '#F5F5F5' }} />)}
              </div>
            ) : finalizados.length > 0 ? (
              <div className="px-4 pb-4 flex flex-col gap-1.5 mt-1">
                {finalizados.map((t) => {
                  const pct = t.percentualAcerto ?? 0;
                  const [fgColor, bgColor] =
                    pct >= 70 ? ['#059669', '#ecfdf5'] :
                    pct >= 50 ? ['#D97706', '#fffbeb'] :
                                ['#DC2626', '#fef2f2'];
                  return (
                    <Link
                      key={t.id}
                      to={`/simulados/${t.simuladoId}/resultado`}
                      state={{ tentativaId: t.id }}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bgColor }}>
                        <span className="text-xs font-black" style={{ color: fgColor }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-dark-text truncate">{t.simuladoTitulo}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#999' }}>
                          {t.acertos}/{(t.acertos ?? 0) + (t.erros ?? 0)} acertos
                          {t.dataFim ? ` · ${new Date(t.dataFim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-black shrink-0" style={{ color: '#999' }}>{t.pontuacao} pts</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 pb-8 text-center">
                <p className="text-sm mb-3" style={{ color: '#999' }}>Nenhum simulado realizado ainda.</p>
                <Link to="/simulados" className="text-xs font-black text-accent uppercase tracking-widest hover:underline">Começar agora →</Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────

function MetricCard({
  value, label, icon, destaque,
}: {
  value: string | number;
  label: string;
  icon: string;
  destaque?: boolean;
}) {
  return (
    <div
      className="rounded-[28px] p-5 flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform duration-300 cursor-default"
      style={{
        backgroundColor: destaque ? '#1A1A1A' : '#ffffff',
        border: '1px solid #E5E5E5',
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: destaque ? 'rgba(255,255,255,0.1)' : '#F5F5F5',
          border: destaque ? 'none' : '1px solid #E5E5E5',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: destaque ? '#FF4D4D' : '#999999' }}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-black leading-none" style={{ color: destaque ? '#ffffff' : '#1A1A1A' }}>
          {value}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: destaque ? 'rgba(255,255,255,0.4)' : '#999999' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function CadernoCard({
  to, label, descricao, cor, bgCor, icon, count, assuntos,
}: {
  to: string;
  label: string;
  descricao: string;
  cor: string;
  bgCor: string;
  icon: string;
  count: number;
  assuntos: string[]; // TODO: virá de progresso.topAssuntos após extensão do backend
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 px-5 py-4 rounded-[28px] bg-white transition-all hover:-translate-y-0.5"
      style={{ border: '1px solid #E5E5E5' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#D0D0D0'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; }}
    >
      {/* Ícone */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: bgCor }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: cor }}>{icon}</span>
      </div>

      {/* Corpo */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-dark-text">{label}</p>
        <p className="text-[11px] mt-0.5 mb-2.5" style={{ color: '#999' }}>{descricao}</p>

        {/* Tags de assunto — mockadas até o backend expor topAssuntos */}
        <div className="flex flex-wrap gap-1.5">
          {assuntos.map(tag => (
            <span
              key={tag}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: bgCor, color: cor }}
            >
              {tag}
            </span>
          ))}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#F5F5F5', color: '#999' }}
          >
            mock
          </span>
        </div>
      </div>

      {/* Contador + seta */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xl font-black text-dark-text">{count}</span>
        <span className="text-[10px] font-bold" style={{ color: '#CCC' }}>questões</span>
        <span
          className="text-xs font-bold mt-1 group-hover:translate-x-0.5 transition-transform"
          style={{ color: '#CCC' }}
        >→</span>
      </div>
    </Link>
  );
}