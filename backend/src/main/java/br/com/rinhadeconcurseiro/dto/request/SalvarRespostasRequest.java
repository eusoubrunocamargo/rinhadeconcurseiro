package br.com.rinhadeconcurseiro.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SalvarRespostasRequest(
        @NotEmpty(message = "Lista de respostas não pode estar vazia")
        @Valid
        List<RespostaRequest> respostas
) {
}
