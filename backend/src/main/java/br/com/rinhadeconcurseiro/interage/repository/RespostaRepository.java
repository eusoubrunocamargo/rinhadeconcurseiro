package br.com.rinhadeconcurseiro.interage.repository;

import br.com.rinhadeconcurseiro.interage.entity.Resposta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface RespostaRepository
extends JpaRepository<Resposta, Long> {

    //contar acertos de um usuário em uma fase/bloco/rodada específica
    @Query("""
            SELECT COUNT(r) FROM Resposta r
            WHERE r.usuario.id = :usuarioId
            AND r.fase.id = :faseId
            AND r.bloco = :bloco    
            AND r.rodada = :rodada
            AND r.correto = true
            """)
    int contarAcertos(
            Long usuarioId,
            Long faseId,
            Resposta.Bloco bloco,
            Short rodada
    );

    //contar acertos totais da prática (rodadas 1+2+3) - usado no checkpoint
    @Query("""
            SELECT COUNT(r) FROM Resposta r
            WHERE r.usuario.id = :usuarioId
            AND r.fase.id = :faseId
            AND r.bloco = 'PRATICA'
            AND r.correto = true
            """)
    int contarAcertosPraticaTotal(
            Long usuarioId,
            Long faseId
    );

    //apagar respostas da prática ao resetar (evita acumulação entre tentativas)
    @Modifying
    @Query("DELETE FROM Resposta r WHERE r.usuario.id = :usuarioId AND r.fase.id = :faseId AND r.bloco = 'PRATICA'")
    void deletePraticaByUsuarioIdAndFaseId(Long usuarioId, Long faseId);

    //contar acertos do desafio em uma tentativa específica
    @Query("""
            SELECT COUNT(r) FROM Resposta r
            WHERE r.usuario.id = :usuarioId
            AND r.fase.id = :faseId
            AND r.bloco = 'DESAFIO'
            AND r.tentativaDesafio = :tentativa
            AND r.correto = true
            """)
    int contarAcertosDesafio(
            Long usuarioId,
            Long faseId,
            Short tentativa
    );

}
