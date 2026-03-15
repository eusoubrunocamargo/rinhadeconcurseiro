package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.ConviteDuelo;
import br.com.rinhadeconcurseiro.enums.StatusConvite;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConviteDueloRepository extends JpaRepository<ConviteDuelo, Long> {

    Optional<ConviteDuelo> findByToken(UUID token);

    // Lock pessimista para o fluxo de aceite — impede race condition
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM ConviteDuelo c WHERE c.token = :token")
    Optional<ConviteDuelo> findByTokenWithLock(@Param("token") UUID token);

    // Verifica existência de convite pendente E ainda dentro do prazo
    // entre dois usuários específicos (em qualquer direção)
    @Query("""
    SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
    FROM ConviteDuelo c
    WHERE c.status = :status
      AND c.expiresAt > CURRENT_TIMESTAMP
      AND (
          (c.remetente.id = :remetenteId AND c.destinatario.id = :destinatarioId)
          OR
          (c.remetente.id = :destinatarioId AND c.destinatario.id = :remetenteId)
      )
    """)
    boolean existsPendenteValido(
            @Param("remetenteId") Long remetenteId,
            @Param("destinatarioId") Long destinatarioId,
            @Param("status") StatusConvite status
    );

    // Para o polling do frontend — convites pendentes recebidos pelo usuário
    List<ConviteDuelo> findByDestinatarioIdAndStatus(Long destinatarioId, StatusConvite status);

    Optional<ConviteDuelo> findByRemetenteIdAndStatus(Long remetenteId, StatusConvite status);
}
