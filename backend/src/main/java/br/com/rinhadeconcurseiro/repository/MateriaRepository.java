package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MateriaRepository
        extends JpaRepository<Materia, Long> {

    Optional<Materia> findByNome(String nome);

    List<Materia> findByAtivoTrue();

    boolean existsByNome(String nome);

}
