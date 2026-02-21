package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.request.RespostaRequest;
import br.com.rinhadeconcurseiro.dto.request.SalvarRespostasRequest;
import br.com.rinhadeconcurseiro.dto.response.*;
import br.com.rinhadeconcurseiro.entity.*;
import br.com.rinhadeconcurseiro.enums.*;
import br.com.rinhadeconcurseiro.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TentativaSimuladoServiceTest {

    @Mock
    private TentativaSimuladoRepository tentativaRepository;

    @Mock
    private RespostaQuestaoRepository respostaRepository;

    @Mock
    private SimuladoRepository simuladoRepository;

    @Mock
    private SimuladoQuestaoRepository simuladoQuestaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private TentativaSimuladoService service;

    private Usuario usuario;
    private Simulado simulado;
    private Materia materia;
    private SimuladoQuestao simuladoQuestao;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
                .id(1L)
                .nome("Bruno")
                .email("bruno@test.com")
                .googleId("google123")
                .build();

        simulado = Simulado.builder()
                .id(1L)
                .numero(1)
                .titulo("Simulado 01")
                .totalQuestoes(10)
                .build();

        materia = Materia.builder()
                .id(1L)
                .nome("Direito Constitucional")
                .build();

        Questao questao = Questao.builder()
                .id(1L)
                .materia(materia)
                .comando("Texto da questão")
                .enunciado("Enunciado")
                .gabarito(RespostaTipo.CERTO)
                .build();

        simuladoQuestao = SimuladoQuestao.builder()
                .id(1L)
                .simulado(simulado)
                .questao(questao)
                .ordem(1)
                .caderno(CadernoTipo.BASICO)
                .build();
    }

    // ========================================
    // TESTES: INICIAR TENTATIVA
    // ========================================
    @Nested
    @DisplayName("Iniciar Tentativa")
    class IniciarTentativa {

        @SuppressWarnings("null")
        @Test
        @DisplayName("Deve iniciar tentativa com sucesso")
        void deveIniciarTentativaComSucesso() {
            // Arrange
            when(tentativaRepository.findByUsuarioIdAndSimuladoIdAndFinalizadaFalse(1L, 1L))
                    .thenReturn(Optional.empty());
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
            when(simuladoRepository.findById(1L)).thenReturn(Optional.of(simulado));
            when(tentativaRepository.save(any(TentativaSimulado.class)))
                    .thenAnswer(inv -> {
                        TentativaSimulado t = inv.getArgument(0);
                        t.setId(100L);
                        return t;
                    });

            // Act
            TentativaIniciadaResponse response = service.iniciar(1L, 1L);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.tentativaId()).isEqualTo(100L);
            assertThat(response.simuladoId()).isEqualTo(1L);
            assertThat(response.simuladoTitulo()).isEqualTo("Simulado 01");
            assertThat(response.totalQuestoes()).isEqualTo(10);
            assertThat(response.dataInicio()).isNotNull();

            verify(tentativaRepository).save(any(TentativaSimulado.class));
        }

//        @Test
//        @DisplayName("Deve lançar exceção se já existe tentativa em andamento")
//        void deveLancarExcecaoSeJaExisteTentativaEmAndamento() {
//            // Arrange
//            TentativaSimulado tentativaExistente = TentativaSimulado.builder()
//                    .id(50L)
//                    .usuario(usuario)
//                    .simulado(simulado)
//                    .finalizada(false)
//                    .build();
//
//            when(tentativaRepository.findByUsuarioIdAndSimuladoIdAndFinalizadaFalse(1L, 1L))
//                    .thenReturn(Optional.of(tentativaExistente));
//
//            // Act & Assert
//            assertThatThrownBy(() -> service.iniciar(1L, 1L))
//                    .isInstanceOf(IllegalStateException.class)
//                    .hasMessageContaining("Já existe uma tentativa em andamento");
//
//            verify(tentativaRepository, never()).save(any());
//        }

        @Test
        @DisplayName("Deve lançar exceção se usuário não encontrado")
        void deveLancarExcecaoSeUsuarioNaoEncontrado() {
            // Arrange
            when(tentativaRepository.findByUsuarioIdAndSimuladoIdAndFinalizadaFalse(1L, 1L))
                    .thenReturn(Optional.empty());
            when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> service.iniciar(1L, 1L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Usuário não encontrado");
        }

        @Test
        @DisplayName("Deve lançar exceção se simulado não encontrado")
        void deveLancarExcecaoSeSimuladoNaoEncontrado() {
            // Arrange
            when(tentativaRepository.findByUsuarioIdAndSimuladoIdAndFinalizadaFalse(1L, 1L))
                    .thenReturn(Optional.empty());
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
            when(simuladoRepository.findById(1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> service.iniciar(1L, 1L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Simulado não encontrado");
        }
    }

    // ========================================
    // TESTES: SALVAR RESPOSTAS
    // ========================================
    @Nested
    @DisplayName("Salvar Respostas")
    class SalvarRespostas {

        @SuppressWarnings("null")
        @Test
        @DisplayName("Deve salvar respostas com sucesso")
        void deveSalvarRespostasComSucesso() {
            // Arrange
            TentativaSimulado tentativa = TentativaSimulado.builder()
                    .id(1L)
                    .usuario(usuario)
                    .simulado(simulado)
                    .finalizada(false)
                    .respostas(new ArrayList<>())
                    .build();

            SalvarRespostasRequest request = new SalvarRespostasRequest(List.of(
                    new RespostaRequest(1L, RespostaTipo.CERTO, NivelConfianca.CERTEZA, null)
            ));

            when(tentativaRepository.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(simuladoQuestaoRepository.findById(1L))
                    .thenReturn(Optional.of(simuladoQuestao));
            when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            service.salvarRespostas(1L, 1L, request);

            // Assert
            assertThat(tentativa.getRespostas()).hasSize(1);
            assertThat(tentativa.getRespostas().get(0).getResposta()).isEqualTo(RespostaTipo.CERTO);
            assertThat(tentativa.getRespostas().get(0).getConfianca()).isEqualTo(NivelConfianca.CERTEZA);

            verify(tentativaRepository).save(tentativa);
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Deve lançar exceção se tentativa já finalizada")
        void deveLancarExcecaoSeTentativaJaFinalizada() {
            // Arrange
            TentativaSimulado tentativa = TentativaSimulado.builder()
                    .id(1L)
                    .usuario(usuario)
                    .simulado(simulado)
                    .finalizada(true)
                    .build();

            SalvarRespostasRequest request = new SalvarRespostasRequest(List.of(
                    new RespostaRequest(1L, RespostaTipo.CERTO, NivelConfianca.CERTEZA, null)
            ));

            when(tentativaRepository.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(tentativa));

            // Act & Assert
            assertThatThrownBy(() -> service.salvarRespostas(1L, 1L, request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Tentativa já finalizada");

            verify(tentativaRepository, never()).save(any());
        }
    }

    // ========================================
    // TESTES: CLASSIFICAÇÃO DE RESPOSTAS
    // ========================================
    @Nested
    @DisplayName("Classificação de Respostas")
    class ClassificacaoRespostas {

        private TentativaSimulado criarTentativaComResposta(
                RespostaTipo resposta,
                NivelConfianca confianca,
                TipoErro tipoErro,
                RespostaTipo gabarito) {

            Questao q = Questao.builder()
                    .id(1L)
                    .materia(materia)
                    .gabarito(gabarito)
                    .build();

            SimuladoQuestao sq = SimuladoQuestao.builder()
                    .id(1L)
                    .simulado(simulado)
                    .questao(q)
                    .ordem(1)
                    .caderno(CadernoTipo.BASICO)
                    .build();

            RespostaQuestao rq = RespostaQuestao.builder()
                    .id(1L)
                    .simuladoQuestao(sq)
                    .resposta(resposta)
                    .confianca(confianca)
                    .tipoErro(tipoErro)
                    .build();

            TentativaSimulado tentativa = TentativaSimulado.builder()
                    .id(1L)
                    .usuario(usuario)
                    .simulado(simulado)
                    .finalizada(false)
                    .respostas(new ArrayList<>(List.of(rq)))
                    .build();

            rq.setTentativa(tentativa);

            return tentativa;
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Acerto com certeza = Verde")
        void acertoComCertezaDeveSerVerde() {
            // Arrange
            TentativaSimulado tentativa = criarTentativaComResposta(
                    RespostaTipo.CERTO, NivelConfianca.CERTEZA, null, RespostaTipo.CERTO);

            when(tentativaRepository.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L);

            // Assert
            assertThat(response.acertos()).isEqualTo(1);
            assertThat(response.totalVerde()).isEqualTo(1);
            assertThat(tentativa.getRespostas().get(0).getTipoResultado())
                    .isEqualTo(TipoResultado.ACERTO_CONSCIENTE);
            assertThat(tentativa.getRespostas().get(0).getCaderno())
                    .isEqualTo(Caderno.VERDE);
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Acerto com dúvida = Amarelo")
        void acertoComDuvidaDeveSerAmarelo() {
            // Arrange
            TentativaSimulado tentativa = criarTentativaComResposta(
                    RespostaTipo.CERTO, NivelConfianca.DUVIDA, null, RespostaTipo.CERTO);

            when(tentativaRepository.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L);

            // Assert
            assertThat(response.totalAmarelo()).isEqualTo(1);
            assertThat(tentativa.getRespostas().get(0).getTipoResultado())
                    .isEqualTo(TipoResultado.ACERTO_COM_DUVIDA);
            assertThat(tentativa.getRespostas().get(0).getCaderno())
                    .isEqualTo(Caderno.AMARELO);
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Acerto por chute = Amarelo")
        void acertoPorChuteDeveSerAmarelo() {
            // Arrange
            TentativaSimulado tentativa = criarTentativaComResposta(
                    RespostaTipo.CERTO, NivelConfianca.CHUTE, null, RespostaTipo.CERTO);

            when(tentativaRepository.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L);

            // Assert
            assertThat(response.totalAmarelo()).isEqualTo(1);
            assertThat(tentativa.getRespostas().get(0).getTipoResultado())
                    .isEqualTo(TipoResultado.ACERTO_POR_CHUTE);
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Erro de conteúdo = Vermelho")
        void erroConteudoDeveSerVermelho() {
            // Arrange
            TentativaSimulado tentativa = criarTentativaComResposta(
                    RespostaTipo.ERRADO, NivelConfianca.CERTEZA, TipoErro.CONTEUDO, RespostaTipo.CERTO);

            when(tentativaRepository.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L);

            // Assert
            assertThat(response.erros()).isEqualTo(1);
            assertThat(response.totalVermelho()).isEqualTo(1);
            assertThat(tentativa.getRespostas().get(0).getTipoResultado())
                    .isEqualTo(TipoResultado.ERRO_CONTEUDO);
            assertThat(tentativa.getRespostas().get(0).getCaderno())
                    .isEqualTo(Caderno.VERMELHO);
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Erro de interpretação com dúvida = Amarelo")
        void erroInterpretacaoComDuvidaDeveSerAmarelo() {
            // Arrange
            TentativaSimulado tentativa = criarTentativaComResposta(
                    RespostaTipo.ERRADO, NivelConfianca.DUVIDA, TipoErro.INTERPRETACAO, RespostaTipo.CERTO);

            when(tentativaRepository.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L);

            // Assert
            assertThat(response.totalAmarelo()).isEqualTo(1);
            assertThat(tentativa.getRespostas().get(0).getCaderno())
                    .isEqualTo(Caderno.AMARELO);
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Erro de interpretação com certeza = Vermelho")
        void erroInterpretacaoComCertezaDeveSerVermelho() {
            // Arrange
            TentativaSimulado tentativa = criarTentativaComResposta(
                    RespostaTipo.ERRADO, NivelConfianca.CERTEZA, TipoErro.INTERPRETACAO, RespostaTipo.CERTO);

            when(tentativaRepository.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L);

            // Assert
            assertThat(response.totalVermelho()).isEqualTo(1);
            assertThat(tentativa.getRespostas().get(0).getCaderno())
                    .isEqualTo(Caderno.VERMELHO);
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Erro por distração = Amarelo")
        void erroDistracaoDeveSerAmarelo() {
            // Arrange
            TentativaSimulado tentativa = criarTentativaComResposta(
                    RespostaTipo.ERRADO, NivelConfianca.CERTEZA, TipoErro.DISTRACAO, RespostaTipo.CERTO);

            when(tentativaRepository.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L);

            // Assert
            assertThat(response.totalAmarelo()).isEqualTo(1);
            assertThat(tentativa.getRespostas().get(0).getTipoResultado())
                    .isEqualTo(TipoResultado.ERRO_DISTRACAO);
            assertThat(tentativa.getRespostas().get(0).getCaderno())
                    .isEqualTo(Caderno.AMARELO);
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Resposta em branco não classifica")
        void respostaEmBrancoNaoClassifica() {
            // Arrange
            TentativaSimulado tentativa = criarTentativaComResposta(
                    null, null, null, RespostaTipo.CERTO);

            when(tentativaRepository.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L);

            // Assert
            assertThat(response.emBranco()).isEqualTo(1);
            assertThat(response.totalVermelho()).isEqualTo(0);
            assertThat(response.totalAmarelo()).isEqualTo(0);
            assertThat(response.totalVerde()).isEqualTo(0);
            assertThat(tentativa.getRespostas().get(0).getCaderno()).isNull();
        }
    }

    // ========================================
    // TESTES: CONSULTAS
    // ========================================
    @Nested
    @DisplayName("Consultas")
    class Consultas {

        @Test
        @DisplayName("Deve listar tentativas em andamento")
        void deveListarEmAndamento() {
            // Arrange
            TentativaSimulado tentativa = TentativaSimulado.builder()
                    .id(1L)
                    .usuario(usuario)
                    .simulado(simulado)
                    .dataInicio(LocalDateTime.now())
                    .finalizada(false)
                    .respostas(new ArrayList<>())
                    .build();

            when(tentativaRepository.findByUsuarioIdAndFinalizadaFalseOrderByDataInicioDesc(1L))
                    .thenReturn(List.of(tentativa));

            // Act
            List<TentativaResumoResponse> lista = service.listarEmAndamento(1L);

            // Assert
            assertThat(lista).hasSize(1);
            assertThat(lista.get(0).finalizada()).isFalse();
        }

        @Test
        @Disabled("Não implementado")
        @DisplayName("Deve obter progresso do usuário")
        void deveObterProgresso() {
            // Arrange
            when(tentativaRepository.findByUsuarioIdAndFinalizadaFalseOrderByDataInicioDesc(1L))
                    .thenReturn(List.of());
            when(tentativaRepository.countByUsuarioIdAndFinalizadaTrue(1L))
                    .thenReturn(5L);
            when(tentativaRepository.calcularMediaAproveitamento(1L))
                    .thenReturn(75.5);
            when(respostaRepository.countByUsuarioIdGroupByCaderno(1L))
                    .thenReturn(List.of(
                            new Object[]{Caderno.VERMELHO, 10L},
                            new Object[]{Caderno.AMARELO, 20L},
                            new Object[]{Caderno.VERDE, 30L}
                    ));

            // Act
            MeuProgressoResponse progresso = service.obterProgresso(1L);

            // Assert
            assertThat(progresso.simuladosEmAndamento()).isEqualTo(0);
            assertThat(progresso.simuladosFinalizados()).isEqualTo(5);
            assertThat(progresso.mediaAproveitamento()).isEqualTo(75.5);
            assertThat(progresso.cadernos().totalVermelho()).isEqualTo(10);
            assertThat(progresso.cadernos().totalAmarelo()).isEqualTo(20);
            assertThat(progresso.cadernos().totalVerde()).isEqualTo(30);
        }
    }
}