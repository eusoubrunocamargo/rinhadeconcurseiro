// src/hooks/useConvites.ts
import { useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  enviarConvite,
  buscarConviteEnviado,
  listarConvitesPendentes,
  aceitarConvite,
  recusarConvite,
} from '../services/duelo';
import { useNotificacoes } from '../contexts/NotificacoesContext';
import type { ConviteResponse, DueloResponse } from '../types';

interface UseConvitesReturn {
  email: string;
  setEmail: (v: string) => void;
  enviando: boolean;
  conviteEnviado: ConviteResponse | null;
  feedbackEnvio: { tipo: 'sucesso' | 'erro'; mensagem: string } | null;
  convitesPendentes: ConviteResponse[];
  handleEnviarConvite: () => Promise<void>;
  handleAceitarConvite: (token: string) => Promise<DueloResponse | null>;
  handleRecusarConvite: (token: string) => Promise<void>;
  carregarConvites: () => Promise<void>;
}

export function useConvites(): UseConvitesReturn {
  const { setConvitesPendentes: setContadorGlobal } = useNotificacoes();

  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [conviteEnviado, setConviteEnviado] = useState<ConviteResponse | null>(null);
  const [feedbackEnvio, setFeedbackEnvio] = useState<{
    tipo: 'sucesso' | 'erro';
    mensagem: string;
  } | null>(null);
  const [convitesPendentes, setConvitesPendentes] = useState<ConviteResponse[]>([]);

  const carregarConvites = useCallback(async () => {
    const [convitesResult, enviadoResult] = await Promise.allSettled([
      listarConvitesPendentes(),
      buscarConviteEnviado(),
    ]);

    const convites = convitesResult.status === 'fulfilled' ? convitesResult.value : [];
    const enviado  = enviadoResult.status  === 'fulfilled' ? enviadoResult.value  : null;

    setConvitesPendentes(convites);
    setContadorGlobal(convites.length);
    setConviteEnviado(enviado ?? null);
  }, [setContadorGlobal]);

  // WebSocket — escuta convites recebidos em tempo real
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const client = new Client({
      webSocketFactory: () => new SockJS(`${apiUrl}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/convites', (frame) => {
          const novoConvite: ConviteResponse = JSON.parse(frame.body);
          setConvitesPendentes(prev => {
            if (prev.some(c => c.id === novoConvite.id)) return prev;
            const nova = [novoConvite, ...prev];
            setContadorGlobal(nova.length);
            return nova;
          });
        });
      },
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [setContadorGlobal]);

  async function handleEnviarConvite() {
    if (!email.trim()) return;
    setEnviando(true);
    setFeedbackEnvio(null);
    setConviteEnviado(null);
    try {
      const convite = await enviarConvite(email.trim());
      setConviteEnviado(convite);
      setEmail('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Não foi possível enviar o convite.';
      setFeedbackEnvio({ tipo: 'erro', mensagem: msg });
    } finally {
      setEnviando(false);
    }
  }

  async function handleAceitarConvite(token: string): Promise<DueloResponse | null> {
    try {
      const duelo = await aceitarConvite(token);
      setConvitesPendentes(prev => {
        const nova = prev.filter(c => c.token !== token);
        setContadorGlobal(nova.length);
        return nova;
      });
      return duelo;
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao aceitar convite.');
      return null;
    }
  }

  async function handleRecusarConvite(token: string) {
    try {
      await recusarConvite(token);
      setConvitesPendentes(prev => {
        const nova = prev.filter(c => c.token !== token);
        setContadorGlobal(nova.length);
        return nova;
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao recusar convite.');
    }
  }

  return {
    email,
    setEmail,
    enviando,
    conviteEnviado,
    feedbackEnvio,
    convitesPendentes,
    handleEnviarConvite,
    handleAceitarConvite,
    handleRecusarConvite,
    carregarConvites,
  };
}