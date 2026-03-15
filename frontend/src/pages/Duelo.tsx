// src/pages/Duelo.tsx
import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import {
  enviarConvite,
  listarConvitesPendentes,
  aceitarConvite,
  listarMeusDuelos,
} from '../services/duelo';
import type { ConviteResponse, DueloResponse } from '../types';
import DueloModal from '../components/duelo/DueloModal';
import { Link } from 'react-router-dom';

export default function Duelo() {
  const { user } = useAuth();
  // const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [feedbackEnvio, setFeedbackEnvio] = useState<{
    tipo: 'sucesso' | 'erro';
    mensagem: string;
  } | null>(null);

  const [convitesPendentes, setConvitesPendentes] = useState<ConviteResponse[]>([]);
  const [duelosAtivos, setDuelosAtivos] = useState<DueloResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalDueloId, setModalDueloId] = useState<number | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      const [convites, duelos] = await Promise.all([
        listarConvitesPendentes(),
        listarMeusDuelos(),
      ]);
      setConvitesPendentes(convites);
      setDuelosAtivos(duelos.filter(d => d.status !== 'FINALIZADO' && d.status !== 'CANCELADO'));
    } catch {
      // silencioso — a tela mostra vazio em vez de erro
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function handleEnviarConvite() {
    if (!email.trim()) return;
    setEnviando(true);
    setFeedbackEnvio(null);
    try {
      await enviarConvite(email.trim());
      setFeedbackEnvio({ tipo: 'sucesso', mensagem: 'Convite enviado com sucesso!' });
      setEmail('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Não foi possível enviar o convite.';
      setFeedbackEnvio({ tipo: 'erro', mensagem: msg });
    } finally {
      setEnviando(false);
    }
  }

  async function handleAceitarConvite(token: string) {
    try {
      const duelo = await aceitarConvite(token);
      setModalDueloId(duelo.id);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao aceitar convite.');
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Cabeçalho */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: '#999' }}>
            Modo Competitivo
          </p>
          <h1 className="text-3xl font-black text-dark-text tracking-tight leading-none">
            Duelos<span style={{ color: '#FF4D4D' }}>.</span>
          </h1>
          <p className="text-sm mt-1.5" style={{ color: '#999' }}>
            Desafie um colega e teste seus conhecimentos em tempo real.
          </p>
          {/* No bloco do cabeçalho, após o <p> de descrição: */}
            <div className="flex items-center justify-between">
              <p className="text-sm mt-1.5" style={{ color: '#999' }}>...</p>
              <Link
                to="/duelo/historico"
                className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70"
                style={{ color: '#999' }}
              >
                Ver histórico →
              </Link>
            </div>
        </div>

        {/* Card — Enviar convite */}
        <div className="bg-white rounded-[28px] p-6"
          style={{ border: '1px solid #E5E5E5' }}>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#FFF0F0', border: '1px solid #FFD5D5' }}>
              <span className="material-symbols-outlined"
                style={{ fontSize: '20px', color: '#FF4D4D' }}>
                swords
              </span>
            </div>
            <div>
              <h2 className="text-sm font-black text-dark-text uppercase tracking-wide">
                Novo Duelo
              </h2>
              <p className="text-xs" style={{ color: '#999' }}>
                Informe o e-mail do seu oponente
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEnviarConvite()}
              placeholder="email@exemplo.com"
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
              style={{
                border: '1.5px solid #E5E5E5',
                color: '#1A1A1A',
                backgroundColor: '#FAFAFA',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#FF4D4D'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E5E5E5'; }}
            />
            <button
              onClick={handleEnviarConvite}
              disabled={enviando || !email.trim()}
              className="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FF4D4D', color: '#fff' }}
            >
              {enviando ? 'Enviando...' : 'Desafiar'}
            </button>
          </div>

          {feedbackEnvio && (
            <p className="text-xs font-bold mt-3"
              style={{ color: feedbackEnvio.tipo === 'sucesso' ? '#059669' : '#DC2626' }}>
              {feedbackEnvio.mensagem}
            </p>
          )}
        </div>

        {/* Card — Convites recebidos */}
        {!loading && convitesPendentes.length > 0 && (
          <div className="bg-white rounded-[28px] p-6"
            style={{ border: '1px solid #E5E5E5' }}>

            <h2 className="text-xs font-black uppercase tracking-widest mb-4"
              style={{ color: '#999' }}>
              Convites Recebidos
            </h2>

            <div className="flex flex-col gap-3">
              {convitesPendentes.map(convite => (
                <div key={convite.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl"
                  style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#F0F0F0' }}>
                      <span className="text-xs font-black" style={{ color: '#666' }}>
                        {convite.remetente.nome[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-dark-text truncate">
                        {convite.remetente.nome}
                      </p>
                      <p className="text-xs truncate" style={{ color: '#999' }}>
                        {convite.remetente.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAceitarConvite(convite.token)}
                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shrink-0 transition-all"
                    style={{ backgroundColor: '#FF4D4D', color: '#fff' }}>
                    Aceitar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card — Duelos em andamento */}
        {!loading && duelosAtivos.length > 0 && (
          <div className="bg-white rounded-[28px] p-6"
            style={{ border: '1px solid #E5E5E5' }}>

            <h2 className="text-xs font-black uppercase tracking-widest mb-4"
              style={{ color: '#999' }}>
              Em Andamento
            </h2>

            <div className="flex flex-col gap-3">
              {duelosAtivos.map(duelo => {
                const euSouHost = duelo.host.id === user?.id;
                const oponente = euSouHost ? duelo.desafiado : duelo.host;
                // const destino = duelo.status === 'CONFIGURANDO'
                //   ? `/duelo/configurar/${duelo.id}`
                //   : `/duelo/live/${duelo.id}`;

                return (
                  <button
                    key={duelo.id}
                    onClick={() => setModalDueloId(duelo.id)}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl w-full text-left transition-all"
                    style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#FF4D4D';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#F0F0F0';
                    }}>

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#F0F0F0' }}>
                        <span className="text-xs font-black" style={{ color: '#666' }}>
                          {oponente.nome[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-dark-text truncate">
                          vs {oponente.nome}
                        </p>
                        <p className="text-xs" style={{
                          color: duelo.status === 'EM_ANDAMENTO' ? '#FF4D4D' : '#999'
                        }}>
                          {duelo.status === 'EM_ANDAMENTO' ? 'Em andamento' : 'Aguardando configuração'}
                        </p>
                      </div>
                    </div>

                    <span className="material-symbols-outlined shrink-0"
                      style={{ fontSize: '18px', color: '#CCC' }}>
                      chevron_right
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!loading && convitesPendentes.length === 0 && duelosAtivos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-3xl flex items-center justify-center"
              style={{ backgroundColor: '#F5F5F5' }}>
              <span className="material-symbols-outlined"
                style={{ fontSize: '28px', color: '#CCC' }}>
                swords
              </span>
            </div>
            <p className="text-sm font-bold" style={{ color: '#999' }}>
              Nenhum duelo ativo
            </p>
            <p className="text-xs text-center max-w-xs" style={{ color: '#BBB' }}>
              Desafie um colega pelo e-mail acima para começar.
            </p>
          </div>
        )}

      </div>

      {/* Modal do duelo */}
      {modalDueloId && (
        <DueloModal
          dueloId={modalDueloId}
          onClose={() => { setModalDueloId(null); carregarDados(); }}
        />
      )}
    </Layout>
  );
}
