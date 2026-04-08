package br.com.rinhadeconcurseiro.interage.repository;

import br.com.rinhadeconcurseiro.interage.entity.ProgressoMundo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProgressoMundoRepository
extends JpaRepository<ProgressoMundo, Long> {
    Optional<ProgressoMundo> findByUsuarioIdAndMundoId(
            Long usuarioId,
            Long mundoId
    );
}
