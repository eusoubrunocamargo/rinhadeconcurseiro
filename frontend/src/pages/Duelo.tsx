// src/pages/Duelo.tsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useConvites } from '../hooks/useConvites';
import { useDueloLobby } from '../hooks/useDueloLobby';
import EnviarConviteCard from '../components/duelo/ui/EnviarConviteCard';
import ConviteEnviadoCard from '../components/duelo/ui/ConviteEnviadoCard';
import ConvitesRecebidosList from '../components/duelo/ui/ConvitesRecebidosList';
import DuelosAtivosList from '../components/duelo/ui/DuelosAtivosList';
import DueloEmptyState from '../components/duelo/ui/DueloEmptyState';
import DueloModal from '../components/duelo/DueloModal';

export default function Duelo() {
  const { user } = useAuth();
  const [modalDueloId, setModalDueloId] = useState<number | null>(null);

  const {
    email, setEmail,
    enviando,
    conviteEnviado,
    feedbackEnvio,
    convitesPendentes,
    handleEnviarConvite,
    handleAceitarConvite,
    handleRecusarConvite,
    carregarConvites,
  } = useConvites();

  const { duelosAtivos, loading, carregarDuelos } = useDueloLobby();

  const carregarTudo = useCallback(async () => {
    await Promise.allSettled([carregarConvites(), carregarDuelos()]);
  }, [carregarConvites, carregarDuelos]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  async function onAceitar(token: string) {
    const duelo = await handleAceitarConvite(token);
    if (duelo) setModalDueloId(duelo.id);
  }

  const semAtividade =
    !loading &&
    convitesPendentes.length === 0 &&
    duelosAtivos.length === 0 &&
    !conviteEnviado;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Cabeçalho */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#999' }}>
            Modo Competitivo
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-dark-text tracking-tight leading-none">
              Duelos<span style={{ color: '#FF4D4D' }}>.</span>
            </h1>
            <Link
              to="/duelo/historico"
              className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: '#999' }}
            >
              Ver histórico →
            </Link>
          </div>
          <p className="text-sm mt-1.5" style={{ color: '#999' }}>
            Desafie um colega e teste seus conhecimentos em tempo real.
          </p>
        </div>

        <EnviarConviteCard
          email={email}
          setEmail={setEmail}
          enviando={enviando}
          feedbackEnvio={feedbackEnvio}
          onEnviar={handleEnviarConvite}
        />

        {conviteEnviado && <ConviteEnviadoCard />}

        {!loading && (
          <ConvitesRecebidosList
            convites={convitesPendentes}
            onAceitar={onAceitar}
            onRecusar={handleRecusarConvite}
          />
        )}

        {!loading && (
          <DuelosAtivosList
            duelos={duelosAtivos}
            userId={user?.id}
            onSelecionar={setModalDueloId}
          />
        )}

        {semAtividade && <DueloEmptyState />}

      </div>

      {modalDueloId && (
        <DueloModal
          dueloId={modalDueloId}
          onClose={() => { setModalDueloId(null); carregarTudo(); }}
        />
      )}
    </Layout>
  );
}