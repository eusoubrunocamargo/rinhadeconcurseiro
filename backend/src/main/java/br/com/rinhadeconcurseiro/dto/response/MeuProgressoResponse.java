package br.com.rinhadeconcurseiro.dto.response;

import java.util.List;
import java.util.Map;

public record MeuProgressoResponse(
        Integer simuladosEmAndamento,
        Integer simuladosFinalizados,
        Double mediaAproveitamento,
        CadernoResumoResponse cadernos,

        // chave: "vermelho" | "amarelo" | "verde"
        // TOP 5 por volume de questões
        Map<String, List<ResumoAssuntoResponse>> topAssuntos
) {
}
