package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.websocket.EventoDueloMessage;
import br.com.rinhadeconcurseiro.dto.websocket.RespostaDueloMessage;
import br.com.rinhadeconcurseiro.entity.*;
import br.com.rinhadeconcurseiro.enums.EventoDueloTipo;
import br.com.rinhadeconcurseiro.enums.RespostaTipo;
import br.com.rinhadeconcurseiro.enums.StatusDuelo;
import br.com.rinhadeconcurseiro.exception.DueloException;
import br.com.rinhadeconcurseiro.mapper.DueloMapper;
import br.com.rinhadeconcurseiro.repository.DueloQuestaoRepository;
import br.com.rinhadeconcurseiro.repository.DueloRepository;
import br.com.rinhadeconcurseiro.repository.DueloRespostaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DueloGameService")
class DueloGameServiceTest {

    @Mock private DueloRepository dueloRepository;
    @Mock private DueloQuestaoRepository dueloQuestaoRepository;
    @Mock private DueloRespostaRepository dueloRespostaRepository;
    @Mock private ThreadPoolTaskScheduler taskScheduler;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private DueloMapper dueloMapper;

    @InjectMocks
    private DueloGameService dueloGameService;

    // Fixtures reutilizadas em todos os grupos de teste
    private Usuario host;
    private Usuario desafiado;
    private Duelo dueloEmAndamento;
    private DueloQuestao questao1;
    private DueloQuestao questao2;

    @BeforeEach
    void setUp() {
        host = Usuario.builder()
                .id(1L).nome("Alice").email("alice@email.com").googleId("g-alice")
                .build();

        desafiado = Usuario.builder()
                .id(2L).nome("Bruno").email("bruno@email.com").googleId("g-bruno")
                .build();

        dueloEmAndamento = Duelo.builder()
                .id(10L)
                .host(host)
                .desafiado(desafiado)
                .status(StatusDuelo.EM_ANDAMENTO)
                .totalQuestoes(2)
                .pontosHost(0)
                .pontosDesafiado(0)
                .build();

        // Questão 1 — ainda não resolvida
        questao1 = DueloQuestao.builder()
                .id(100L)
                .duelo(dueloEmAndamento)
                .questao(Questao.builder()
                        .id(1L)
                        .enunciado("Enunciado 1")
                        .gabarito(RespostaTipo.CERTO)
                        .build())
                .ordem(1)
                .resolvida(false)
                .build();

        // Questão 2 — será a "próxima" nos cenários de não finalização
        questao2 = DueloQuestao.builder()
                .id(101L)
                .duelo(dueloEmAndamento)
                .questao(Questao.builder()
                        .id(2L)
                        .enunciado("Enunciado 2")
                        .gabarito(RespostaTipo.ERRADO)
                        .build())
                .ordem(2)
                .resolvida(false)
                .build();
    }

    // =========================================================================
    // responder()
    // =========================================================================
    // Testamos aqui apenas até o ponto de decisão "um respondeu / dois responderam".
    // O que acontece após os dois responderem (a resolução em si) é
    // responsabilidade de resolverQuestao() e tem seu próprio grupo de testes.
    // =========================================================================

    @Nested
    @DisplayName("responder()")
    class Responder {

        @Test
        @DisplayName("Deve publicar OPONENTE_RESPONDEU quando apenas o primeiro jogador responde")
        void devePublicarOponenteRespondeuQuandoPrimeiroJogadorResponde() {
            RespostaDueloMessage message = new RespostaDueloMessage(100L, "CERTO");

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmAndamento));
            when(dueloQuestaoRepository.findById(100L)).thenReturn(Optional.of(questao1));
            when(dueloRespostaRepository.existsByDueloQuestaoIdAndUsuarioId(100L, 1L))
                    .thenReturn(false);
            // Apenas 1 resposta persistida até agora — o host acabou de responder
            when(dueloRespostaRepository.findByDueloQuestaoId(100L))
                    .thenReturn(List.of(
                            DueloResposta.builder().usuario(host).resposta("CERTO").build()
                    ));

            dueloGameService.responder(10L, host, message);

            // Verificamos que o broadcast correto foi enviado
            ArgumentCaptor<EventoDueloMessage> captor =
                    ArgumentCaptor.forClass(EventoDueloMessage.class);
            verify(messagingTemplate).convertAndSend(eq("/topic/duelo/10"), captor.capture());

            assertThat(captor.getValue().evento()).isEqualTo(EventoDueloTipo.OPONENTE_RESPONDEU);
            assertThat(captor.getValue().dueloQuestaoId()).isEqualTo(100L);

            // A resolução NÃO deve ser agendada — ainda falta a resposta do oponente
            verifyNoInteractions(taskScheduler);
        }

        @Test
        @DisplayName("Deve agendar a resolução quando o segundo jogador responde")
        void deveAgendarResolucaoQuandoSegundoJogadorResponde() {
            RespostaDueloMessage message = new RespostaDueloMessage(100L, "ERRADO");

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmAndamento));
            when(dueloQuestaoRepository.findById(100L)).thenReturn(Optional.of(questao1));
            when(dueloRespostaRepository.existsByDueloQuestaoIdAndUsuarioId(100L, 2L))
                    .thenReturn(false);
            // Dois jogadores já responderam — host e desafiado
            when(dueloRespostaRepository.findByDueloQuestaoId(100L))
                    .thenReturn(List.of(
                            DueloResposta.builder().usuario(host).resposta("CERTO").build(),
                            DueloResposta.builder().usuario(desafiado).resposta("ERRADO").build()
                    ));

            dueloGameService.responder(10L, desafiado, message);

            // O scheduler deve ser chamado — verificamos que foi agendada
            // uma tarefa, sem nos preocupar com o Instant exato.
            verify(taskScheduler).schedule(any(Runnable.class), any(java.time.Instant.class));

            // O broadcast de OPONENTE_RESPONDEU NÃO deve acontecer aqui —
            // com dois jogadores, vamos direto para a resolução agendada.
            verifyNoInteractions(messagingTemplate);
        }

        @Test
        @DisplayName("Deve ignorar silenciosamente quando a questão já foi resolvida")
        void deveIgnorarQuandoQuestaoJaResolvida() {
            RespostaDueloMessage message = new RespostaDueloMessage(100L, "CERTO");

            DueloQuestao questaoJaResolvida = DueloQuestao.builder()
                    .id(100L)
                    .duelo(dueloEmAndamento)
                    .ordem(1)
                    .resolvida(true) // já processada
                    .build();

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmAndamento));
            when(dueloQuestaoRepository.findById(100L)).thenReturn(Optional.of(questaoJaResolvida));

            // Deve retornar sem lançar exceção e sem efeitos colaterais
            dueloGameService.responder(10L, host, message);

            verifyNoInteractions(dueloRespostaRepository, taskScheduler, messagingTemplate);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o duelo não está EM_ANDAMENTO")
        void deveLancarExcecaoQuandoDueloNaoEstaEmAndamento() {
            RespostaDueloMessage message = new RespostaDueloMessage(100L, "CERTO");

            Duelo dueloFinalizado = Duelo.builder()
                    .id(10L).host(host).desafiado(desafiado)
                    .status(StatusDuelo.FINALIZADO)
                    .build();

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloFinalizado));

            assertThatThrownBy(() -> dueloGameService.responder(10L, host, message))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("andamento");

            verifyNoInteractions(dueloQuestaoRepository, dueloRespostaRepository,
                    taskScheduler, messagingTemplate);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o solicitante não é participante do duelo")
        void deveLancarExcecaoQuandoSolicitanteNaoEParticipante() {
            RespostaDueloMessage message = new RespostaDueloMessage(100L, "CERTO");

            Usuario intruso = Usuario.builder().id(99L).nome("Intruso").build();

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmAndamento));

            assertThatThrownBy(() -> dueloGameService.responder(10L, intruso, message))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("participante");

            verifyNoInteractions(dueloQuestaoRepository, dueloRespostaRepository);
        }

        @Test
        @DisplayName("Deve lançar exceção quando a questão pertence a outro duelo")
        void deveLancarExcecaoQuandoQuestaoPertenceAOutroDuelo() {
            RespostaDueloMessage message = new RespostaDueloMessage(100L, "CERTO");

            // Questão vinculada ao duelo 99, não ao duelo 10
            Duelo outroDuelo = Duelo.builder().id(99L).build();
            DueloQuestao questaoDeOutroDuelo = DueloQuestao.builder()
                    .id(100L).duelo(outroDuelo).ordem(1).resolvida(false)
                    .build();

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmAndamento));
            when(dueloQuestaoRepository.findById(100L))
                    .thenReturn(Optional.of(questaoDeOutroDuelo));

            assertThatThrownBy(() -> dueloGameService.responder(10L, host, message))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("pertence");
        }

        @Test
        @DisplayName("Deve lançar exceção quando o jogador já respondeu esta questão")
        void deveLancarExcecaoQuandoJogadorJaRespondeu() {
            RespostaDueloMessage message = new RespostaDueloMessage(100L, "CERTO");

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmAndamento));
            when(dueloQuestaoRepository.findById(100L)).thenReturn(Optional.of(questao1));
            // Simula que o host já tinha respondido esta questão anteriormente
            when(dueloRespostaRepository.existsByDueloQuestaoIdAndUsuarioId(100L, 1L))
                    .thenReturn(true);

            assertThatThrownBy(() -> dueloGameService.responder(10L, host, message))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("já respondeu");

            verify(dueloRespostaRepository, never()).save(any());
        }
    }

    // =========================================================================
    // resolverQuestao()
    // =========================================================================
    // Chamamos este método diretamente, como se fôssemos a thread do scheduler.
    // Isso torna os testes síncronos e determínistas — sem precisar de timeouts
    // ou CountDownLatch para aguardar execução assíncrona.
    // =========================================================================

    @Nested
    @DisplayName("resolverQuestao()")
    class ResolverQuestao {

        @Test
        @DisplayName("Deve descartar silenciosamente quando outra thread já resolveu a questão")
        void deveDescartarQuandoOutraThreadJaResolveu() {
            // marcarComoResolvida retorna 0 — o ‘UPDATE’ não afetou nenhuma linha
            // porque outra thread chegou primeiro e já mudou resolvida para true.
            when(dueloQuestaoRepository.marcarComoResolvida(100L)).thenReturn(0);

            dueloGameService.resolverQuestao(10L, 100L);

            // Nenhuma operação adicional deve acontecer — descarte total.
            verify(dueloQuestaoRepository, never()).findById(any());
            verifyNoInteractions(dueloRepository, dueloRespostaRepository, messagingTemplate);
        }

        @Test
        @DisplayName("Deve publicar QUESTAO_RESOLVIDA com a próxima questão quando não é a última")
        void devePublicarQuestaoResolvidaComProximaQuestao() {
            // Arrange — duelo com 2 questões, resolvendo a questão 1.
            // A questão 2 deve aparecer no broadcast como próxima.
            when(dueloQuestaoRepository.marcarComoResolvida(100L)).thenReturn(1);
            when(dueloQuestaoRepository.findById(100L)).thenReturn(Optional.of(questao1));
            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmAndamento));

            DueloResposta respostaHost = DueloResposta.builder()
                    .usuario(host).resposta("CERTO").build();     // acertou
            DueloResposta respostaDesafiado = DueloResposta.builder()
                    .usuario(desafiado).resposta("ERRADO").build(); // errou

            when(dueloRespostaRepository.findByDueloQuestaoId(100L))
                    .thenReturn(List.of(respostaHost, respostaDesafiado));

            // O service busca TODAS as questões do duelo para encontrar a próxima
            when(dueloQuestaoRepository.findByDueloIdOrderByOrdem(10L))
                    .thenReturn(List.of(questao1, questao2));

            when(dueloRepository.save(any())).thenReturn(dueloEmAndamento);

            // Act
            dueloGameService.resolverQuestao(10L, 100L);

            // Assert — verificamos o conteúdo do broadcast
            ArgumentCaptor<EventoDueloMessage> captor =
                    ArgumentCaptor.forClass(EventoDueloMessage.class);
            verify(messagingTemplate).convertAndSend(eq("/topic/duelo/10"), captor.capture());

            EventoDueloMessage mensagem = captor.getValue();
            assertThat(mensagem.evento()).isEqualTo(EventoDueloTipo.QUESTAO_RESOLVIDA);
            assertThat(mensagem.hostAcertou()).isTrue();
            assertThat(mensagem.desafiadoAcertou()).isFalse();
            // A próxima questão deve estar indicada no broadcast
            assertThat(mensagem.proximaDueloQuestaoId()).isEqualTo(101L);
            assertThat(mensagem.proximaOrdem()).isEqualTo(2);
            // Placar: host 1, desafiado 0
            assertThat(mensagem.pontosHost()).isEqualTo(1);
            assertThat(mensagem.pontosDesafiado()).isEqualTo(0);
        }

        @Test
        @DisplayName("Deve finalizar o duelo com o host como vencedor na última questão")
        void deveFinalizarDueloComHostVencedor() {
            // Duelo já tem placar 1x0 — a última questão vai definir 2x0
            Duelo dueloQuaseAcabando = Duelo.builder()
                    .id(10L).host(host).desafiado(desafiado)
                    .status(StatusDuelo.EM_ANDAMENTO)
                    .totalQuestoes(2).pontosHost(1).pontosDesafiado(0)
                    .build();

            when(dueloQuestaoRepository.marcarComoResolvida(101L)).thenReturn(1);
            when(dueloQuestaoRepository.findById(101L)).thenReturn(Optional.of(questao2));
            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloQuaseAcabando));

            // Host acerta a última, desafiado erra
            when(dueloRespostaRepository.findByDueloQuestaoId(101L))
                    .thenReturn(List.of(
                            DueloResposta.builder().usuario(host).resposta("ERRADO").build(), // gabarito é ERRADO
                            DueloResposta.builder().usuario(desafiado).resposta("CERTO").build() // errou
                    ));

            // Apenas questão 2 — é a última, sem próxima
            when(dueloQuestaoRepository.findByDueloIdOrderByOrdem(10L))
                    .thenReturn(List.of(questao1, questao2));

            when(dueloRepository.save(any())).thenReturn(dueloQuaseAcabando);

            dueloGameService.resolverQuestao(10L, 101L);

            ArgumentCaptor<EventoDueloMessage> captor =
                    ArgumentCaptor.forClass(EventoDueloMessage.class);
            verify(messagingTemplate).convertAndSend(eq("/topic/duelo/10"), captor.capture());

            EventoDueloMessage mensagem = captor.getValue();
            assertThat(mensagem.evento()).isEqualTo(EventoDueloTipo.DUELO_FINALIZADO);
            // Não deve haver próxima questão
            assertThat(mensagem.proximaDueloQuestaoId()).isNull();
            // O vencedor deve ser o host
            assertThat(mensagem.idVencedor()).isEqualTo(host.getId());
        }

        @Test
        @DisplayName("Deve finalizar o duelo com idVencedor null quando há empate")
        void deveFinalizarDueloComEmpate() {
            // Placar empatado 1x1, última questão vai empatar em 1x1
            // (host erra, desafiado erra — ninguém pontua na última)
            Duelo dueloEmpatado = Duelo.builder()
                    .id(10L).host(host).desafiado(desafiado)
                    .status(StatusDuelo.EM_ANDAMENTO)
                    .totalQuestoes(2).pontosHost(1).pontosDesafiado(1)
                    .build();

            when(dueloQuestaoRepository.marcarComoResolvida(101L)).thenReturn(1);
            when(dueloQuestaoRepository.findById(101L)).thenReturn(Optional.of(questao2));
            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmpatado));

            // Ambos erram a última questão — ninguém pontua
            when(dueloRespostaRepository.findByDueloQuestaoId(101L))
                    .thenReturn(List.of(
                            DueloResposta.builder().usuario(host).resposta("CERTO").build(),   // gabarito é ERRADO
                            DueloResposta.builder().usuario(desafiado).resposta("CERTO").build() // gabarito é ERRADO
                    ));

            when(dueloQuestaoRepository.findByDueloIdOrderByOrdem(10L))
                    .thenReturn(List.of(questao1, questao2));

            when(dueloRepository.save(any())).thenReturn(dueloEmpatado);

            dueloGameService.resolverQuestao(10L, 101L);

            ArgumentCaptor<EventoDueloMessage> captor =
                    ArgumentCaptor.forClass(EventoDueloMessage.class);
            verify(messagingTemplate).convertAndSend(eq("/topic/duelo/10"), captor.capture());

            EventoDueloMessage mensagem = captor.getValue();
            assertThat(mensagem.evento()).isEqualTo(EventoDueloTipo.DUELO_FINALIZADO);
            // Empate — vencedor deve ser null
            assertThat(mensagem.idVencedor()).isNull();
        }
    }
}
