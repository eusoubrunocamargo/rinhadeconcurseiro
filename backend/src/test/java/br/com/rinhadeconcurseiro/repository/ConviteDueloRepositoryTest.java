package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.ConviteDuelo;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.enums.StatusConvite;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("ConviteDueloRepository")
class ConviteDueloRepositoryTest {

    @Autowired
    private ConviteDueloRepository conviteDueloRepository;

    // O TestEntityManager é uma fachada sobre o EntityManager real.
    // Usamos ele para preparar o estado do banco antes de cada teste —
    // persistir entidades de suporte que o repositório vai precisar encontrar.
    @Autowired
    private TestEntityManager entityManager;

    // Dois usuários que serão reutilizados em todos os grupos de teste.
    // São recriados antes de cada teste pelo @BeforeEach para garantir
    // isolamento total — nenhum teste depende do estado deixado por outro.
    private Usuario alice;
    private Usuario bruno;

    @BeforeEach
    void setUp() {
        // O campo google_id é NOT NULL e UNIQUE na entidade.
        // Usamos valores fixos e distintos para evitar violação de constraint
        // entre os dois usuários.
        alice = entityManager.persist(Usuario.builder()
                .nome("Alice")
                .email("alice@email.com")
                .googleId("google-alice")
                .build());

        bruno = entityManager.persist(Usuario.builder()
                .nome("Bruno")
                .email("bruno@email.com")
                .googleId("google-bruno")
                .build());

        // O flush garante que os INSERTs são enviados ao banco H2 agora,
        // antes de qualquer query do repositório ser executada no teste.
        // Sem isso, o Hibernate pode manter os objetos apenas no cache de
        // primeiro nível e as queries não os encontrariam.
        entityManager.flush();
    }

    // =========================================================================
    // existsPendenteValido
    // =========================================================================
    // Esta é a query mais complexa que escrevemos — ela verifica nas duas
    // direções (A→B e B→A) e filtra por status e por prazo de expiração.
    // Cada cenário abaixo testa uma condição diferente da cláusula WHERE.
    // =========================================================================

    @Nested
    @DisplayName("existsPendenteValido()")
    class ExistsPendenteValido {

        @Test
        @DisplayName("Deve retornar true quando existe convite pendente de Alice para Bruno")
        void deveRetornarTrueQuandoConvitePendenteNaDirecaoDireta() {
            // Arrange — Alice convidou Bruno, convite ainda válido
            entityManager.persist(ConviteDuelo.builder()
                    .token(UUID.randomUUID())
                    .remetente(alice)
                    .destinatario(bruno)
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build());
            entityManager.flush();

            // Act
            boolean resultado = conviteDueloRepository
                    .existsPendenteValido(alice.getId(), bruno.getId(), StatusConvite.PENDENTE);

            // Assert
            assertThat(resultado).isTrue();
        }

        @Test
        @DisplayName("Deve retornar true quando existe convite pendente de Bruno para Alice — verifica a direção inversa")
        void deveRetornarTrueQuandoConvitePendenteNaDirecaoInversa() {
            // Este teste é especialmente importante porque verifica o OR da query.
            // Se a cláusula bidirecional estiver errada, apenas um dos dois
            // cenários passaria — o que daria uma falsa sensação de segurança.
            entityManager.persist(ConviteDuelo.builder()
                    .token(UUID.randomUUID())
                    .remetente(bruno)   // Bruno convidou Alice desta vez
                    .destinatario(alice)
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build());
            entityManager.flush();

            // A query é chamada com alice como "remetente" da perspectiva
            // da verificação — ela não deve conseguir convidar Bruno de volta
            boolean resultado = conviteDueloRepository
                    .existsPendenteValido(alice.getId(), bruno.getId(), StatusConvite.PENDENTE);

            assertThat(resultado).isTrue();
        }

        @Test
        @DisplayName("Deve retornar false quando o convite existe mas já expirou")
        void deveRetornarFalseQuandoConviteExpirado() {
            // Arrange — convite com expiresAt no passado.
            // O filtro AND c.expiresAt > CURRENT_TIMESTAMP deve excluí-lo.
            entityManager.persist(ConviteDuelo.builder()
                    .token(UUID.randomUUID())
                    .remetente(alice)
                    .destinatario(bruno)
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(LocalDateTime.now().minusMinutes(1)) // já expirou
                    .build());
            entityManager.flush();

            boolean resultado = conviteDueloRepository
                    .existsPendenteValido(alice.getId(), bruno.getId(), StatusConvite.PENDENTE);

            // O convite existe no banco, mas não deve ser encontrado
            // porque o prazo venceu — novos convites devem ser permitidos
            assertThat(resultado).isFalse();
        }

        @Test
        @DisplayName("Deve retornar false quando o convite existe mas já foi aceito")
        void deveRetornarFalseQuandoConviteJaAceito() {
            // Arrange — convite aceito anteriormente, ainda dentro do prazo.
            // O filtro de status deve excluí-lo mesmo com expiresAt no futuro.
            entityManager.persist(ConviteDuelo.builder()
                    .token(UUID.randomUUID())
                    .remetente(alice)
                    .destinatario(bruno)
                    .status(StatusConvite.ACEITO) // status diferente de PENDENTE
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build());
            entityManager.flush();

            boolean resultado = conviteDueloRepository
                    .existsPendenteValido(alice.getId(), bruno.getId(), StatusConvite.PENDENTE);

            assertThat(resultado).isFalse();
        }

        @Test
        @DisplayName("Deve retornar false quando não existe nenhum convite entre os usuários")
        void deveRetornarFalseQuandoNenhumConviteExiste() {
            // Nenhum convite foi persistido no setUp — o banco está limpo
            // para esses dois usuários. Verificamos o comportamento de base.
            boolean resultado = conviteDueloRepository
                    .existsPendenteValido(alice.getId(), bruno.getId(), StatusConvite.PENDENTE);

            assertThat(resultado).isFalse();
        }
    }

    // =========================================================================
    // findByTokenWithLock
    // =========================================================================

    @Nested
    @DisplayName("findByTokenWithLock()")
    class FindByTokenWithLock {

        @Test
        @DisplayName("Deve retornar o convite correto pelo token com lock pessimista")
        void deveRetornarConvitePeloToken() {
            // Arrange — persistimos dois convites para garantir que a query
            // filtra pelo token correto e não retorna o convite errado
            UUID tokenAlvo = UUID.randomUUID();
            UUID tokenOutro = UUID.randomUUID();

            entityManager.persist(ConviteDuelo.builder()
                    .token(tokenAlvo)
                    .remetente(alice)
                    .destinatario(bruno)
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build());

            entityManager.persist(ConviteDuelo.builder()
                    .token(tokenOutro)
                    .remetente(bruno)
                    .destinatario(alice)
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build());

            entityManager.flush();
            // O clear remove os objetos do cache de primeiro nível do Hibernate,
            // forçando a query a ir de fato ao banco em vez de retornar
            // o objeto já carregado em memória — o que tornaria o teste inútil.
            entityManager.clear();

            // Act
            Optional<ConviteDuelo> resultado =
                    conviteDueloRepository.findByTokenWithLock(tokenAlvo);

            // Assert
            assertThat(resultado).isPresent();
            assertThat(resultado.get().getToken()).isEqualTo(tokenAlvo);
            assertThat(resultado.get().getRemetente().getId()).isEqualTo(alice.getId());
        }

        @Test
        @DisplayName("Deve retornar Optional vazio quando token não existe")
        void deveRetornarVazioQuandoTokenNaoExiste() {
            UUID tokenInexistente = UUID.randomUUID();

            Optional<ConviteDuelo> resultado =
                    conviteDueloRepository.findByTokenWithLock(tokenInexistente);

            assertThat(resultado).isEmpty();
        }
    }

    // =========================================================================
    // findByDestinatarioIdAndStatus
    // =========================================================================

    @Nested
    @DisplayName("findByDestinatarioIdAndStatus()")
    class FindByDestinatarioIdAndStatus {

        @Test
        @DisplayName("Deve retornar apenas os convites pendentes do destinatário informado")
        void deveRetornarApenasConvitesPendentesDoDestinatario() {
            // Arrange — três convites: dois para Bruno (um pendente, um aceito)
            // e um para Alice, para garantir que o filtro por destinatário funciona
            entityManager.persist(ConviteDuelo.builder()
                    .token(UUID.randomUUID())
                    .remetente(alice)
                    .destinatario(bruno)
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build());

            entityManager.persist(ConviteDuelo.builder()
                    .token(UUID.randomUUID())
                    .remetente(alice)
                    .destinatario(bruno)
                    .status(StatusConvite.ACEITO) // não deve aparecer no resultado
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build());

            entityManager.persist(ConviteDuelo.builder()
                    .token(UUID.randomUUID())
                    .remetente(bruno)
                    .destinatario(alice) // destinatário diferente — não deve aparecer
                    .status(StatusConvite.PENDENTE)
                    .expiresAt(LocalDateTime.now().plusMinutes(10))
                    .build());

            entityManager.flush();
            entityManager.clear();

            // Act — buscamos os convites pendentes de Bruno
            List<ConviteDuelo> resultado = conviteDueloRepository
                    .findByDestinatarioIdAndStatus(bruno.getId(), StatusConvite.PENDENTE);

            // Assert — apenas um convite deve ser retornado: o pendente para Bruno
            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).getDestinatario().getId()).isEqualTo(bruno.getId());
            assertThat(resultado.get(0).getStatus()).isEqualTo(StatusConvite.PENDENTE);
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando não há convites pendentes para o usuário")
        void deveRetornarListaVaziaQuandoNaoHaConvitesPendentes() {
            // Nenhum convite pendente foi criado para Bruno
            List<ConviteDuelo> resultado = conviteDueloRepository
                    .findByDestinatarioIdAndStatus(bruno.getId(), StatusConvite.PENDENTE);

            assertThat(resultado).isEmpty();
        }
    }
}