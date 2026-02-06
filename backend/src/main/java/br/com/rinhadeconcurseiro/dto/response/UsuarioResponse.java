package br.com.rinhadeconcurseiro.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String apelido,
        String fotoUrl,
        LocalDateTime createdAt,
        LocalDateTime ultimoAcesso
) {
}
