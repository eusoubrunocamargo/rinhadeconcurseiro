package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.DueloResposta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DueloRespostaRepository
    extends JpaRepository<DueloResposta, Long> {

    List<DueloResposta> findByDueloQuestaoId(Long dueloQuestaoId);

    //verifica se um usuário já respondeu a uma questão específica
    // segunda linha de defesa além da constraint UNIQUE do banco
    boolean existsByDueloQuestaoIdAndUsuarioId(Long dueloQuestaoId, Long usuarioId);
}
