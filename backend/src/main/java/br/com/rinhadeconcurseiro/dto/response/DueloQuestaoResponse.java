package br.com.rinhadeconcurseiro.dto.response;

public record DueloQuestaoResponse(
        Long dueloQuestaoId,
        Integer ordem,
        String enunciado,
        String materiaNome,
        String assuntoNome
) {
}
