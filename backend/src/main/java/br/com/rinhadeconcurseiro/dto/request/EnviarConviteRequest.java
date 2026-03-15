package br.com.rinhadeconcurseiro.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EnviarConviteRequest(
        @NotBlank(message = "O e-mail do destinatário é obrigatório.")
        @Email(message = "Informe um e-mail válido")
        String emailDestinatario
) {}
