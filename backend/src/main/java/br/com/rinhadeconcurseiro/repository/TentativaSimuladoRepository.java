package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.TentativaSimulado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TentativaSimuladoRepository extends JpaRepository<TentativaSimulado, Long> {

    //buscar tentativas em andamento do usuário
    List<TentativaSimulado> findByUsuarioIdAndFinalizadaFalseOrderByDataInicioDesc(Long usuarioId);

    //buscar tentativas finalizadas do usuário
    List<TentativaSimulado> findByUsuarioIdAndFinalizadaTrueOrderByDataFimDesc(Long usuarioId);

    //buscar tentativa específica do usuário
    Optional<TentativaSimulado> findByIdAndUsuarioId(Long id, Long usuarioId);

    //verificar se o usuário tem tentativa em andamento para um simulado
    Optional<TentativaSimulado> findByUsuarioIdAndSimuladoIdAndFinalizadaFalse(Long usuarioId, Long simuladoId);

    //contar tentativas finalizadas do usuário
    long countByUsuarioIdAndFinalizadaTrue(Long usuarioId);

    //buscar última tentativa finalizada de um simulado
    Optional<TentativaSimulado> findFirstByUsuarioIdAndSimuladoIdAndFinalizadaTrueOrderByDataFimDesc(Long usuarioId, Long simuladoId);

    //calcular média de aproveitamento do usuário
    @Query("""
            SELECT COALESCE(AVG(
                CASE WHEN (t.acertos + t.erros) > 0 THEN (t.acertos * 100.0) / (t.acertos + t.erros)
                ELSE 0
                END
            ), 0)
            FROM TentativaSimulado t
            WHERE t.usuario.id = :usuarioId
            AND t.finalizada = true
            """)
    Double calcularMediaAproveitamento(@Param("usuarioId") Long usuarioId);
}
