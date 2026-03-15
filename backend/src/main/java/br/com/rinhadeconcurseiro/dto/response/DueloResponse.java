package br.com.rinhadeconcurseiro.dto.response;

import br.com.rinhadeconcurseiro.enums.StatusDuelo;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record DueloResponse(

        Long id,
        StatusDuelo status,
        UsuarioResponse host,
        UsuarioResponse desafiado,
        Integer totalQuestoes,
        Integer pontosHost,
        Integer pontosDesafiado,
        UsuarioResponse vencedor,
        LocalDateTime createdAt,
        LocalDateTime finalizadoEm
) {
}
