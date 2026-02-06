package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.Materia;
import br.com.rinhadeconcurseiro.entity.Questao;
import br.com.rinhadeconcurseiro.entity.Simulado;
import br.com.rinhadeconcurseiro.entity.SimuladoQuestao;
import br.com.rinhadeconcurseiro.enums.CadernoTipo;
import br.com.rinhadeconcurseiro.enums.RespostaTipo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class SimuladoQuestaoRepositoryTest {

    @Autowired
    private SimuladoQuestaoRepository simuladoQuestaoRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Simulado simulado;
    private Questao questao1;
    private Questao questao2;
    private Questao questao3;

    @BeforeEach
    void setUp(){
        //criar matéria
        Materia materia = Materia.builder()
                .nome("Língua Portuguesa")
                .ativo(true)
                .build();
        entityManager.persist(materia);

        //criar questões
        questao1 = Questao.builder()
                .materia(materia)
                .enunciado("Questão 1")
                .gabarito(RespostaTipo.CERTO)
                .ativo(true)
                .build();
        entityManager.persist(questao1);

        questao2 = Questao.builder()
                .materia(materia)
                .enunciado("Questão 2")
                .gabarito(RespostaTipo.ERRADO)
                .ativo(true)
                .build();
        entityManager.persist(questao2);

        questao3 = Questao.builder()
                .materia(materia)
                .enunciado("Questão 3")
                .gabarito(RespostaTipo.CERTO)
                .ativo(true)
                .build();
        entityManager.persist(questao3);

        //criar simulado
        simulado = Simulado.builder()
                .numero(1)
                .titulo("Simulado 01")
                .dataDisponivel(LocalDate.now())
                .totalQuestoes(3)
                .questoesBasicas(2)
                .questoesEspecificas(1)
                .ativo(true)
                .build();
        entityManager.persist(simulado);

        //associar questões ao simulado
        SimuladoQuestao sq1 = SimuladoQuestao.builder()
                .simulado(simulado)
                .questao(questao1)
                .ordem(1)
                .caderno(CadernoTipo.BASICO)
                .build();
        entityManager.persist(sq1);

        SimuladoQuestao sq2 = SimuladoQuestao.builder()
                .simulado(simulado)
                .questao(questao2)
                .ordem(2)
                .caderno(CadernoTipo.BASICO)
                .build();
        entityManager.persist(sq2);

        SimuladoQuestao sq3 = SimuladoQuestao.builder()
                .simulado(simulado)
                .questao(questao3)
                .ordem(3)
                .caderno(CadernoTipo.ESPECIFICO)
                .build();
        entityManager.persist(sq3);

        entityManager.flush();

    }

    @Test
    @DisplayName("Deve listar questões do simulado ordenadas por ordem")
    void deveListarQuestoesOrdenadas(){
        List<SimuladoQuestao> resultado = simuladoQuestaoRepository
                .findBySimuladoIdOrderByOrdemAsc(simulado.getId());

        assertThat(resultado).hasSize(3);
        assertThat(resultado.get(0).getOrdem()).isEqualTo(1);
        assertThat(resultado.get(1).getOrdem()).isEqualTo(2);
        assertThat(resultado.get(2).getOrdem()).isEqualTo(3);
    }

    @Test
    @DisplayName("Deve listar questões do caderno básico")
    void deveListarQuestoesDoCadernoBasico() {
        List<SimuladoQuestao> resultado = simuladoQuestaoRepository
                .findBySimuladoIdAndCadernoOrderByOrdemAsc(simulado.getId(), CadernoTipo.BASICO);

        assertThat(resultado).hasSize(2);
        assertThat(resultado).allMatch(sq -> sq.getCaderno() == CadernoTipo.BASICO);
    }

    @Test
    @DisplayName("Deve listar questões do caderno específico")
    void deveListarQuestoesDoCadernoEspecifico() {
        List<SimuladoQuestao> resultado = simuladoQuestaoRepository
                .findBySimuladoIdAndCadernoOrderByOrdemAsc(simulado.getId(), CadernoTipo.ESPECIFICO);

        assertThat(resultado).hasSize(1);
        assertThat(resultado).allMatch(sq -> sq.getCaderno() == CadernoTipo.ESPECIFICO);
    }

    @Test
    @DisplayName("Deve contar questões do simulado")
    void deveContarQuestoesDoSimulado() {
        long total = simuladoQuestaoRepository.countBySimuladoId(simulado.getId());
        assertThat(total).isEqualTo(3);
    }

    @Test
    @DisplayName("Deve contar questões por caderno")
    void deveContarQuestoesPorCaderno() {
        long totalBasico = simuladoQuestaoRepository
                .countBySimuladoIdAndCaderno(simulado.getId(), CadernoTipo.BASICO);

        long totalEspecifico = simuladoQuestaoRepository
                .countBySimuladoIdAndCaderno(simulado.getId(), CadernoTipo.ESPECIFICO);

        assertThat(totalBasico).isEqualTo(2);
        assertThat(totalEspecifico).isEqualTo(1);
    }

    @Test
    @DisplayName("Deve verificar se questão já está no simulado")
    void deveVerificarSeQuestaoJaEstaNoSimulado() {
        boolean existe = simuladoQuestaoRepository
                .existsBySimuladoIdAndQuestaoId(simulado.getId(), questao1.getId());
        boolean naoExiste = simuladoQuestaoRepository
                .existsBySimuladoIdAndQuestaoId(simulado.getId(), 999L);
        assertThat(existe).isTrue();
        assertThat(naoExiste).isFalse();
    }

    @Test
    @DisplayName("Deve retornar lista vazia para simulado inexistente")
    void deveRetornarListaVaziaParaSimuladoInexistente() {
        List<SimuladoQuestao> resultado = simuladoQuestaoRepository
                .findBySimuladoIdOrderByOrdemAsc(999L);
        assertThat(resultado).isEmpty();
    }




}
