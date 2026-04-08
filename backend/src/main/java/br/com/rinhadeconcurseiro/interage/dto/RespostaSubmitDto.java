package br.com.rinhadeconcurseiro.interage.dto;

import br.com.rinhadeconcurseiro.interage.entity.Resposta;

public record RespostaSubmitDto(
        Long exercicioId,
        Long questaoClassificadaId,
        Resposta.Bloco bloco,
        Short rodada,
        Short tentativaDesafio,
        String respostaDada
) {
}
