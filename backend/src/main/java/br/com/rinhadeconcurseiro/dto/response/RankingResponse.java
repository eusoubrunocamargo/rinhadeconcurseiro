package br.com.rinhadeconcurseiro.dto.response;

import java.util.List;

public record RankingResponse(
        String tipo,
        Long simuladoId,
        String simuladoTitulo,
        Integer totalParticipantes,
        List<RankingItemResponse> ranking,
        RankingItemResponse currentUserPosition
) {
}
