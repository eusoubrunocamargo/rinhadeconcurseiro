package br.com.rinhadeconcurseiro.interage.dto;

import br.com.rinhadeconcurseiro.interage.entity.QuestaoClassificada;

public record QuestaoClassificadaDto(
        Long id,
        String questaoExternaId,
        String bloco,
        String classificadoPor
) {
    public static QuestaoClassificadaDto from(QuestaoClassificada q){
        return new QuestaoClassificadaDto(
                q.getId(),
                q.getQuestaoExternaId(),
                q.getBloco().name(),
                q.getClassificadoPor().name()
        );
    }
}
