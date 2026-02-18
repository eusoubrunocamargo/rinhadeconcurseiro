package br.com.rinhadeconcurseiro.dto.response;

public record RankingItemResponse(
        Integer posicao,
        Long usuarioId,
        String nome,
        String apelido,
        String fotoUrl,
        Integer pontuacao,
        Integer acertos,
        Integer errors,
        Integer emBranco,
        Double percentualAcerto,
        Integer simuladosFinalizados,
        Boolean isCurrentUser
) {
}
