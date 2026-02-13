package br.com.rinhadeconcurseiro.dto.response;

import br.com.rinhadeconcurseiro.enums.Caderno;

import java.util.List;

public record CadernoDetalheResponse(
        Caderno caderno,
        String titulo,
        String descricao,
        Integer totalQuestoes,
        List<RespostaDetalheResponse> questoes
) {
}
