package br.com.rinhadeconcurseiro.interage.repository;

import br.com.rinhadeconcurseiro.interage.entity.Mundo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MundoRepository
extends JpaRepository<Mundo, Long> {
    List<Mundo> findAllByAtivoTrueOrderByNumeroAsc();
}
