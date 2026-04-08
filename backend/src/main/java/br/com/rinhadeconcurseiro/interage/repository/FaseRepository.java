package br.com.rinhadeconcurseiro.interage.repository;

import br.com.rinhadeconcurseiro.interage.entity.Fase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaseRepository
extends JpaRepository<Fase, Long> {
    List<Fase> findAllByMundoIdAndAtivoTrueOrderByOrdemNoMundoAsc(Long mundoId);
}
