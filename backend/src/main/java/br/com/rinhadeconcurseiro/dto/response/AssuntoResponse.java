package br.com.rinhadeconcurseiro.dto.response;

import lombok.Builder;

@Builder
public record AssuntoResponse(
        Long id,
        Long materiaId,
        String nome,
        String descricao,
        Boolean ativo,
        Long totalQuestoes
) {
}
