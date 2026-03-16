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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ParameterizedPreparedStatementSetter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
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

    @Mock
    private JdbcTemplate jdbcTemplate;

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

        @SuppressWarnings("null")
        @Test
        @DisplayName("Deve continuar fluxo de refazer mesmo com corrida na exclusão condicional")
        void deveContinuarFluxoRefazerComCorridaNaExclusao() {
            TentativaSimulado tentativaExistente = TentativaSimulado.builder()
                    .id(50L)
                    .usuario(usuario)
                    .simulado(simulado)
                    .finalizada(false)
                    .build();

            when(tentativaRepository.findByUsuarioIdAndSimuladoIdAndFinalizadaFalse(1L, 1L))
                    .thenReturn(Optional.of(tentativaExistente));
            when(tentativaRepository.deleteByIdAndUsuarioIdAndFinalizadaFalse(50L, 1L))
                    .thenReturn(0);
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
            when(simuladoRepository.findById(1L)).thenReturn(Optional.of(simulado));
            when(tentativaRepository.save(any(TentativaSimulado.class)))
                    .thenAnswer(inv -> {
                        TentativaSimulado t = inv.getArgument(0);
                        t.setId(101L);
                        return t;
                    });

            TentativaIniciadaResponse response = service.iniciar(1L, 1L, true);

            assertThat(response.tentativaId()).isEqualTo(101L);
            verify(tentativaRepository).deleteByIdAndUsuarioIdAndFinalizadaFalse(50L, 1L);
            verify(tentativaRepository).save(any(TentativaSimulado.class));
        }
    }

    // ========================================
    // TESTES: SALVAR RESPOSTAS
    // ========================================
    @Nested
    @DisplayName("Salvar Respostas")
    class SalvarRespostas {

        @SuppressWarnings({"null", "unchecked"})
        @Test
        @DisplayName("Deve persistir respostas via batch JDBC com sucesso")
        void deveSalvarRespostasEmBatchComSucesso() {
            // Arrange
            TentativaSimulado tentativa = TentativaSimulado.builder()
                    .id(1L)
                    .usuario(usuario)
                    .simulado(simulado)
                    .finalizada(false)
                    .respostas(new ArrayList<>())
                    .build();

            SalvarRespostasRequest request = new SalvarRespostasRequest(List.of(
                    new RespostaRequest(1L, RespostaTipo.CERTO, NivelConfianca.CERTEZA, null),
                    new RespostaRequest(2L, RespostaTipo.ERRADO, NivelConfianca.DUVIDA, TipoErro.CONTEUDO)
            ));

            SimuladoQuestao sq2 = SimuladoQuestao.builder()
                    .id(2L).simulado(simulado).ordem(2).caderno(CadernoTipo.BASICO).build();

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(simuladoQuestaoRepository.findAllById(any()))
                    .thenReturn(List.of(simuladoQuestao, sq2));

            // Act
            service.salvarRespostas(1L, 1L, request);

            // Assert: deve ter disparado um batchUpdate, nunca o save do JPA
            verify(jdbcTemplate).batchUpdate(anyString(), any(List.class), anyInt(),
                    any(ParameterizedPreparedStatementSetter.class));
            verify(tentativaRepository, never()).save(any());
        }

        @SuppressWarnings({"null", "unchecked"})
        @Test
        @DisplayName("Deve ignorar silenciosamente se tentativa já finalizada (idempotente)")
        void deveIgnorarSeTentativaJaFinalizada() {
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

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));

            // Act — não deve lançar exceção
            assertThatCode(() -> service.salvarRespostas(1L, 1L, request))
                    .doesNotThrowAnyException();

            // Assert: nenhuma escrita no banco deve acontecer
            verify(jdbcTemplate, never()).batchUpdate(anyString(), any(List.class), anyInt(),
                    any(ParameterizedPreparedStatementSetter.class));
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

            // O finalizar() busca respostas via repository, não via tentativa.getRespostas().
            // Sem esse stub, findDetalhadasByTentativaId retorna lista vazia e todos os
            // contadores ficam zerados.
            when(respostaRepository.findDetalhadasByTentativaId(1L))
                    .thenReturn(tentativa.getRespostas());

            return tentativa;
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Acerto com certeza = Verde")
        void acertoComCertezaDeveSerVerde() {
            // Arrange
            TentativaSimulado tentativa = criarTentativaComResposta(
                    RespostaTipo.CERTO, NivelConfianca.CERTEZA, null, RespostaTipo.CERTO);

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            //when(tentativaRepository.save(any())).thenReturn(tentativa);

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

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            //when(tentativaRepository.save(any())).thenReturn(tentativa);

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

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            //when(tentativaRepository.save(any())).thenReturn(tentativa);

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

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            //when(tentativaRepository.save(any())).thenReturn(tentativa);

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

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            //when(tentativaRepository.save(any())).thenReturn(tentativa);

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

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            //when(tentativaRepository.save(any())).thenReturn(tentativa);

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

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            //when(tentativaRepository.save(any())).thenReturn(tentativa);

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

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            //when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L);

            // Assert
            assertThat(response.emBranco()).isEqualTo(1);
            assertThat(response.totalVermelho()).isEqualTo(0);
            assertThat(response.totalAmarelo()).isEqualTo(0);
            assertThat(response.totalVerde()).isEqualTo(0);
            assertThat(tentativa.getRespostas().get(0).getCaderno()).isNull();
        }

        @SuppressWarnings("null")
        @Test
        @DisplayName("Finalizar deve ser idempotente quando tentativa já está finalizada")
        void finalizarDeveSerIdempotente() {
            TentativaSimulado tentativa = criarTentativaComResposta(
                    RespostaTipo.CERTO, NivelConfianca.CERTEZA, null, RespostaTipo.CERTO);
            tentativa.setFinalizada(true);
            tentativa.setAcertos(1);
            tentativa.setErros(0);
            tentativa.setEmBranco(0);
            tentativa.setPontuacao(1);
            tentativa.setDataFim(LocalDateTime.now());

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));

            TentativaDetalheResponse response = service.finalizar(1L, 1L);

            assertThat(response.finalizada()).isTrue();
            assertThat(response.acertos()).isEqualTo(1);
            assertThat(response.erros()).isEqualTo(0);
            verify(tentativaRepository, never()).save(any());
        }
    }

    // ========================================
    // TESTES: FINALIZAR COM RESPOSTAS FINAIS
    // ========================================
    @Nested
    @DisplayName("Finalizar com Respostas Finais")
    class FinalizarComRespostasFinais {

        @SuppressWarnings({"null", "unchecked"})
        @Test
        @DisplayName("Deve salvar respostas finais e finalizar atomicamente")
        void deveSalvarEFinalizarAtomicamente() {
            // Arrange
            TentativaSimulado tentativa = TentativaSimulado.builder()
                    .id(1L).usuario(usuario).simulado(simulado)
                    .finalizada(false).respostas(new ArrayList<>()).build();

            List<RespostaRequest> respostasFinais = List.of(
                    new RespostaRequest(1L, RespostaTipo.CERTO, NivelConfianca.CERTEZA, null)
            );

            RespostaQuestao rq = RespostaQuestao.builder()
                    .id(1L).simuladoQuestao(simuladoQuestao)
                    .resposta(RespostaTipo.CERTO).confianca(NivelConfianca.CERTEZA).build();

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(simuladoQuestaoRepository.findAllById(any()))
                    .thenReturn(List.of(simuladoQuestao));
            when(respostaRepository.findDetalhadasByTentativaId(1L))
                    .thenReturn(List.of(rq));
            //when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L, respostasFinais);

            // Assert: batch executado antes da finalização
            verify(jdbcTemplate).batchUpdate(anyString(), any(List.class), anyInt(),
                    any(ParameterizedPreparedStatementSetter.class));
            // Assert: tentativa finalizada com a resposta classificada
            assertThat(response.finalizada()).isTrue();
            assertThat(tentativa.getFinalizada()).isTrue();
            verify(tentativaRepository).flush();
        }

        @SuppressWarnings({"null", "unchecked"})
        @Test
        @DisplayName("Deve finalizar sem erros quando respostasFinais é nulo (sem body)")
        void deveFinalizarSemBodyComSucesso() {
            // Arrange
            TentativaSimulado tentativa = TentativaSimulado.builder()
                    .id(1L).usuario(usuario).simulado(simulado)
                    .finalizada(false).respostas(new ArrayList<>()).build();

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(respostaRepository.findDetalhadasByTentativaId(1L))
                    .thenReturn(List.of());
            //when(tentativaRepository.save(any())).thenReturn(tentativa);

            // Act — sem respostas finais (comportamento legado)
            TentativaDetalheResponse response = service.finalizar(1L, 1L, null);

            // Assert: nenhum batch executado, apenas finalização
            verify(jdbcTemplate, never()).batchUpdate(anyString(), any(List.class), anyInt(),
                    any(ParameterizedPreparedStatementSetter.class));
            assertThat(response.finalizada()).isTrue();
        }

        @SuppressWarnings({"null", "unchecked"})
        @Test
        @DisplayName("Deve ser idempotente mesmo com respostas no body quando já finalizada")
        void deveSerIdempotenteComRespostasNoBody() {
            // Arrange
            TentativaSimulado tentativa = TentativaSimulado.builder()
                    .id(1L).usuario(usuario).simulado(simulado)
                    .finalizada(true).acertos(1).erros(0).emBranco(0).pontuacao(1)
                    .dataFim(LocalDateTime.now()).respostas(new ArrayList<>()).build();

            List<RespostaRequest> respostasFinais = List.of(
                    new RespostaRequest(1L, RespostaTipo.CERTO, NivelConfianca.CERTEZA, null)
            );

            when(tentativaRepository.findByIdAndUsuarioIdWithLock(1L, 1L))
                    .thenReturn(Optional.of(tentativa));
            when(respostaRepository.findDetalhadasByTentativaId(1L))
                    .thenReturn(List.of());

            // Act
            TentativaDetalheResponse response = service.finalizar(1L, 1L, respostasFinais);

            // Assert: idempotente — sem batch, sem save
            verify(jdbcTemplate, never()).batchUpdate(anyString(), any(List.class), anyInt(),
                    any(ParameterizedPreparedStatementSetter.class));
            verify(tentativaRepository, never()).save(any());
            assertThat(response.finalizada()).isTrue();
            assertThat(response.acertos()).isEqualTo(1);
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
