package br.com.rinhadeconcurseiro.dto.response;

import lombok.Builder;

@Builder
public record MateriaResponse(
        Long id,
        String nome,
        String descricao,
        Boolean ativo,
        Long totalQuestoes
) {
}
