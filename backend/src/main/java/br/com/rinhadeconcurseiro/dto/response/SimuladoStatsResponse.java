package br.com.rinhadeconcurseiro.dto.response;

public record SimuladoStatsResponse(
        Long simuladoId,
        int totalFinalizados,
        double mediaDesempenho
) {
}
