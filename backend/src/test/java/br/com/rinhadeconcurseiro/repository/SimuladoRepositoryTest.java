package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.Simulado;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class SimuladoRepositoryTest {

    @Autowired
    private SimuladoRepository simuladoRepository;

    private Simulado simuladoHoje;
    private Simulado simuladoPassado;
    private Simulado simuladoFuturo;

    @BeforeEach
    void setUp() {
        //simuladoRepository.deleteAll();

        simuladoPassado = simuladoRepository.save(Simulado.builder()
                .numero(1)
                .titulo("Simulado 01")
                .dataDisponivel(LocalDate.now().minusDays(5))
                .totalQuestoes(180)
                .questoesBasicas(90)
                .questoesEspecificas(90)
                .ativo(true)
                .build());

        simuladoHoje = simuladoRepository.save(Simulado.builder()
                .numero(2)
                .titulo("Simulado 02")
                .dataDisponivel(LocalDate.now())
                .totalQuestoes(180)
                .questoesBasicas(90)
                .questoesEspecificas(90)
                .ativo(true)
                .build());

        simuladoFuturo = simuladoRepository.save(Simulado.builder()
                .numero(3)
                .titulo("Simulado 03")
                .dataDisponivel(LocalDate.now().plusDays(5))
                .totalQuestoes(180)
                .questoesBasicas(90)
                .questoesEspecificas(90)
                .ativo(true)
                .build());
    }

    @Test
    @DisplayName("Deve encontrar simulado por número")
    void deveBuscarPorNumero() {
        Optional<Simulado> resultado = simuladoRepository.findByNumero(2);

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getTitulo()).isEqualTo("Simulado 02");
    }

    @Test
    @DisplayName("Deve retornar vazio quando número não existe")
    void deveRetornarVazioQuandoNumeroNaoExiste() {
        Optional<Simulado> resultado = simuladoRepository.findByNumero(999);

        assertThat(resultado).isEmpty();
    }

    @Test
    @DisplayName("Deve encontrar simulado do dia")
    void deveBuscarSimuladoDoDia() {
        Optional<Simulado> resultado = simuladoRepository
                .findByDataDisponivelAndAtivoTrue(LocalDate.now());

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getNumero()).isEqualTo(2);
    }

    @Test
    @DisplayName("Deve listar simulados disponíveis ordenados por número")
    void deveListarSimuladosDisponiveis() {
        List<Simulado> resultado = simuladoRepository
                .findByDataDisponivelLessThanEqualAndAtivoTrueOrderByNumeroAsc(LocalDate.now());

        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0).getNumero()).isEqualTo(1);
        assertThat(resultado.get(1).getNumero()).isEqualTo(2);
    }

    @Test
    @DisplayName("Não deve listar simulados futuros")
    void naoDeveListarSimuladosFuturos() {
        List<Simulado> resultado = simuladoRepository
                .findByDataDisponivelLessThanEqualAndAtivoTrueOrderByNumeroAsc(LocalDate.now());

        assertThat(resultado).noneMatch(s -> s.getNumero().equals(3));
    }

    @Test
    @DisplayName("Não deve listar simulados inativos")
    void naoDeveListarSimuladosInativos() {
        simuladoHoje.setAtivo(false);
        simuladoRepository.save(simuladoHoje);

        List<Simulado> resultado = simuladoRepository
                .findByDataDisponivelLessThanEqualAndAtivoTrueOrderByNumeroAsc(LocalDate.now());

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getNumero()).isEqualTo(1);
    }

    @Test
    @DisplayName("Deve encontrar próximo simulado")
    void deveBuscarProximoSimulado() {
        Optional<Simulado> resultado = simuladoRepository
                .findFirstByDataDisponivelGreaterThanAndAtivoTrueOrderByDataDisponivelAsc(LocalDate.now());

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getNumero()).isEqualTo(3);
    }

    @Test
    @DisplayName("Deve verificar existência por número")
    void deveVerificarExistenciaPorNumero() {
        assertThat(simuladoRepository.existsByNumero(1)).isTrue();
        assertThat(simuladoRepository.existsByNumero(999)).isFalse();
    }

    @Test
    @DisplayName("Deve contar simulados ativos")
    void deveContarSimuladosAtivos() {
        long total = simuladoRepository.countByAtivoTrue();

        assertThat(total).isEqualTo(3);
    }
}