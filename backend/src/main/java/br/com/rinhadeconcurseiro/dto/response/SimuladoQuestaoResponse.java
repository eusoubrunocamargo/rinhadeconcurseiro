package br.com.rinhadeconcurseiro.dto.response;

import br.com.rinhadeconcurseiro.enums.CadernoTipo;
import br.com.rinhadeconcurseiro.enums.RespostaTipo;
import lombok.Builder;

@Builder
public record SimuladoQuestaoResponse(
        Long id,
        Integer ordem,
        CadernoTipo caderno,

        //dados da questão
        Long questaoId,
        String materiaNome,
        String assuntoNome,
        String comando,
        String enunciado,
        String imagemUrl,

        //gabarito ao front para validação local
        RespostaTipo gabarito
) {
}
