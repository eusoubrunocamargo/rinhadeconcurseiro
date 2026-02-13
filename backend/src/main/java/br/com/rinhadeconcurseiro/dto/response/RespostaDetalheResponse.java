package br.com.rinhadeconcurseiro.dto.response;

import br.com.rinhadeconcurseiro.enums.*;

public record RespostaDetalheResponse(
        Long id,
        Long simuladoQuestaoId,
        Integer ordem,
        Long questaoId,
        String materiaNome,
        String assuntoNome,
        String comando,

        //resposta do usuário
        RespostaTipo resposta,
        NivelConfianca confianca,
        TipoErro tipoErro,

        //gabarito e classificação
        RespostaTipo gabarito,
        Boolean acertou,
        TipoResultado tipoResultado,
        Caderno caderno
) {
}
