package br.com.rinhadeconcurseiro.dto.response;

import br.com.rinhadeconcurseiro.enums.StatusConvite;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Builder
public record ConviteResponse(
        Long id,
        String token,
        UsuarioResponse remetente,
        StatusConvite status,
        LocalDateTime expiresAt,
        LocalDateTime createdAt
) {
}
