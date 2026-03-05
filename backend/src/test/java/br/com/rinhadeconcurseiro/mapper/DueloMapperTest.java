package br.com.rinhadeconcurseiro.mapper;

import br.com.rinhadeconcurseiro.dto.response.ConviteResponse;
import br.com.rinhadeconcurseiro.dto.response.DueloResponse;
import br.com.rinhadeconcurseiro.entity.ConviteDuelo;
import br.com.rinhadeconcurseiro.entity.Duelo;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.enums.StatusConvite;
import br.com.rinhadeconcurseiro.enums.StatusDuelo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("DueloMapper")
class DueloMapperTest {

    // Usamos a implementação real do UsuarioMapper — ele não tem dependências
    // externas e sua lógica de mapeamento faz parte do resultado que queremos verificar.
    private DueloMapper dueloMapper;

    private Usuario remetente;
    private Usuario destinatario;

    @BeforeEach
    void setUp() {
        // Instanciação manual — nenhum contexto Spring necessário
        dueloMapper = new DueloMapper(new UsuarioMapper());

        remetente = Usuario.builder()
                .id(1L)
                .nome("Alice")
                .email("alice@email.com")
                .googleId("google-alice")
                .apelido("alice99")
                .build();

        destinatario = Usuario.builder()
                .id(2L)
                .nome("Bruno")
                .email("bruno@email.com")
                .googleId("google-bruno")
                .apelido("bruninho")
                .build();
    }

    @Nested
    @DisplayName("toConviteResponse()")
    class ToConviteResponse {

        @Test
        @DisplayName("Deve mapear todos os campos do ConviteDuelo corretamente")
        void deveMapearTodosOsCampos() {
            // Arrange — montamos um ConviteDuelo com todos os campos preenchidos
            UUID token = UUID.randomUUID();
            LocalDateTime expiracao = LocalDateTime.now().plusMinutes(10);
            LocalDateTime criacao = LocalDateTime.now();

            ConviteDuelo convite = ConviteDuelo.builder()
                    .id(42L)
                    .token(token)
                    .remetente(remetente)
                    .destinatario(destinatario)
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(expiracao)
                    .build();

            // Forçamos o createdAt manualmente porque @CreationTimestamp
            // só é preenchido pelo Hibernate ao persistir — fora do contexto
            // JPA, o campo fica null. Precisamos setar via reflection ou
            // diretamente se o campo for acessível pelo builder/setter.
            convite.setCreatedAt(criacao);

            // Act
            ConviteResponse response = dueloMapper.toConviteResponse(convite);

            // Assert — cada campo é verificado individualmente para que,
            // em caso de falha, a mensagem de erro aponte o campo exato
            assertThat(response.id()).isEqualTo(42L);
            assertThat(response.token()).isEqualTo(token.toString());
            assertThat(response.status()).isEqualTo(StatusConvite.PENDENTE);
            assertThat(response.expiresAt()).isEqualTo(expiracao);
            assertThat(response.createdAt()).isEqualTo(criacao);

            // Verificamos os campos aninhados do remetente —
            // isso confirma que a delegação ao UsuarioMapper está funcionando
            assertThat(response.remetente()).isNotNull();
            assertThat(response.remetente().id()).isEqualTo(1L);
            assertThat(response.remetente().nome()).isEqualTo("Alice");
            assertThat(response.remetente().email()).isEqualTo("alice@email.com");
        }

        @Test
        @DisplayName("Deve converter o UUID para String corretamente")
        void deveConverterUuidParaString() {
            // Este teste isola especificamente a conversão UUID → String,
            // que é uma decisão explícita do mapper para desacoplar o DTO do tipo UUID.
            UUID token = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

            ConviteDuelo convite = ConviteDuelo.builder()
                    .id(1L)
                    .token(token)
                    .remetente(remetente)
                    .destinatario(destinatario)
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build();

            ConviteResponse response = dueloMapper.toConviteResponse(convite);

            // O DTO deve conter a representação em String, não o UUID original
            assertThat(response.token())
                    .isInstanceOf(String.class)
                    .isEqualTo("123e4567-e89b-12d3-a456-426614174000");
        }
    }

    @Nested
    @DisplayName("toDueloResponse()")
    class ToDueloResponse {

        @Test
        @DisplayName("Deve mapear todos os campos de um duelo em andamento")
        void deveMapearDueloEmAndamento() {
            // Arrange — duelo sem vencedor ainda (em andamento)
            ConviteDuelo convite = ConviteDuelo.builder()
                    .id(1L)
                    .token(UUID.randomUUID())
                    .remetente(remetente)
                    .destinatario(destinatario)
                    .status(StatusConvite.ACEITO)
                    .expiresAt(LocalDateTime.now())
                    .build();

            LocalDateTime criacao = LocalDateTime.now();

            Duelo duelo = Duelo.builder()
                    .id(10L)
                    .convite(convite)
                    .host(remetente)
                    .desafiado(destinatario)
                    .status(StatusDuelo.EM_ANDAMENTO)
                    .pontosHost(2)
                    .pontosDesafiado(1)
                    .vencedor(null)  // duelo ainda não terminou
                    .build();

            duelo.setCreatedAt(criacao);

            // Act
            DueloResponse response = dueloMapper.toDueloResponse(duelo);

            // Assert
            assertThat(response.id()).isEqualTo(10L);
            assertThat(response.status()).isEqualTo(StatusDuelo.EM_ANDAMENTO);
            assertThat(response.pontosHost()).isEqualTo(2);
            assertThat(response.pontosDesafiado()).isEqualTo(1);
            assertThat(response.createdAt()).isEqualTo(criacao);
            assertThat(response.finalizadoEm()).isNull();

            // Verificamos os participantes
            assertThat(response.host().id()).isEqualTo(1L);
            assertThat(response.desafiado().id()).isEqualTo(2L);

            // Sem vencedor — empate ou duelo em curso
            assertThat(response.vencedor()).isNull();
        }

        @Test
        @DisplayName("Deve mapear o vencedor corretamente quando o duelo é finalizado")
        void deveMapearVencedorQuandoDueloFinalizado() {
            // Este cenário é separado intencionalmente porque a lógica
            // de null-check do vencedor no mapper merece verificação própria —
            // é um if/else que tem dois caminhos possíveis, e cada caminho
            // deve ser exercitado por pelo menos um teste.
            LocalDateTime finalizadoEm = LocalDateTime.now();

            Duelo duelo = Duelo.builder()
                    .id(11L)
                    .convite(ConviteDuelo.builder()
                            .id(1L)
                            .token(UUID.randomUUID())
                            .remetente(remetente)
                            .destinatario(destinatario)
                            .status(StatusConvite.ACEITO)
                            .expiresAt(LocalDateTime.now())
                            .build())
                    .host(remetente)
                    .desafiado(destinatario)
                    .status(StatusDuelo.FINALIZADO)
                    .pontosHost(3)
                    .pontosDesafiado(1)
                    .vencedor(remetente)  // Alice venceu
                    .finalizadoEm(finalizadoEm)
                    .build();

            DueloResponse response = dueloMapper.toDueloResponse(duelo);

            assertThat(response.status()).isEqualTo(StatusDuelo.FINALIZADO);
            assertThat(response.finalizadoEm()).isEqualTo(finalizadoEm);

            // O vencedor deve estar preenchido com os dados corretos de Alice
            assertThat(response.vencedor()).isNotNull();
            assertThat(response.vencedor().id()).isEqualTo(1L);
            assertThat(response.vencedor().nome()).isEqualTo("Alice");
        }
    }
}