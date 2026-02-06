package br.com.rinhadeconcurseiro.dto.response;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record SimuladoResumoResponse(
        Long id,
        Integer numero,
        String titulo,
        LocalDate dataDisponivel,
        Integer totalQuestoes,
        Integer questoesBasicas,
        Integer questoesEspecificas
) {
}
