package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.Simulado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SimuladoRepository extends JpaRepository<Simulado, Long> {

    Optional<Simulado> findByNumero(Integer numero);

    Optional<Simulado> findByDataDisponivelAndAtivoTrue(LocalDate data);

    List<Simulado> findByDataDisponivelLessThanEqualAndAtivoTrueOrderByNumeroAsc(LocalDate data);

    boolean existsByNumero(Integer numero);

    long countByAtivoTrue();

    Optional<Simulado> findFirstByDataDisponivelGreaterThanAndAtivoTrueOrderByDataDisponivelAsc(LocalDate data);


}
