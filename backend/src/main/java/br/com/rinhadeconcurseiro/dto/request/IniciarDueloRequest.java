package br.com.rinhadeconcurseiro.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IniciarDueloRequest(

        @NotNull(message = "O número de questões é obrigatório.")
        @Min(value = 10, message = "O duelo precisa ter no mínimo 3 questões." )
        @Max(value = 50, message = "O duelo pode ter no máximo 50 questões.")
        Integer totalQuestoes,

        @NotBlank(message = "O tipo de filtro é obrigatório.")
        String tipoFiltro,

        @NotNull(message = "O ID do filtro é obrigatório.")
        Long filtroId
) {}
