package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.RespostaQuestao;
import br.com.rinhadeconcurseiro.enums.Caderno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RespostaQuestaoRepository
extends JpaRepository<RespostaQuestao, Long> {

    //buscar respostas de uma tentativa
    List<RespostaQuestao> findByTentativaIdOrderBySimuladoQuestaoOrdem(Long tentativaId);

    // Buscar última resposta de cada questão por caderno (sem duplicatas)
    @Query("""
    SELECT r FROM RespostaQuestao r
    JOIN r.tentativa t
    JOIN r.simuladoQuestao sq
    WHERE t.usuario.id = :usuarioId
      AND t.finalizada = true
      AND r.caderno = :caderno
      AND r.id = (
          SELECT MAX(r2.id)
          FROM RespostaQuestao r2
          JOIN r2.tentativa t2
          WHERE t2.usuario.id = :usuarioId
            AND t2.finalizada = true
            AND r2.simuladoQuestao.questao.id = r.simuladoQuestao.questao.id
            AND r2.caderno IS NOT NULL
      )
    ORDER BY sq.questao.materia.nome, sq.ordem
""")
    List<RespostaQuestao> findByUsuarioIdAndCaderno(
            @Param("usuarioId") Long usuarioId,
            @Param("caderno") Caderno caderno);

    // Contar questões distintas por caderno (última resposta de cada questão)
    @Query("""
    SELECT r.caderno, COUNT(DISTINCT r.simuladoQuestao.questao.id)
    FROM RespostaQuestao r
    JOIN r.tentativa t
    WHERE t.usuario.id = :usuarioId
      AND t.finalizada = true
      AND r.caderno IS NOT NULL
      AND r.id = (
          SELECT MAX(r2.id)
          FROM RespostaQuestao r2
          JOIN r2.tentativa t2
          WHERE t2.usuario.id = :usuarioId
            AND t2.finalizada = true
            AND r2.simuladoQuestao.questao.id = r.simuladoQuestao.questao.id
            AND r2.caderno IS NOT NULL
      )
    GROUP BY r.caderno
""")
    List<Object[]> countByUsuarioIdGroupByCaderno(@Param("usuarioId") Long usuarioId);

    //buscar respostas mais recentes de cada questão (para consolidar cadernos)
    @Query("""
            SELECT r FROM RespostaQuestao r
            JOIN r.tentativa t
            WHERE t.usuario.id = :usuarioId
            AND t.finalizada = true
            AND r.caderno = :caderno
            AND r.createdAt = (
                SELECT MAX(r2.createdAt)
                FROM RespostaQuestao r2
                JOIN r2.tentativa t2
                WHERE t2.usuario.id = :usuarioId
                AND t2.finalizada = true
                AND r2.simuladoQuestao.questao.id = r.simuladoQuestao.questao.id
                )
                ORDER BY r.caderno, r.createdAt DESC
            """)
    List<RespostaQuestao> findUltimasRespostasByCaderno(
            @Param("usuarioId") Long usuarioId,
            @Param("caderno") Caderno caderno
    );

    //deletar respostas de uma tentativa (para refazer)
    void deleteByTentativaId(Long tentativaId);

}
