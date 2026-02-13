package br.com.rinhadeconcurseiro.dto.response;

import java.time.LocalDateTime;

public record TentativaResumoResponse(
        Long id,
        Long simuladoId,
        Integer simuladoNumero,
        String simuladoTitulo,
        LocalDateTime dataInicio,
        LocalDateTime dataFim,
        Boolean finalizada,
        Integer totalQuestoes,
        Integer respondidas,

        //métricas (se finalizada)
        Integer acertos,
        Integer erros,
        Integer emBranco,
        Integer pontuacao,
        Double percentualAcerto
) {
}
