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

    // ── Nova: agregação por assunto dentro de um caderno ─────────
    //
    // Retorna Object[] com:
    //   [0] Long   assuntoId
    //   [1] String assuntoNome
    //   [2] Long   total       (COUNT)
    //   [3] Long   acertos     (SUM CASE)
    //
    // Questões sem assunto cadastrado são excluídas (q.assunto IS NOT NULL).
    // Ordenação por volume decrescente para que o service pegue os top N.
    @Query(value = """
    SELECT
        a.id                                          AS assuntoId,
        a.nome                                        AS assuntoNome,
        COUNT(rq.id)                                  AS total,
        SUM(CASE WHEN rq.tipo_resultado LIKE 'ACERTO%' THEN 1 ELSE 0 END) AS acertos
    FROM resposta_questao rq
    JOIN tentativa_simulado t   ON t.id = rq.id_tentativa
    JOIN simulado_questao   sq  ON sq.id = rq.id_simulado_questao
    JOIN questao            q   ON q.id  = sq.id_questao
    JOIN assunto            a   ON a.id  = q.id_assunto
    WHERE t.id_usuario = :usuarioId
      AND rq.caderno   = :caderno
      AND t.finalizada = true
    GROUP BY a.id, a.nome
    ORDER BY COUNT(rq.id) DESC
    """, nativeQuery = true)
    List<Object[]> aggregatePorAssunto(
            @Param("usuarioId") Long usuarioId,
            @Param("caderno") String caderno);

}
