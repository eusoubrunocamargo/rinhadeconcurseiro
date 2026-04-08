package br.com.rinhadeconcurseiro.interage.dto;

public record FeedbackRespostaDto(
        boolean correto,
        String gabarito,
        String explicacao
) {
}
