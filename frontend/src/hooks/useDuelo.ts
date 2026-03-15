// src/hooks/useDuelo.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type {
  DueloGameState,
  EventoDueloMessage,
  RespostaDueloMessage,
} from '../types';

// Estado inicial do jogo — usado tanto na inicialização quanto no reset.
// Separar como constante evita recriar o objeto a cada render.
const ESTADO_INICIAL: DueloGameState = {
  dueloQuestaoIdAtual: null,
  ordemAtual: null,
  pontosHost: 0,
  pontosDesafiado: 0,
  oponenteRespondeu: false,
  ultimoResultado: null,
  finalizado: false,
  cancelado: false,
  idVencedor: null,
  conectado: false,
  iniciado: false,
};

interface UseDueloOptions {
  dueloId: number;
  // Primeira questão já é conhecida no momento da conexão —
  // o backend a envia via REST quando o host inicia o duelo.
  // O hook recebe isso como opção para não precisar de uma
  // chamada adicional após a conexão WebSocket estar pronta.
  primeiraQuestaoId: number | null;
  primeiraOrdem: number | null;
}

interface UseDueloReturn {
  estado: DueloGameState;
  responder: (dueloQuestaoId: number, resposta: 'CERTO' | 'ERRADO' | null) => void;
}

export function useDuelo({
  dueloId,
  primeiraQuestaoId,
  primeiraOrdem,
}: UseDueloOptions): UseDueloReturn {

  const [estado, setEstado] = useState<DueloGameState>({
    ...ESTADO_INICIAL,
    // Pré-carregamos a primeira questão para que a tela do jogo
    // já mostre algo assim que o WebSocket conectar.
    dueloQuestaoIdAtual: primeiraQuestaoId,
    ordemAtual: primeiraOrdem,
  });

  // useRef para o cliente STOMP porque não queremos que uma mudança
  // na referência do cliente cause re-renders do componente.
  // O cliente é gerenciado pelo ciclo de vida do useEffect, não pelo React.
  const clientRef = useRef<Client | null>(null);

  // O dispatcher é o coração do hook — ele traduz cada tipo de evento
  // recebido do servidor em uma mutação de estado específica.
  // Usamos useCallback para estabilizar a referência e evitar que o
  // useEffect recrie a conexão a cada render.
  const processarEvento = useCallback((mensagem: EventoDueloMessage) => {
    setEstado(prev => {
      switch (mensagem.evento) {

        case 'DUELO_INICIADO':
          // O duelo começou — inicializamos o estado com a primeira questão.
          return {
            ...prev,
            iniciado: true,
            dueloQuestaoIdAtual: mensagem.dueloQuestaoId,
            ordemAtual: mensagem.ordemQuestao
          };

        case 'OPONENTE_RESPONDEU':
          // O oponente respondeu — atualizamos o feedback visual.
          // A resposta dele ainda não é revelada aqui.
          return {
            ...prev,
            oponenteRespondeu: true,
          };

        case 'QUESTAO_RESOLVIDA':
          // Ambos responderam e o servidor calculou o resultado.
          // Exibimos quem acertou e avançamos para a próxima questão.
          return {
            ...prev,
            oponenteRespondeu: false, // reseta para a próxima questão
            ultimoResultado: {
              hostAcertou: mensagem.hostAcertou ?? false,
              desafiadoAcertou: mensagem.desafiadoAcertou ?? false,
            },
            pontosHost: mensagem.pontosHost,
            pontosDesafiado: mensagem.pontosDesafiado,
            // Avançamos para a próxima questão automaticamente
            dueloQuestaoIdAtual: mensagem.proximaDueloQuestaoId,
            ordemAtual: mensagem.proximaOrdem,
          };

        case 'DUELO_FINALIZADO':
          // Última questão foi resolvida — o jogo acabou.
          return {
            ...prev,
            oponenteRespondeu: false,
            ultimoResultado: {
              hostAcertou: mensagem.hostAcertou ?? false,
              desafiadoAcertou: mensagem.desafiadoAcertou ?? false,
            },
            pontosHost: mensagem.pontosHost,
            pontosDesafiado: mensagem.pontosDesafiado,
            finalizado: true,
            idVencedor: mensagem.idVencedor,
            dueloQuestaoIdAtual: null,
            ordemAtual: null,
          };

        case 'DUELO_CANCELADO':
          // O duelo foi cancelado por um dos jogadores ou por inatividade.
          return {
            ...prev,
            cancelado: true };

        default:
          return prev;
      }
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const client = new Client({
      // O SockJS é o mesmo fallback que configuramos no servidor.
      // A factory é chamada pelo cliente STOMP internamente.
      webSocketFactory: () => new SockJS(`${apiUrl}/ws`),

      // O JWT vai no header STOMP CONNECT — exatamente onde o
      // StompAuthChannelInterceptor do backend vai procurá-lo.
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Reconexão automática após 5 segundos se a conexão cair.
      // Útil para quedas momentâneas de rede durante o jogo.
      reconnectDelay: 5000,

      onConnect: () => {
        setEstado(prev => ({ ...prev, conectado: true }));

        // Nos inscrevemos no tópico deste duelo específico.
        // Todas as mensagens publicadas em /topic/duelo/{id}
        // pelo servidor vão chegar aqui.
        client.subscribe(`/topic/duelo/${dueloId}`, (frame) => {
          const mensagem: EventoDueloMessage = JSON.parse(frame.body);
          processarEvento(mensagem);
        });
      },

      onDisconnect: () => {
        setEstado(prev => ({ ...prev, conectado: false }));
      },

      onStompError: (frame) => {
        console.error('Erro STOMP:', frame.headers['message']);
        setEstado(prev => ({ ...prev, conectado: false }));
      },
    });

    client.activate();
    clientRef.current = client;

    // Função de cleanup: desativa o cliente quando o componente
    // que usa este hook for desmontado. Isso encerra a conexão
    // WebSocket corretamente e cancela a inscrição no tópico.
    return () => {
      client.deactivate();
    };

  // O array de dependências contém apenas valores que, se mudarem,
  // justificam recriar a conexão do zero.
  }, [dueloId, processarEvento]);

  // A função de resposta é exposta para o componente, que a chama
  // quando o usuário clica em CERTO, ERRADO, ou deixa em branco.
  // Ela é estável entre renders graças ao useCallback.
  const responder = useCallback((
    dueloQuestaoId: number,
    resposta: 'CERTO' | 'ERRADO' | null
  ) => {
    if (!clientRef.current?.connected) {
      console.warn('Tentativa de resposta sem conexão WebSocket ativa.');
      return;
    }

    const mensagem: RespostaDueloMessage = { dueloQuestaoId, resposta };

    // Publicamos no destino /app/duelo/{id}/responder.
    // O prefixo /app indica ao broker que esta mensagem deve ser
    // roteada para um @MessageMapping no servidor, não para subscribers.
    clientRef.current.publish({
      destination: `/app/duelo/${dueloId}/responder`,
      body: JSON.stringify(mensagem),
    });
  }, [dueloId]);

  return { estado, responder };
}