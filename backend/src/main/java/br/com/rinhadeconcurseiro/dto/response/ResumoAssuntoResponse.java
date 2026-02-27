package br.com.rinhadeconcurseiro.dto.response;

public record ResumoAssuntoResponse(
        Long assuntoId,
        String assuntoNome,
        int total,
        int acertos,
        int erros,
        double percentual
) {
}
