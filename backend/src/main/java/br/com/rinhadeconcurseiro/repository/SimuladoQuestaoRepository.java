package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.SimuladoQuestao;
import br.com.rinhadeconcurseiro.enums.CadernoTipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimuladoQuestaoRepository extends JpaRepository<SimuladoQuestao, Long> {

    List<SimuladoQuestao> findBySimuladoIdOrderByOrdemAsc(Long simuladoId);

    List<SimuladoQuestao> findBySimuladoIdAndCadernoOrderByOrdemAsc(Long simuladoId, CadernoTipo caderno);

    long countBySimuladoId(Long simuladoId);

    long countBySimuladoIdAndCaderno(Long simuladoId, CadernoTipo caderno);

    boolean existsBySimuladoIdAndQuestaoId(Long simuladoId, Long questaoId);


}
