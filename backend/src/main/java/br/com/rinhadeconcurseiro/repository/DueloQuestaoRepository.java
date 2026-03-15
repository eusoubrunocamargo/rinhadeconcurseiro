package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.DueloQuestao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DueloQuestaoRepository
    extends JpaRepository<DueloQuestao, Long> {

    // Busca as questões de um duelo em ordem — usado para carregar
    // a próxima questão a ser apresentada aos jogadores.
    List<DueloQuestao> findByDueloIdOrderByOrdem(Long dueloId);

    // Operação atômica de resolução — retorna o número de linhas afetadas.
    // Se retornar 0, outro thread já resolveu esta questão.
    // @Modifying indica ao Spring Data que é uma operação de escrita.
    @Modifying
    @Query("UPDATE DueloQuestao dq SET dq.resolvida = true WHERE dq.id = :id AND dq.resolvida = false")
    int marcarComoResolvida(@Param("id") Long id);

    @Query("""
    SELECT dq FROM DueloQuestao dq
    JOIN FETCH dq.questao q
    JOIN FETCH q.materia
    LEFT JOIN FETCH q.assunto
    WHERE dq.duelo.id = :dueloId
    ORDER BY dq.ordem
    """)
    List<DueloQuestao> findByDueloIdWithQuestaoOrderByOrdem(@Param("dueloId") Long dueloId);
}
