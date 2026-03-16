package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.response.ConviteResponse;
import br.com.rinhadeconcurseiro.dto.response.DueloResponse;
import br.com.rinhadeconcurseiro.dto.response.UsuarioResponse;
import br.com.rinhadeconcurseiro.entity.ConviteDuelo;
import br.com.rinhadeconcurseiro.entity.Duelo;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.enums.StatusConvite;
import br.com.rinhadeconcurseiro.enums.StatusDuelo;
import br.com.rinhadeconcurseiro.exception.DueloException;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.DueloMapper;
import br.com.rinhadeconcurseiro.repository.ConviteDueloRepository;
import br.com.rinhadeconcurseiro.repository.DueloRepository;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ConviteService")
class ConviteServiceTest {

    @Mock private ConviteDueloRepository conviteDueloRepository;
    @Mock private DueloRepository dueloRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private DueloMapper dueloMapper;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ConviteService conviteService;

    //dois usuários que aparecem na maioria dos cenários
    private Usuario remetente;
    private Usuario destinatario;

    //objetos de resposta que o mapper retornara nos mocks
    private ConviteResponse conviteResponseMock;
    private DueloResponse dueloResponseMock;

    @BeforeEach
    void setUp(){

        remetente = Usuario.builder()
                .id(1L)
                .nome("Alice")
                .email("alice@email.com")
                .googleId("google-alice")
                .build();

        destinatario = Usuario.builder()
                .id(2L)
                .nome("Bruno")
                .email("bruno@email.com")
                .googleId("google-bruno")
                .build();

        conviteResponseMock = ConviteResponse.builder()
                .id(1L)
                .token(UUID.randomUUID().toString())
                .remetente(UsuarioResponse.builder().id(1L).nome("Alice").build())
                .status(StatusConvite.PENDENTE)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        dueloResponseMock = DueloResponse.builder()
                .id(1L)
                .status(StatusDuelo.CONFIGURANDO)
                .build();

    }

    @Nested
    @DisplayName("enviar()")
    class Enviar {

        @Test
        @DisplayName("Deve enviar convite com sucesso quando todos os dados são válidos")
        void deveEnviarConviteComSucesso(){

            when(usuarioRepository.findByEmail("bruno@email.com"))
                    .thenReturn(Optional.of(destinatario));
            when(conviteDueloRepository.existsPendenteValido(1L, 2L, StatusConvite.PENDENTE))
                    .thenReturn(false);
            when(conviteDueloRepository.save(any(ConviteDuelo.class)))
                    .thenAnswer(invocationOnMock -> {
                        ConviteDuelo salvo = invocationOnMock.getArgument(0);
                        salvo.setId(1L);
                        return salvo;
                    });
            when(dueloMapper.toConviteResponse(any(ConviteDuelo.class)))
                    .thenReturn(conviteResponseMock);

            //ACT
            ConviteResponse resultado = conviteService.enviar(remetente, "bruno@email.com");

            //ASSERT
            assertThat(resultado).isNotNull();
            assertThat(resultado.status()).isEqualTo(StatusConvite.PENDENTE);

            verify(conviteDueloRepository, times(1)).save(argThat(convite ->
                    convite.getToken() != null
                    && convite.getRemetente().getId().equals(1L)
                    && convite.getDestinatario().getId().equals(2L)));
        }

        @Test
        @DisplayName("Deve lançar DueloException quando remetente tenta se autoconvidar")
        void deveLancarExcecaoNoAutoConvite() {
            // Act & Assert — passamos o mesmo e-mail do remetente como destinatário.
            // A exceção deve ser lançada imediatamente, sem consultar o banco.
            assertThatThrownBy(() ->
                    conviteService.enviar(remetente, "alice@email.com"))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("não pode se convidar");

            // Garantia extra: se o banco foi consultado, a regra não está
            // sendo aplicada cedo o suficiente — isso seria um problema de performance
            // além de lógica, pois faríamos um roundtrip ao banco desnecessariamente.
            verifyNoInteractions(usuarioRepository, conviteDueloRepository);
        }

        @Test
        @DisplayName("Deve lançar DueloException quando destinatário não está cadastrado")
        void deveLancarExcecaoQuandoDestinatarioNaoExiste() {
            // Arrange — simulamos um e-mail que não existe na plataforma
            when(usuarioRepository.findByEmail("desconhecido@email.com"))
                    .thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() ->
                    conviteService.enviar(remetente, "desconhecido@email.com"))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("Nenhum usuário encontrado");

            // O save jamais deve ser chamado se o destinatário não existe
            verify(conviteDueloRepository, never()).save(any());
        }

        @Test
        @DisplayName("Deve lançar DueloException quando já existe convite pendente válido entre os usuários")
        void deveLancarExcecaoQuandoConvitePendenteAtivo() {
            // Arrange — destinatário existe, mas já há um convite pendente
            when(usuarioRepository.findByEmail("bruno@email.com"))
                    .thenReturn(Optional.of(destinatario));
            when(conviteDueloRepository.existsPendenteValido(1L, 2L, StatusConvite.PENDENTE))
                    .thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() ->
                    conviteService.enviar(remetente, "bruno@email.com"))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("convite pendente");

            // Um convite duplicado jamais deve ser persistido
            verify(conviteDueloRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("buscarPorToken()")
    class BuscarPorToken {

        private UUID token;
        private ConviteDuelo convite;

        @BeforeEach
        void setUpConvite() {
            // Cada teste desse grupo precisa de um convite existente.
            // Definimos um @BeforeEach local — o JUnit executa primeiro o setUp()
            // da classe pai, depois este. Os dois se complementam.
            token = UUID.randomUUID();
            convite = ConviteDuelo.builder()
                    .id(1L)
                    .token(token)
                    .remetente(remetente)
                    .destinatario(destinatario) // Bruno é o destinatário
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build();
        }

        @Test
        @DisplayName("Deve retornar o convite quando o solicitante é o destinatário correto")
        void deveRetornarConviteParaDestinatarioCorreto() {
            // Arrange
            when(conviteDueloRepository.findByToken(token))
                    .thenReturn(Optional.of(convite));
            when(dueloMapper.toConviteResponse(convite))
                    .thenReturn(conviteResponseMock);

            // Act — Bruno (destinatário) busca o convite que lhe pertence
            ConviteResponse resultado = conviteService.buscarPorToken(token, destinatario);

            // Assert
            assertThat(resultado).isNotNull();
            verify(dueloMapper, times(1)).toConviteResponse(convite);
        }

        @Test
        @DisplayName("Deve lançar DueloException quando solicitante não é o destinatário do convite")
        void deveLancarExcecaoQuandoSolicitanteNaoEDestinatario() {
            // Arrange — o token existe, mas Alice (remetente) tenta visualizá-lo.
            // O convite pertence a Bruno. Alice não deveria ter acesso.
            when(conviteDueloRepository.findByToken(token))
                    .thenReturn(Optional.of(convite));

            // Act & Assert — Alice tenta acessar o convite de Bruno
            assertThatThrownBy(() ->
                    conviteService.buscarPorToken(token, remetente))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("permissão");

            // O mapper não deve ser chamado — o acesso foi bloqueado antes
            verifyNoInteractions(dueloMapper);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException quando token não existe")
        void deveLancarExcecaoQuandoTokenNaoExiste() {
            // Arrange
            UUID tokenInexistente = UUID.randomUUID();

            // Act & Assert
            assertThatThrownBy(() ->
                    conviteService.buscarPorToken(tokenInexistente, destinatario))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("aceitar()")
    class Aceitar {

        private UUID token;
        private ConviteDuelo convite;

        @BeforeEach
        void setUpConvite() {
            token = UUID.randomUUID();
            // O convite padrão para este grupo é sempre válido —
            // cada teste que precisar de um convite inválido vai sobrescrever
            // os campos necessários localmente.
            convite = ConviteDuelo.builder()
                    .id(1L)
                    .token(token)
                    .remetente(remetente)
                    .destinatario(destinatario)
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build();
        }

        @Test
        @DisplayName("Deve aceitar convite e criar duelo com sucesso")
        void deveAceitarConviteECriarDuelo() {
            // Arrange
            when(conviteDueloRepository.findByTokenWithLock(token))
                    .thenReturn(Optional.of(convite));
            when(dueloRepository.save(any(Duelo.class)))
                    .thenAnswer(invocation -> {
                        Duelo duelo = invocation.getArgument(0);
                        duelo.setId(1L);
                        return duelo;
                    });
            when(dueloMapper.toDueloResponse(any(Duelo.class)))
                    .thenReturn(dueloResponseMock);

            // Act
            DueloResponse resultado = conviteService.aceitar(token, destinatario);

            // Assert — verificamos o resultado
            assertThat(resultado).isNotNull();
            assertThat(resultado.status()).isEqualTo(StatusDuelo.CONFIGURANDO);

            // Verificamos que o convite foi marcado como ACEITO
            assertThat(convite.getStatus()).isEqualTo(StatusConvite.ACEITO);
            assertThat(convite.getUsadoEm()).isNotNull();

            // Verificamos que o duelo criado tem os participantes corretos
            verify(dueloRepository, times(1)).save(argThat(duelo ->
                    duelo.getHost().getId().equals(1L) &&       // Alice é o host
                            duelo.getDesafiado().getId().equals(2L) &&  // Bruno é o desafiado
                            duelo.getStatus() == StatusDuelo.CONFIGURANDO
            ));
        }

        @Test
        @DisplayName("Deve lançar DueloException quando solicitante não é o destinatário")
        void deveLancarExcecaoQuandoSolicitanteNaoEDestinatario() {
            when(conviteDueloRepository.findByTokenWithLock(token))
                    .thenReturn(Optional.of(convite));

            // Alice (remetente) tenta aceitar o próprio convite que enviou
            assertThatThrownBy(() -> conviteService.aceitar(token, remetente))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("não é para você");

            // Nenhum duelo deve ter sido criado
            verifyNoInteractions(dueloRepository);
        }

        @Test
        @DisplayName("Deve lançar DueloException e marcar convite como EXPIRADO quando prazo venceu")
        void deveLancarExcecaoEMarcarConviteExpiradoQuandoPrazoVenceu() {
            // Modificamos apenas o campo expiresAt — o resto do convite é válido.
            // Isso isola exatamente a condição que queremos testar.
            convite.setExpiresAt(LocalDateTime.now().minusMinutes(1));

            when(conviteDueloRepository.findByTokenWithLock(token))
                    .thenReturn(Optional.of(convite));

            // Act & Assert
            assertThatThrownBy(() -> conviteService.aceitar(token, destinatario))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("expirou");

            // O status do convite deve ter sido atualizado para EXPIRADO no banco
            assertThat(convite.getStatus()).isEqualTo(StatusConvite.EXPIRADO);
            verify(conviteDueloRepository, times(1)).save(convite);

            // Mas nenhum duelo deve ter sido criado
            verifyNoInteractions(dueloRepository);
        }

        @Test
        @DisplayName("Deve lançar DueloException quando convite já foi utilizado anteriormente")
        void deveLancarExcecaoQuandoConviteJaFoiUtilizado() {
            // Um convite já aceito anteriormente — status mudou, prazo ainda válido
            convite.setStatus(StatusConvite.ACEITO);
            convite.setUsadoEm(LocalDateTime.now().minusMinutes(5));

            when(conviteDueloRepository.findByTokenWithLock(token))
                    .thenReturn(Optional.of(convite));

            // Act & Assert — isValido() retorna false porque status != PENDENTE
            assertThatThrownBy(() -> conviteService.aceitar(token, destinatario))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("não está mais disponível");

            verifyNoInteractions(dueloRepository);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException quando token não existe")
        void deveLancarExcecaoQuandoTokenNaoExiste() {
            UUID tokenInexistente = UUID.randomUUID();
            when(conviteDueloRepository.findByTokenWithLock(tokenInexistente))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> conviteService.aceitar(tokenInexistente, destinatario))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
