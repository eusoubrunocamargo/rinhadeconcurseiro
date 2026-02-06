package br.com.rinhadeconcurseiro.dto.request;

import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(
        @Size(min = 3, max = 30, message = "Apelido deve ter entre 3 e 30 caracteres")
        String apelido
) {
}
