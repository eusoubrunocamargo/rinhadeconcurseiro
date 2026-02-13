package br.com.rinhadeconcurseiro.dto.request;

import br.com.rinhadeconcurseiro.enums.NivelConfianca;
import br.com.rinhadeconcurseiro.enums.RespostaTipo;
import br.com.rinhadeconcurseiro.enums.TipoErro;

public record RespostaRequest(
        Long simuladoQuestaoId,
        RespostaTipo resposta,
        NivelConfianca confianca,
        TipoErro tipoErro
) {}
