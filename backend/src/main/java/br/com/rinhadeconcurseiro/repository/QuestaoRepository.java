package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.Questao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestaoRepository
        extends JpaRepository<Questao, Long> {

    Optional<Questao> findByIdTec(String idTec);

    boolean existsByIdTec(String idTec);

    Page<Questao> findByMateria_IdAndAtivoTrue(Long materiaId, Pageable pageable);

    Page<Questao> findByAssunto_IdAndAtivoTrue(Long assuntoId, Pageable pageable);

    Page<Questao> findAllByAtivoTrue(Pageable pageable);

    @Query("SELECT COUNT(q) FROM Questao q WHERE q.materia.id = :materiaId AND q.ativo = true")
    long countByMateriaIdAndAtivoTrue(@Param("materiaId") Long materiaId);

    @Query("SELECT COUNT(q) FROM Questao q WHERE q.assunto.id = :assuntoId AND q.ativo = true")
    long countByAssuntoIdAndAtivoTrue(@Param("assuntoId") Long assuntoId);

    List<Questao> findByMateriaId(Long id);
}
