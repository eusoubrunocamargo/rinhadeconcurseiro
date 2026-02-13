package br.com.rinhadeconcurseiro.dto.response;

public record CadernoResumoResponse(
        Integer totalVermelho,
        Integer totalAmarelo,
        Integer totalVerde,
        Integer totalQuestoes
) {
}
