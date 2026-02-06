package br.com.rinhadeconcurseiro.mapper;

import br.com.rinhadeconcurseiro.dto.response.QuestaoResponse;
import br.com.rinhadeconcurseiro.entity.Questao;
import org.springframework.stereotype.Component;

@Component
public class QuestaoMapper {

    public QuestaoResponse toResponse(Questao questao) {

        if(questao == null) {
            return null;
        }

        return QuestaoResponse.builder()
                .id(questao.getId())
                .idTec(questao.getIdTec())
                .link(questao.getLink())
                .bancaOrgao(questao.getBancaOrgao())
                .materiaNome(questao.getMateria().getNome())
                .assuntoNome(questao.getAssunto() != null ? questao.getAssunto().getNome() : null)
                .comando(questao.getComando())
                .enunciado(questao.getEnunciado())
                .gabarito(questao.getGabarito())
                .imagemUrl(questao.getImagemUrl())
                .hasLatex(questao.getHasLatex())
                .build();
    }
}
