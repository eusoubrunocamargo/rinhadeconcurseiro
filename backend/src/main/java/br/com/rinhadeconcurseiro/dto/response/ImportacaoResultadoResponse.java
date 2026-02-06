package br.com.rinhadeconcurseiro.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record ImportacaoResultadoResponse(

        int totalRecebidas,
        int totalImportadas,
        int totalIgnoradas,
        int totalErros,
        List<String> erros

) {
}
