package br.com.rinhadeconcurseiro.interage.dto;

import br.com.rinhadeconcurseiro.interage.enums.PontoRetomada;

import java.util.List;

public record SessaoFaseDto(
        Long faseId,
        String faseNome,
        PontoRetomada etapa,
        String conteudoIntroducaoHtml,
        List<ExercicioDto> exercicios,
        List<QuestaoClassificadaDto> questoes,
        Short tentativasDesafioConsumidas
) {
    public static SessaoFaseDto concluida(Long faseId, String faseNome){
        return new SessaoFaseDto(
                faseId,
                faseNome,
                PontoRetomada.CONCLUIDA,
                null,
                null,
                null,
                null
        );
    }
}
