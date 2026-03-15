package br.com.rinhadeconcurseiro.config;

import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import br.com.rinhadeconcurseiro.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("StompAuthChannelInterceptor - integração websocket")
class StompAuthChannelInterceptorTest {

    //injeta porta aleatória definida pelo springboot
    @LocalServerPort
    private int port;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private WebSocketStompClient stompClient;
    private String wsUrl;

    private Usuario usuarioTeste;
    private String tokenValido;

    @BeforeEach
    void setUp(){

        //limpar e recriar em cada cenário de teste
        usuarioRepository.deleteAll();

        usuarioTeste = usuarioRepository.save(Usuario.builder()
                .nome("Teste WebSocket")
                .email("ws@teste.com")
                .googleId("google-ws-test")
                .build());

        //token jwt real - chave ambiente teste
        tokenValido = jwtService.generateToken(
                usuarioTeste.getGoogleId(),
                usuarioTeste.getEmail(),
                usuarioTeste.getId()
        );

        //websocket nativo -> fallback http long-polling
        stompClient = new WebSocketStompClient(
                new SockJsClient(List.of(new WebSocketTransport(new StandardWebSocketClient())))
        );

        //conversor de msg usa mesmo tipo do servidor: JSON
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());

        wsUrl = "http://localhost:" + port + "/ws";
    }

    @Test
    @DisplayName("Deve aceitar conexão quando o token JWO é válido")
    void deveAceitarConexaoComTokenValido() throws Exception {

        //aguarda conexao de forma bloqueante com timeout
        CompletableFuture<Boolean> conexaoEstabelecida = new CompletableFuture<>();

        StompHeaders headers = new StompHeaders();
        headers.add("Authorization", "Bearer " + tokenValido);

        stompClient.connectAsync(wsUrl, new WebSocketHttpHeaders(), headers,
                new StompSessionHandlerAdapter() {

                    @Override
                    public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                        //chamado se conexao aceita com sucesso
                        conexaoEstabelecida.complete(true);
                        session.disconnect();
                    }

                    @Override
                    public void handleTransportError(StompSession session, Throwable exception) {
                        //erro de transporte conexao falhou
                        conexaoEstabelecida.completeExceptionally(exception);
                    }
                });

        //aguardar 5 sec -> TimeoutException
        Boolean resultado = conexaoEstabelecida.get(5, TimeUnit.SECONDS);
        assertThat(resultado).isTrue();
    }

    @Test
    @DisplayName("Deve rejeitar conexão quando o header Authorization está ausente")
    void deveRejeitarConexaoSemToken() {
        CompletableFuture<Throwable> erroRecebido = new CompletableFuture<>();

        // Conectamos sem nenhum header de autorização —
        // o interceptador deve rejeitar no CONNECT.
        stompClient.connectAsync(wsUrl, new WebSocketHttpHeaders(), new StompHeaders(),
                new StompSessionHandlerAdapter() {

                    @Override
                    public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                        // Se chegarmos aqui, o servidor aceitou uma conexão sem token —
                        // isso seria uma falha de segurança grave. Completamos com null
                        // para indicar que o erro esperado não ocorreu.
                        erroRecebido.complete(null);
                        session.disconnect();
                    }

                    @Override
                    public void handleTransportError(StompSession session, Throwable exception) {
                        // Este é o caminho esperado — a conexão foi rejeitada.
                        erroRecebido.complete(exception);
                    }
                });

        try {
            Throwable erro = erroRecebido.get(5, TimeUnit.SECONDS);
            // O erro deve ter ocorrido — conexão sem token não deve ser aceita.
            assertThat(erro).isNotNull();
        } catch (TimeoutException e) {
            // Timeout também indica problema: o servidor não respondeu,
            // o que é diferente de rejeitar ativamente a conexão.
            throw new AssertionError("Servidor não respondeu à conexão sem token em 5 segundos.", e);
        } catch (ExecutionException | InterruptedException e) {
            throw new AssertionError("Erro inesperado ao aguardar resposta do servidor.", e);
        }
    }

    @Test
    @DisplayName("Deve rejeitar conexão quando o token JWT é inválido")
    void deveRejeitarConexaoComTokenInvalido() {
        CompletableFuture<Throwable> erroRecebido = new CompletableFuture<>();

        StompHeaders headers = new StompHeaders();
        // Um token deliberadamente malformado — não é um JWT válido.
        headers.add("Authorization", "Bearer token.invalido.assinatura");

        stompClient.connectAsync(wsUrl, new WebSocketHttpHeaders(), headers,
                new StompSessionHandlerAdapter() {

                    @Override
                    public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                        erroRecebido.complete(null);
                        session.disconnect();
                    }

                    @Override
                    public void handleTransportError(StompSession session, Throwable exception) {
                        erroRecebido.complete(exception);
                    }
                });

        try {
            Throwable erro = erroRecebido.get(5, TimeUnit.SECONDS);
            assertThat(erro).isNotNull();
        } catch (TimeoutException e) {
            throw new AssertionError("Servidor não respondeu à conexão com token inválido.", e);
        } catch (ExecutionException | InterruptedException e) {
            throw new AssertionError("Erro inesperado ao aguardar resposta do servidor.", e);
        }
    }



}
