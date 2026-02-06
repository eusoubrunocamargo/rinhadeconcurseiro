package br.com.rinhadeconcurseiro.mapper;

import br.com.rinhadeconcurseiro.dto.response.AssuntoResponse;
import br.com.rinhadeconcurseiro.entity.Assunto;
import org.springframework.stereotype.Component;

@Component
public class AssuntoMapper {

    public AssuntoResponse toResponse(Assunto assunto, Long totalQuestoes) {

        if(assunto == null) {
            return null;
        }

        return AssuntoResponse.builder()
                .id(assunto.getId())
                .materiaId(assunto.getMateria().getId())
                .nome(assunto.getNome())
                .descricao(assunto.getDescricao())
                .ativo(assunto.getAtivo())
                .totalQuestoes(totalQuestoes)
                .build();
    }
}
