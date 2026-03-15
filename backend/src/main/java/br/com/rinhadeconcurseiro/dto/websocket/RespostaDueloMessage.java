package br.com.rinhadeconcurseiro.dto.websocket;

import jakarta.validation.constraints.NotNull;

public record RespostaDueloMessage(
        @NotNull Long dueloQuestaoId,
        String resposta
) {}
