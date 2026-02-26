package br.com.rinhadeconcurseiro.dto.response;

public record EstatisticaAssuntoResponse(
        Long assuntoId,
        String assuntoNome,
        String materiaNome,
        int total,
        int acertos,
        int erros,
        double percentual,
        String tier
) {
}
