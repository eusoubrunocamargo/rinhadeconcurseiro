package br.com.rinhadeconcurseiro.interage.repository;

import br.com.rinhadeconcurseiro.interage.entity.ProgressoFase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProgressoFaseRepository
extends JpaRepository<ProgressoFase, Long> {

    Optional<ProgressoFase> findByUsuarioIdAndFaseId(
            Long usuarioId,
            Long faseId
    );

    List<ProgressoFase> findAllByUsuarioIdAndFase_Mundo_Id(
            Long usuarioId,
            Long mundoId
    );

    //reset
    @Modifying
    @Query("""
            UPDATE ProgressoFase pf
            SET pf.bloco1Concluido = false,
                pf.rodada1Concluida = false,
                pf.rodada2Concluida = false,
                pf.rodada3Concluida = false,
                pf.desafioTentativas = 0,
                pf.desafioConcluido = false,
                pf.scorePratica = null,
                pf.scoreDesafioT1 = null,
                pf.scoreDesafioT2 = null,
                pf.concluidaEm = null,
                pf.ultimaAtividadeEm = current_timestamp
            WHERE pf.usuario.id = :usuarioId
            AND pf.fase.mundo.id = :mundoId
            """)
    void resetarFasesPorMundo(Long usuarioId, Long mundoId);
}
