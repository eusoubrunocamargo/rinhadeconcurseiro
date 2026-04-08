package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.TentativaSimulado;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório Spring Data JPA para a entidade {@link TentativaSimulado}.
 * 
 * Gerencia a persistência das tentativas de resolução de simulados e fornece
 * consultas avançadas para painéis de estatísticas, ranqueamento global e por simulado.
 * Utiliza EntityGraphs para evitar o problema de N+1 queries e travas pessimistas
 * (Pessimistic Locking) para garantir a consistência em ambientes concorrentes.
 */
@Repository
public interface TentativaSimuladoRepository extends JpaRepository<TentativaSimulado, Long> {

    /**
     * Busca todas as tentativas em andamento de um usuário específico.
     * Utiliza EntityGraph para carregar as respostas associadas na mesma consulta.
     *
     * @param usuarioId ID do usuário.
     * @return Lista de tentativas não finalizadas, ordenadas da mais recente para a mais antiga.
     */
    @EntityGraph(attributePaths = {"respostas"})
    List<TentativaSimulado> findByUsuarioIdAndFinalizadaFalseOrderByDataInicioDesc(Long usuarioId);

    /**
     * Busca o histórico de tentativas já concluídas de um usuário.
     *
     * @param usuarioId ID do usuário.
     * @return Lista de tentativas finalizadas, ordenadas pela data de término mais recente.
     */
    @EntityGraph(attributePaths = {"respostas"})
    List<TentativaSimulado> findByUsuarioIdAndFinalizadaTrueOrderByDataFimDesc(Long usuarioId);

    /**
     * Busca os detalhes de uma tentativa específica, garantindo que pertence ao usuário solicitado.
     * Carrega a árvore completa (Tentativa -> Respostas -> SimuladoQuestao) para visualização detalhada.
     */
    @EntityGraph(attributePaths = {"respostas", "respostas.simuladoQuestao"})
    Optional<TentativaSimulado> findByIdAndUsuarioId(Long id, Long usuarioId);

    /**
     * Aplica um bloqueio pessimista de escrita no banco de dados para a tentativa especificada.
     * Essencial para evitar race conditions (condições de corrida) durante o auto-save de respostas
     * simultâneas ou durante o cálculo de finalização do simulado.
     *
     * @return Optional contendo a tentativa bloqueada para edição na transação atual.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT t FROM TentativaSimulado t
            WHERE t.id = :id AND t.usuario.id = :usuarioId
            """)
    Optional<TentativaSimulado> findByIdAndUsuarioIdWithLock(@Param("id") Long id, @Param("usuarioId") Long usuarioId);

    /**
     * Verifica de forma rápida se o usuário já possui um rascunho (tentativa em andamento)
     * para um simulado específico. Utilizado para retomar a prova.
     */
    Optional<TentativaSimulado> findByUsuarioIdAndSimuladoIdAndFinalizadaFalse(Long usuarioId, Long simuladoId);

    /**
     * Exclui fisicamente uma tentativa em andamento. 
     * Usado quando o usuário opta por "refazer" o simulado do zero antes de finalizá-lo.
     */
    @Modifying
    @Query("""
            DELETE FROM TentativaSimulado t
            WHERE t.id = :id
              AND t.usuario.id = :usuarioId
              AND t.finalizada = false
            """)
    int deleteByIdAndUsuarioIdAndFinalizadaFalse(@Param("id") Long id, @Param("usuarioId") Long usuarioId);

    /**
     * Conta o número total de tentativas que o usuário já concluiu (pode incluir repetições do mesmo simulado).
     */
    long countByUsuarioIdAndFinalizadaTrue(Long usuarioId);

    /**
     * Recupera o resultado da última vez que o usuário completou um determinado simulado.
     */
    Optional<TentativaSimulado> findFirstByUsuarioIdAndSimuladoIdAndFinalizadaTrueOrderByDataFimDesc(Long usuarioId, Long simuladoId);

    /**
     * Busca o histórico completo de todas as vezes que o usuário tentou um simulado específico.
     */
    List<TentativaSimulado> findAllByUsuarioIdAndSimuladoId(Long usuarioId, Long simuladoId);

    /**
     * Retorna a quantidade de simulados ÚNICOS que o usuário já finalizou.
     * Se o usuário fez o Simulado A 3 vezes, contabiliza apenas 1.
     */
    @Query("""
                SELECT COUNT(DISTINCT t.simulado.id)
                FROM TentativaSimulado t
                WHERE t.usuario.id = :usuarioId AND t.finalizada = true
            """)
    long countSimuladosDistintosFinalizados(@Param("usuarioId") Long usuarioId);

    /**
     * Retorna a versão finalizada mais recente de *cada* simulado que o usuário já fez.
     * 
     * Detalhe de implementação: Utiliza uma subquery correlacionada filtrando pelo MAX(dataFim)
     * do mesmo simulado para garantir que retorne apenas a nota mais atual caso ele
     * tenha refeito a prova.
     *
     * @param usuarioId ID do usuário
     * @return Lista das últimas tentativas ativas por simulado para exibição no painel.
     */
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

    /**
     * Calcula o percentual médio de aproveitamento de um usuário em todos os simulados.
     * A regra de negócio exige que apenas a ÚLTIMA tentativa finalizada de cada simulado
     * seja considerada, evitando distorções caso o usuário refaça uma prova várias vezes.
     *
     * @return Média percentual (0 a 100), ou null se nenhum simulado foi finalizado.
     */
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

    /**
     * Gera o ranking (Leaderboard) de um simulado específico.
     * Retorna os usuários ordenados por pontuação descrescente e depois por acertos.
     * A subquery garante que se um usuário fizer o simulado 5 vezes, apenas a 
     * sua submissão mais recente concorrerá no ranking.
     */
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

    /**
     * Gera o Ranking Geral da plataforma agregando todas as métricas dos usuários.
     * 
     * Calcula a soma das pontuações, acertos e erros baseando-se sempre na submissão
     * mais recente de cada simulado por usuário.
     * 
     * @return Lista de Object[] projetados para mapeamento no DTO de Ranking Geral.
     */
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

    /**
     * Conta quantos usuários únicos finalizaram um simulado específico.
     */
    @Query("""
                SELECT COUNT(DISTINCT t.usuario.id)
                FROM TentativaSimulado t
                WHERE t.simulado.id = :simuladoId AND t.finalizada = true
            """)
    Integer countParticipantesBySimuladoId(@Param("simuladoId") Long simuladoId);

    /**
     * Conta quantos usuários únicos já finalizaram pelo menos um simulado na plataforma.
     */
    @Query("""
                SELECT COUNT(DISTINCT t.usuario.id)
                FROM TentativaSimulado t
                WHERE t.finalizada = true
            """)
    Integer countParticipantesGeral();

    /**
     * Retorna o total absoluto de vezes que o simulado foi feito (incluindo repetições de um mesmo usuário).
     */
    long countBySimuladoIdAndFinalizadaTrue(Long simuladoId);

    /**
     * Calcula a média global de acertos (percentual) de TODOS os participantes em um simulado.
     * Considera todas as tentativas realizadas, permitindo identificar o nível de dificuldade global do simulado.
     */
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
