package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.Assunto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssuntoRepository
        extends JpaRepository<Assunto, Long> {

    List<Assunto> findByMateriaId(Long materiaId);

    List<Assunto> findByMateriaIdAndAtivoTrue(Long materiaId);

    Optional<Assunto> findByMateriaIdAndNome(Long materiaId, String nome);

    boolean existsByMateriaIdAndNome(Long materiaId, String nome);

}
