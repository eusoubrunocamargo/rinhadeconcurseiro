package br.com.rinhadeconcurseiro.dto.response;

import br.com.rinhadeconcurseiro.enums.RespostaTipo;
import lombok.Builder;

@Builder
public record QuestaoResponse(
        Long id,
        String idTec,
        String link,
        String bancaOrgao,
        String materiaNome,
        String assuntoNome,
        String comando,
        String enunciado,
        RespostaTipo gabarito,
        String imagemUrl,
        Boolean hasLatex
) {
}
