package br.com.rinhadeconcurseiro.dto.response;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record SimuladoDetalheResponse(
        Long id,
        Integer numero,
        String titulo,
        LocalDate dataDisponivel,
        Integer totalQuestoes,
        Integer questoesBasicas,
        Integer questoesEspecificas,
        List<SimuladoQuestaoResponse> questoes
) {
}
