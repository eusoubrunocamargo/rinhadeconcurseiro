package br.com.rinhadeconcurseiro.interage.repository;

import br.com.rinhadeconcurseiro.interage.entity.Exercicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExercicioRepository
extends JpaRepository<Exercicio, Long> {
    List<Exercicio> findAllByFaseIdAndBlocoAndAtivoTrueOrderByRodadaAscOrdemNaRodadaAsc(
            Long faseId,
            Exercicio.Bloco bloco
    );

    int countByFaseIdAndBlocoAndAtivoTrue(Long faseId, Exercicio.Bloco bloco);
}
