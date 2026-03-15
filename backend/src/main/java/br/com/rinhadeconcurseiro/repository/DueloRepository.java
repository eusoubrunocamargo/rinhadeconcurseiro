package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.Duelo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DueloRepository
    extends JpaRepository<Duelo, Long> {

    //retorna todos os duelos do usuário, independente do papel
    //GET /api/v1/duelos/historico
    List<Duelo> findByHostIdOrDesafiadoId(Long hostId, Long desafiadoId);
}
