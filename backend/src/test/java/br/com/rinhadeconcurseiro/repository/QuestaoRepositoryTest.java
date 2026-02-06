package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.Assunto;
import br.com.rinhadeconcurseiro.entity.Materia;
import br.com.rinhadeconcurseiro.entity.Questao;
import br.com.rinhadeconcurseiro.enums.RespostaTipo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class QuestaoRepositoryTest {

    @Autowired
    private QuestaoRepository questaoRepository;

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private AssuntoRepository assuntoRepository;

    private Materia materia;
    private Assunto assunto;

    @BeforeEach
    void setUp() {
        //limpar dados anteriores
        questaoRepository.deleteAll();
        materiaRepository.deleteAll();
        assuntoRepository.deleteAll();

        //criar materia
        materia = Materia.builder()
                .nome("Direito Constitucional")
                .descricao("Estudo da Constituição Federal")
                .build();
        materiaRepository.save(materia);

        //criar assunto
        assunto = Assunto.builder()
                .materia(materia)
                .nome("Princípios Fundamentais")
                .build();
        assuntoRepository.save(assunto);
    }

    @Test
    void deveSalvarQuestao() {

        // Arrange
        Questao questao = Questao.builder()
                .materia(materia)
                .assunto(assunto)
                .idTec("12345")
                .enunciado("A República Federativa do Brasil é formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal.")
                .gabarito(RespostaTipo.CERTO)
                .build();

        // Act
        Questao salva = questaoRepository.save(questao);

        // Assert
        assertThat(salva.getId()).isNotNull();
        assertThat(salva.getCreatedAt()).isNotNull();
        assertThat(salva.getAtivo()).isTrue();
    }

    @Test
    void deveBuscarPorIdTec() {

        // Arrange
        Questao questao = Questao.builder()
                .materia(materia)
                .idTec("Q789")
                .enunciado("Questão teste")
                .gabarito(RespostaTipo.ERRADO)
                .build();
        questaoRepository.save(questao);

        // Act
        Optional<Questao> encontrada = questaoRepository.findByIdTec("Q789");

        // Assert
        assertThat(encontrada).isPresent();
        assertThat(encontrada.get().getGabarito()).isEqualTo(RespostaTipo.ERRADO);

    }

    @Test
    void deveBuscarPorMateriaId() {

        // Arrange
        Questao questao1 = Questao.builder()
                .materia(materia)
                .enunciado("Questão 1")
                .gabarito(RespostaTipo.CERTO)
                .build();

        Questao questao2 = Questao.builder()
                .materia(materia)
                .enunciado("Questão 2")
                .gabarito(RespostaTipo.ERRADO)
                .build();

        questaoRepository.save(questao1);
        questaoRepository.save(questao2);

        // Act
        List<Questao> questoes = questaoRepository.findByMateriaId(materia.getId());

        // Assert
        assertThat(questoes).hasSize(2);
    }

    @Test
    void deveContarQuestoesPorMateria() {

        // Arrange
        Questao questao1 = Questao.builder()
                .materia(materia)
                .enunciado("Questão 1")
                .gabarito(RespostaTipo.CERTO)
                .build();

        Questao questao2 = Questao.builder()
                .materia(materia)
                .enunciado("Questão 2")
                .gabarito(RespostaTipo.ERRADO)
                .ativo(false)
                .build();

        questaoRepository.save(questao1);
        questaoRepository.save(questao2);

        // Act
        long count = questaoRepository.countByMateriaIdAndAtivoTrue(materia.getId());

        // Assert
        assertThat(count).isEqualTo(1);

    }

    @Test
    void deveVerificarExistenciaPorIdTec() {

        // Arrange
        Questao questao = Questao.builder()
                .materia(materia)
                .idTec("Q123")
                .enunciado("Questão")
                .gabarito(RespostaTipo.CERTO)
                .build();
        questaoRepository.save(questao);

        // Act & Assert
        assertThat(questaoRepository.existsByIdTec("Q123")).isTrue();
        assertThat(questaoRepository.existsByIdTec("Q456")).isFalse();

    }


}
