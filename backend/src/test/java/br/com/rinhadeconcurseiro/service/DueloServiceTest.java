package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.request.IniciarDueloRequest;
import br.com.rinhadeconcurseiro.dto.response.DueloResponse;
import br.com.rinhadeconcurseiro.entity.Duelo;
import br.com.rinhadeconcurseiro.entity.DueloQuestao;
import br.com.rinhadeconcurseiro.entity.Questao;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.enums.RespostaTipo;
import br.com.rinhadeconcurseiro.enums.StatusDuelo;
import br.com.rinhadeconcurseiro.exception.DueloException;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.DueloMapper;
import br.com.rinhadeconcurseiro.repository.DueloQuestaoRepository;
import br.com.rinhadeconcurseiro.repository.DueloRepository;
import br.com.rinhadeconcurseiro.repository.QuestaoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DueloService")
class DueloServiceTest {

    @Mock
    private DueloRepository dueloRepository;
    @Mock
    private DueloQuestaoRepository dueloQuestaoRepository;
    @Mock
    private QuestaoRepository questaoRepository;
    @Mock
    private DueloMapper dueloMapper;

    @InjectMocks
    private DueloService dueloService;

    private Usuario host;
    private Usuario desafiado;
    private Duelo dueloEmConfiguracao;
    private DueloResponse dueloResponseMock;

    @BeforeEach
    void setUp() {

        host = Usuario.builder()
                .id(1L)
                .nome("Alice")
                .email("alice@email.com")
                .googleId("google-alice")
                .build();

        desafiado = Usuario.builder()
                .id(2L)
                .nome("Bruno")
                .email("bruno@email.com")
                .googleId("google-bruno")
                .build();

        //duelo no estado inicial correto
        dueloEmConfiguracao = Duelo.builder()
                .id(10L)
                .host(host)
                .desafiado(desafiado)
                .status(StatusDuelo.CONFIGURANDO)
                .build();

        dueloResponseMock = DueloResponse.builder()
                .id(10L)
                .status(StatusDuelo.EM_ANDAMENTO)
                .build();
    }

    //método utilitário para gerar questões fictícias com o tamanho solicitado
    private List<Questao> gerarQuestoes(int quantidade) {
        return java.util.stream.IntStream.rangeClosed(1, quantidade)
                .mapToObj(i -> Questao.builder()
                        .id((long) i)
                        .enunciado("Enunciado da questão " + i)
                        .gabarito(RespostaTipo.CERTO)
                        .ativo(true)
                        .build())
                .toList();
    }

    @Nested
    @DisplayName("iniciar()")
    class Iniciar {

        @Test
        @DisplayName("Deve iniciar o duelo com filtro por MATERIA e persistir as questões em ordem")
        void deveIniciarDueloComFiltroMateria() {
            // Arrange
            IniciarDueloRequest request = new IniciarDueloRequest(10, "MATERIA", 5L);
            List<Questao> questoesSorteadas = gerarQuestoes(10);

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmConfiguracao));
            when(questaoRepository.sortearPorMateria(eq(5L), any(Pageable.class)))
                    .thenReturn(questoesSorteadas);
            when(dueloRepository.save(any(Duelo.class))).thenReturn(dueloEmConfiguracao);
            when(dueloMapper.toDueloResponse(any(Duelo.class))).thenReturn(dueloResponseMock);

            // Act
            DueloResponse response = dueloService.iniciar(10L, host, request);

            // Assert — verificamos o resultado final
            assertThat(response.status()).isEqualTo(StatusDuelo.EM_ANDAMENTO);

            // Verificamos que exatamente 10 DueloQuestao foram persistidos.
            // O verify com times(10) confirma que o save foi chamado uma vez
            // por questão — nem mais, nem menos.
            verify(dueloQuestaoRepository, times(10)).save(any(DueloQuestao.class));

            // Verificamos que a query correta foi chamada — MATERIA, não ASSUNTO.
            verify(questaoRepository).sortearPorMateria(eq(5L), any(Pageable.class));
            verify(questaoRepository, never()).sortearPorAssunto(any(), any());
        }

        @Test
        @DisplayName("Deve iniciar o duelo com filtro por ASSUNTO e usar a query correta")
        void deveIniciarDueloComFiltroAssunto() {
            // Este teste é separado do anterior porque verifica um caminho
            // de código diferente dentro do switch — o "ASSUNTO" delega para
            // sortearPorAssunto(), e queremos confirmar explicitamente isso.
            IniciarDueloRequest request = new IniciarDueloRequest(10, "ASSUNTO", 99L);
            List<Questao> questoesSorteadas = gerarQuestoes(10);

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmConfiguracao));
            when(questaoRepository.sortearPorAssunto(eq(99L), any(Pageable.class)))
                    .thenReturn(questoesSorteadas);
            when(dueloRepository.save(any(Duelo.class))).thenReturn(dueloEmConfiguracao);
            when(dueloMapper.toDueloResponse(any(Duelo.class))).thenReturn(dueloResponseMock);

            dueloService.iniciar(10L, host, request);

            verify(questaoRepository).sortearPorAssunto(eq(99L), any(Pageable.class));
            verify(questaoRepository, never()).sortearPorMateria(any(), any());
        }

        @Test
        @DisplayName("Deve persistir as DueloQuestao com ordem sequencial começando em 1")
        void devePersistirQuestoesComOrdemSequencial() {
            // Este teste vai além de "foi chamado 10 vezes" — ele inspeciona
            // o conteúdo de cada objeto salvo para confirmar que a ordem
            // foi atribuída corretamente: 1, 2, 3... e não 0, 1, 2.
            IniciarDueloRequest request = new IniciarDueloRequest(10, "MATERIA", 5L);
            List<Questao> questoesSorteadas = gerarQuestoes(10);

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmConfiguracao));
            when(questaoRepository.sortearPorMateria(eq(5L), any(Pageable.class)))
                    .thenReturn(questoesSorteadas);
            when(dueloRepository.save(any(Duelo.class))).thenReturn(dueloEmConfiguracao);
            when(dueloMapper.toDueloResponse(any(Duelo.class))).thenReturn(dueloResponseMock);

            dueloService.iniciar(10L, host, request);

            // O ArgumentCaptor captura todos os objetos passados ao save(),
            // permitindo inspecionar os valores de cada chamada individualmente.
            ArgumentCaptor<DueloQuestao> captor = ArgumentCaptor.forClass(DueloQuestao.class);
            verify(dueloQuestaoRepository, times(10)).save(captor.capture());

            List<DueloQuestao> capturadas = captor.getAllValues();

            // A primeira questão deve ter ordem 1, não 0
            assertThat(capturadas.get(0).getOrdem()).isEqualTo(1);
            // A última questão deve ter ordem 10
            assertThat(capturadas.get(9).getOrdem()).isEqualTo(10);
            // Verificamos que as ordens são sequenciais sem lacunas
            for (int i = 0; i < capturadas.size(); i++) {
                assertThat(capturadas.get(i).getOrdem()).isEqualTo(i + 1);
            }
        }

        @Test
        @DisplayName("Deve lançar exceção quando o duelo não existe")
        void deveLancarExcecaoQuandoDueloNaoExiste() {
            IniciarDueloRequest request = new IniciarDueloRequest(10, "MATERIA", 5L);

            when(dueloRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> dueloService.iniciar(99L, host, request))
                    .isInstanceOf(ResourceNotFoundException.class);

            // Nenhuma query de questões deve acontecer se o duelo não existe
            verifyNoInteractions(questaoRepository, dueloQuestaoRepository);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o solicitante não é o host")
        void deveLancarExcecaoQuandoSolicitanteNaoEHost() {
            IniciarDueloRequest request = new IniciarDueloRequest(10, "MATERIA", 5L);

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmConfiguracao));

            // Bruno não é o host — apenas Alice pode iniciar este duelo.
            assertThatThrownBy(() -> dueloService.iniciar(10L, desafiado, request))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("host");

            verifyNoInteractions(questaoRepository, dueloQuestaoRepository);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o duelo não está no status CONFIGURANDO")
        void deveLancarExcecaoQuandoStatusInvalido() {
            IniciarDueloRequest request = new IniciarDueloRequest(10, "MATERIA", 5L);

            // Simulamos um duelo que já foi iniciado anteriormente
            Duelo dueloJaIniciado = Duelo.builder()
                    .id(10L)
                    .host(host)
                    .desafiado(desafiado)
                    .status(StatusDuelo.EM_ANDAMENTO) // não é CONFIGURANDO
                    .build();

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloJaIniciado));

            assertThatThrownBy(() -> dueloService.iniciar(10L, host, request))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("EM_ANDAMENTO");

            verifyNoInteractions(questaoRepository, dueloQuestaoRepository);
        }

        @Test
        @DisplayName("Deve lançar exceção quando não há questões suficientes no banco")
        void deveLancarExcecaoQuandoQuestoesInsuficientes() {
            // O host pediu 10 questões, mas o banco só tem 4 disponíveis
            // para aquela matéria. O duelo não deve ser iniciado.
            IniciarDueloRequest request = new IniciarDueloRequest(10, "MATERIA", 5L);

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmConfiguracao));
            when(questaoRepository.sortearPorMateria(eq(5L), any(Pageable.class)))
                    .thenReturn(gerarQuestoes(4)); // apenas 4 disponíveis

            assertThatThrownBy(() -> dueloService.iniciar(10L, host, request))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("Encontradas: 4")
                    .hasMessageContaining("necessárias: 10");

            // Nenhuma DueloQuestao deve ter sido salva — a transação deve
            // ser completamente revertida sem efeitos colaterais no banco.
            verifyNoInteractions(dueloQuestaoRepository);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o tipoFiltro é inválido")
        void deveLancarExcecaoQuandoTipoFiltroInvalido() {
            IniciarDueloRequest request = new IniciarDueloRequest(10, "BANCA", 5L);

            when(dueloRepository.findById(10L)).thenReturn(Optional.of(dueloEmConfiguracao));

            assertThatThrownBy(() -> dueloService.iniciar(10L, host, request))
                    .isInstanceOf(DueloException.class)
                    .hasMessageContaining("BANCA");

            verifyNoInteractions(dueloQuestaoRepository);
        }

    }
}
