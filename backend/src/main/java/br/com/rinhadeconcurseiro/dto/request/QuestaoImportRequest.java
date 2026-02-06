package br.com.rinhadeconcurseiro.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuestaoImportRequest(

        String idTec,
        String link,
        String bancaOrgao,

        @NotBlank(message = "Matéria é obrigatória")
        String materia,

        String assunto,
        String comando,

        @NotBlank(message = "Enunciado é obrigatório")
        String enunciado,

        @NotNull(message = "Gabarito é obrigatório")
        String gabarito,

        String imagemUrl,

        Boolean hasLatex

) {
}
