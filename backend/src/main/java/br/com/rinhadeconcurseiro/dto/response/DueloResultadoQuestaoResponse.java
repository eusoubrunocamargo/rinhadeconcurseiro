package br.com.rinhadeconcurseiro.dto.response;

public record DueloResultadoQuestaoResponse(
        Integer ordem,
        String enunciado,
        String materiaNome,
        String assuntoNome,
        String gabarito,
        String minhaResposta,
        Boolean acertou
) {
}
