package br.com.rinhadeconcurseiro.interage.dto;

import br.com.rinhadeconcurseiro.interage.entity.Exercicio;

import java.util.List;

public record ExercicioDto(
        Long id,
        String bloco,
        Short rodada,
        Short ordemNaRodada,
        String tipo,
        String enunciado,
        String fraseContexto,
        String palavraAlvo,
        List<OpcaoDto> opcoes,
        String nivel
) {
    public static ExercicioDto from(Exercicio e){
        return new ExercicioDto(
                e.getId(),
                e.getBloco().name(),
                e.getRodada(),
                e.getOrdemNaRodada(),
                e.getTipo().name(),
                e.getEnunciado(),
                e.getFraseContexto(),
                e.getPalavraAlvo(),
                e.getOpcoes(),
                e.getNivel().name());
    }
}
