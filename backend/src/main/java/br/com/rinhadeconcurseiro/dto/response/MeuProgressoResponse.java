package br.com.rinhadeconcurseiro.dto.response;

public record MeuProgressoResponse(
        Integer simuladosEmAndamento,
        Integer simuladosFinalizados,
        Double mediaAproveitamento,
        CadernoResumoResponse cadernos
) {
}
