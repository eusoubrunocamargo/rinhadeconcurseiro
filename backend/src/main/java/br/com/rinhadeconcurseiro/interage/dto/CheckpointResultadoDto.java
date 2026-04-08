package br.com.rinhadeconcurseiro.interage.dto;

import br.com.rinhadeconcurseiro.interage.enums.ResultadoCheckpoint;

public record CheckpointResultadoDto(
        ResultadoCheckpoint resultado,
        int acertos,
        int total,
        String mensagem
) {
}
