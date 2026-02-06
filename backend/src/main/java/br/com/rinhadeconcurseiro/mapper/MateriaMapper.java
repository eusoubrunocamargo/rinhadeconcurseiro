package br.com.rinhadeconcurseiro.mapper;

import br.com.rinhadeconcurseiro.dto.response.MateriaResponse;
import br.com.rinhadeconcurseiro.entity.Materia;
import org.springframework.stereotype.Component;

@Component
public class MateriaMapper {

    public MateriaResponse toResponse(Materia materia, Long totalQuestoes) {

        if(materia == null) {
            return null;
        }

        return MateriaResponse.builder()
                .id(materia.getId())
                .nome(materia.getNome())
                .descricao(materia.getDescricao())
                .ativo(materia.getAtivo())
                .totalQuestoes(totalQuestoes)
                .build();
    }
}
