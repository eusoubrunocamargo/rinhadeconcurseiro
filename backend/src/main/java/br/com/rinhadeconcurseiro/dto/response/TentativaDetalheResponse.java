package br.com.rinhadeconcurseiro.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record TentativaDetalheResponse(
        Long id,
        Long simuladoId,
        Integer simuladoNumero,
        String simuladoTitulo,
        LocalDateTime dataInicio,
        LocalDateTime dataFim,
        Boolean finalizada,

        //métricas
        Integer totalQuestoes,
        Integer acertos,
        Integer erros,
        Integer emBranco,
        Integer pontuacao,
        Double percentualAcerto,

        //respostas
        List<RespostaDetalheResponse> respostas,

        //contagem por caderno
        Integer totalVermelho,
        Integer totalAmarelo,
        Integer totalVerde
) {
}
