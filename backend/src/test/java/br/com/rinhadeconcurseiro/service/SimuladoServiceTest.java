package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.response.SimuladoQuestaoResponse;
import br.com.rinhadeconcurseiro.dto.response.SimuladoResumoResponse;
import br.com.rinhadeconcurseiro.entity.*;
import br.com.rinhadeconcurseiro.enums.CadernoTipo;
import br.com.rinhadeconcurseiro.enums.RespostaTipo;
import br.com.rinhadeconcurseiro.mapper.SimuladoMapper;
import br.com.rinhadeconcurseiro.repository.SimuladoQuestaoRepository;
import br.com.rinhadeconcurseiro.repository.SimuladoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SimuladoServiceTest {

    @Mock
    private SimuladoRepository simuladoRepository;

    @Mock
    private SimuladoQuestaoRepository simuladoQuestaoRepository;

    @Spy
    private SimuladoMapper simuladoMapper;

    private SimuladoService simuladoService;

    private Simulado simulado;
    private Materia materia;
    private Questao questao;
    private SimuladoQuestao simuladoQuestao;

    @BeforeEach
    void setUp() {
        simuladoService = new SimuladoService(simuladoRepository, simuladoQuestaoRepository, simuladoMapper);
        materia = Materia.builder()
                .id(1L)
                .nome("Língua Portuguesa")
                .build();

        questao = Questao.builder()
                .id(1L)
                .materia(materia)
                .idTec("Q001")
                .enunciado("Questão de teste")
                .gabarito(RespostaTipo.CERTO)
                .build();

        simulado = Simulado.builder()
                .id(1L)
                .numero(1)
                .titulo("Simulado 01")
                .dataDisponivel(LocalDate.now())
                .totalQuestoes(180)
                .questoesBasicas(90)
                .questoesEspecificas(90)
                .ativo(true)
                .build();

        simuladoQuestao = SimuladoQuestao.builder()
                .id(1L)
                .simulado(simulado)
                .questao(questao)
                .ordem(1)
                .caderno(CadernoTipo.BASICO)
                .build();
    }

    @Test
    @DisplayName("Deve listar simulados disponíveis")
    void deveListarSimuladosDisponiveis() {
        when(simuladoRepository.findByDataDisponivelLessThanEqualAndAtivoTrueOrderByNumeroAsc(any()))
                .thenReturn(List.of(simulado));

        List<SimuladoResumoResponse> resultado = simuladoService.listarDisponiveis();

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).numero()).isEqualTo(1);
    }

    @Test
    @DisplayName("Deve buscar simulado do dia")
    void deveBuscarSimuladoDoDia() {
        when(simuladoRepository.findByDataDisponivelAndAtivoTrue(any()))
                .thenReturn(Optional.of(simulado));

        SimuladoResumoResponse resultado = simuladoService.buscarSimuladoHoje();

        assertThat(resultado.numero()).isEqualTo(1);
        assertThat(resultado.titulo()).isEqualTo("Simulado 01");
    }

    @Test
    @DisplayName("Deve lançar exceção quando não há simulado hoje")
    void deveLancarExcecaoQuandoNaoHaSimuladoHoje() {
        when(simuladoRepository.findByDataDisponivelAndAtivoTrue(any()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> simuladoService.buscarSimuladoHoje())
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Não há simulado disponível para hoje");
    }

    @Test
    @DisplayName("Deve buscar simulado por ID")
    void deveBuscarPorId() {
        when(simuladoRepository.findById(1L))
                .thenReturn(Optional.of(simulado));

        SimuladoResumoResponse resultado = simuladoService.buscarPorId(1L);

        assertThat(resultado.id()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Deve lançar exceção quando simulado não existe")
    void deveLancarExcecaoQuandoSimuladoNaoExiste() {
        when(simuladoRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> simuladoService.buscarPorId(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Simulado não encontrado: 999");
    }

    @Test
    @DisplayName("Deve buscar questões do simulado")
    void deveBuscarQuestoesDoSimulado() {
        when(simuladoRepository.existsById(1L)).thenReturn(true);
        when(simuladoQuestaoRepository.findBySimuladoIdOrderByOrdemAsc(1L))
                .thenReturn(List.of(simuladoQuestao));

        List<SimuladoQuestaoResponse> resultado = simuladoService.buscarQuestoes(1L);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).ordem()).isEqualTo(1);
        assertThat(resultado.get(0).caderno()).isEqualTo(CadernoTipo.BASICO);
    }

    @Test
    @DisplayName("Deve buscar questões por caderno")
    void deveBuscarQuestoesPorCaderno() {
        when(simuladoRepository.existsById(1L)).thenReturn(true);
        when(simuladoQuestaoRepository.findBySimuladoIdAndCadernoOrderByOrdemAsc(1L, CadernoTipo.BASICO))
                .thenReturn(List.of(simuladoQuestao));

        List<SimuladoQuestaoResponse> resultado = simuladoService
                .buscarQuestoesPorCaderno(1L, CadernoTipo.BASICO);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).caderno()).isEqualTo(CadernoTipo.BASICO);
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar questões de simulado inexistente")
    void deveLancarExcecaoAoBuscarQuestoesDeSimuladoInexistente() {
        when(simuladoRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> simuladoService.buscarQuestoes(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Simulado não encontrado: 999");
    }

    @Test
    @DisplayName("Deve buscar próximo simulado")
    void deveBuscarProximoSimulado() {
        Simulado simuladoFuturo = Simulado.builder()
                .id(2L)
                .numero(2)
                .titulo("Simulado 02")
                .dataDisponivel(LocalDate.now().plusDays(1))
                .build();

        when(simuladoRepository.findFirstByDataDisponivelGreaterThanAndAtivoTrueOrderByDataDisponivelAsc(any()))
                .thenReturn(Optional.of(simuladoFuturo));

        SimuladoResumoResponse resultado = simuladoService.buscarProximoSimulado();

        assertThat(resultado.numero()).isEqualTo(2);
    }

    @Test
    @DisplayName("Deve contar simulados ativos")
    void deveContarSimuladosAtivos() {
        when(simuladoRepository.countByAtivoTrue()).thenReturn(30L);

        long total = simuladoService.contarSimuladosAtivos();

        assertThat(total).isEqualTo(30L);
    }
}