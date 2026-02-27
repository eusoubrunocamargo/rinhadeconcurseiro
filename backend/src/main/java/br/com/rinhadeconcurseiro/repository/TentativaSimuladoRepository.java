package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.TentativaSimulado;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TentativaSimuladoRepository extends JpaRepository<TentativaSimulado, Long> {

    //buscar tentativas em andamento do utilizador
    @EntityGraph(attributePaths = {"respostas"})
    List<TentativaSimulado> findByUsuarioIdAndFinalizadaFalseOrderByDataInicioDesc(Long usuarioId);

    //buscar tentativas finalizadas do usuário
    @EntityGraph(attributePaths = {"respostas"})
    List<TentativaSimulado> findByUsuarioIdAndFinalizadaTrueOrderByDataFimDesc(Long usuarioId);

    //buscar tentativa específica do usuário
    @EntityGraph(attributePaths = {"respostas", "respostas.simuladoQuestao"})
    Optional<TentativaSimulado> findByIdAndUsuarioId(Long id, Long usuarioId);

    //verificar se o usuário tem tentativa em andamento para um simulado
    Optional<TentativaSimulado> findByUsuarioIdAndSimuladoIdAndFinalizadaFalse(Long usuarioId, Long simuladoId);

    //contar tentativas finalizadas do usuário
    long countByUsuarioIdAndFinalizadaTrue(Long usuarioId);

    //buscar última tentativa finalizada de um simulado
    Optional<TentativaSimulado> findFirstByUsuarioIdAndSimuladoIdAndFinalizadaTrueOrderByDataFimDesc(Long usuarioId, Long simuladoId);

    // Buscar todas as tentativas de um usuário para um simulado
    List<TentativaSimulado> findAllByUsuarioIdAndSimuladoId(Long usuarioId, Long simuladoId);

    // Contar simulados distintos finalizados
    @Query("""
                SELECT COUNT(DISTINCT t.simulado.id)
                FROM TentativaSimulado t
                WHERE t.usuario.id = :usuarioId AND t.finalizada = true
            """)
    long countSimuladosDistintosFinalizados(@Param("usuarioId") Long usuarioId);

    // Buscar última tentativa finalizada de cada simulado
    @Query("""
            SELECT t FROM TentativaSimulado t
            WHERE t.usuario.id = :usuarioId
            AND t.finalizada = true
            AND t.dataFim = (SELECT MAX(t2.dataFim)
            FROM TentativaSimulado t2
            WHERE t2.usuario.id = :usuarioId
            AND t2.simulado.id = t.simulado.id
            AND t2.finalizada = true
            ) ORDER BY t.dataFim DESC
            """)
    @EntityGraph(attributePaths = {"respostas"})
    List<TentativaSimulado> findUltimasTentativasFinalizadasPorSimulado(@Param("usuarioId") Long usuarioId);

    // Calcular média apenas das últimas tentativas (não todas)
    @Query("""
                SELECT AVG(
                    CASE WHEN s.totalQuestoes > 0
                        THEN (t.pontuacao * 100.0) / s.totalQuestoes
                        ELSE 0
                    END
                )
                FROM TentativaSimulado t
                JOIN t.simulado s
                WHERE t.usuario.id = :usuarioId
                  AND t.finalizada = true
                  AND t.dataFim = (
                      SELECT MAX(t2.dataFim)
                      FROM TentativaSimulado t2
                      WHERE t2.usuario.id = :usuarioId
                        AND t2.simulado.id = t.simulado.id
                        AND t2.finalizada = true
                  )
            """)
    Double calcularMediaAproveitamento(@Param("usuarioId") Long usuarioId);

    // Ranking por simulado (última tentativa de cada usuário)
    @Query("""
                SELECT t FROM TentativaSimulado t
                JOIN FETCH t.usuario u
                WHERE t.simulado.id = :simuladoId
                  AND t.finalizada = true
                  AND t.dataFim = (
                      SELECT MAX(t2.dataFim)
                      FROM TentativaSimulado t2
                      WHERE t2.usuario.id = t.usuario.id
                        AND t2.simulado.id = :simuladoId
                        AND t2.finalizada = true
                  )
                ORDER BY t.pontuacao DESC, t.acertos DESC, t.dataFim ASC
            """)
    List<TentativaSimulado> findRankingBySimuladoId(@Param("simuladoId") Long simuladoId);

    // Ranking geral (soma de pontuações de todos os simulados - última tentativa de cada)
    @Query("""
                SELECT u.id, u.nome, u.apelido, u.fotoUrl,
                       SUM(t.pontuacao) as totalPontuacao,
                       SUM(t.acertos) as totalAcertos,
                       SUM(t.erros) as totalErros,
                       SUM(t.emBranco) as totalEmBranco,
                       COUNT(DISTINCT t.simulado.id) as simuladosFinalizados
                FROM TentativaSimulado t
                JOIN t.usuario u
                WHERE t.finalizada = true
                  AND t.dataFim = (
                      SELECT MAX(t2.dataFim)
                      FROM TentativaSimulado t2
                      WHERE t2.usuario.id = t.usuario.id
                        AND t2.simulado.id = t.simulado.id
                        AND t2.finalizada = true
                  )
                GROUP BY u.id, u.nome, u.apelido, u.fotoUrl
                ORDER BY totalPontuacao DESC, totalAcertos DESC
            """)
    List<Object[]> findRankingGeral();

    // Contar participantes de um simulado
    @Query("""
                SELECT COUNT(DISTINCT t.usuario.id)
                FROM TentativaSimulado t
                WHERE t.simulado.id = :simuladoId AND t.finalizada = true
            """)
    Integer countParticipantesBySimuladoId(@Param("simuladoId") Long simuladoId);

    // Contar total de participantes (ranking geral)
    @Query("""
                SELECT COUNT(DISTINCT t.usuario.id)
                FROM TentativaSimulado t
                WHERE t.finalizada = true
            """)
    Integer countParticipantesGeral();

    // Conta tentativas finalizadas de um simulado
    long countBySimuladoIdAndFinalizadaTrue(Long simuladoId);

    // Média de desempenho entre todas as tentativas finalizadas de um simulado
    @Query("""
                SELECT COALESCE(AVG(
                    CASE WHEN (t.acertos + t.erros) > 0
                         THEN (t.acertos * 100.0) / (t.acertos + t.erros)
                         ELSE 0
                    END
                ), 0)
                FROM TentativaSimulado t
                WHERE t.simulado.id = :simuladoId
                  AND t.finalizada = true
            """)
    Double calcularMediaDesempenhoPorSimulado(@Param("simuladoId") Long simuladoId);

}
