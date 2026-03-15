package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.DueloResposta;
import org.hibernate.validator.constraints.ParameterScriptAssert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DueloRespostaRepository
    extends JpaRepository<DueloResposta, Long> {

    List<DueloResposta> findByDueloQuestaoId(Long dueloQuestaoId);

    //verifica se um usuário já respondeu a uma questão específica
    // segunda linha de defesa além da constraint UNIQUE do banco
    boolean existsByDueloQuestaoIdAndUsuarioId(Long dueloQuestaoId, Long usuarioId);

    //carrega em batch todas as respostas de um usuário específico
    //para um conjunto de questões do duelo. Usado no relatório de impressão
    @Query("SELECT r FROM DueloResposta r WHERE r.dueloQuestao.id IN :questaoIds AND r.usuario.id = :usuarioId")
    List<DueloResposta> findByDueloQuestaoIdsAndUsuarioId(
            @Param("questaoIds") List<Long> questaoIds,
            @Param("usuarioId") Long usuarioId
    );
}
