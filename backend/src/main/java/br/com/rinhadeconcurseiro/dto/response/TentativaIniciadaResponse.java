package br.com.rinhadeconcurseiro.dto.response;

import java.time.LocalDateTime;

public record TentativaIniciadaResponse(
        Long tentativaId,
        Long simuladoId,
        String simuladoTitulo,
        Integer totalQuestoes,
        LocalDateTime dataInicio
) {
}
