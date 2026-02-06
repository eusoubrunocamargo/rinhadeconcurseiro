package br.com.rinhadeconcurseiro.mapper;

import br.com.rinhadeconcurseiro.dto.response.SimuladoDetalheResponse;
import br.com.rinhadeconcurseiro.dto.response.SimuladoQuestaoResponse;
import br.com.rinhadeconcurseiro.dto.response.SimuladoResumoResponse;
import br.com.rinhadeconcurseiro.entity.Simulado;
import br.com.rinhadeconcurseiro.entity.SimuladoQuestao;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SimuladoMapper {

    public SimuladoResumoResponse toResumoResponse(Simulado simulado) {
        if (simulado == null) {
            return null;
        }

        return SimuladoResumoResponse.builder()
                .id(simulado.getId())
                .numero(simulado.getNumero())
                .titulo(simulado.getTitulo())
                .dataDisponivel(simulado.getDataDisponivel())
                .totalQuestoes(simulado.getTotalQuestoes())
                .questoesBasicas(simulado.getQuestoesBasicas())
                .questoesEspecificas(simulado.getQuestoesEspecificas())
                .build();
    }

    public List<SimuladoResumoResponse> toResumoResponseList(List<Simulado> simulados) {
        return simulados.stream()
                .map(this::toResumoResponse)
                .toList();
    }

    public SimuladoDetalheResponse toDetalheResponse(Simulado simulado, List<SimuladoQuestao> questoes) {
        if (simulado == null) {
            return null;
        }

        return SimuladoDetalheResponse.builder()
                .id(simulado.getId())
                .numero(simulado.getNumero())
                .titulo(simulado.getTitulo())
                .dataDisponivel(simulado.getDataDisponivel())
                .totalQuestoes(simulado.getTotalQuestoes())
                .questoesBasicas(simulado.getQuestoesBasicas())
                .questoesEspecificas(simulado.getQuestoesEspecificas())
                .questoes(toQuestaoResponseList(questoes))
                .build();
    }

    public SimuladoQuestaoResponse toQuestaoResponse(SimuladoQuestao simuladoQuestao) {
        if (simuladoQuestao == null) {
            return null;
        }

        var questao = simuladoQuestao.getQuestao();

        return SimuladoQuestaoResponse.builder()
                .id(simuladoQuestao.getId())
                .ordem(simuladoQuestao.getOrdem())
                .caderno(simuladoQuestao.getCaderno())
                .questaoId(questao.getId())
                //.idTec(questao.getIdTec())
                .materiaNome(questao.getMateria().getNome())
                .assuntoNome(questao.getAssunto() != null ? questao.getAssunto().getNome() : null)
                .comando(questao.getComando())
                .enunciado(questao.getEnunciado())
                .imagemUrl(questao.getImagemUrl())
                //.hasLatex(questao.getHasLatex())
                .gabarito(questao.getGabarito())
                .build();
    }

    public List<SimuladoQuestaoResponse> toQuestaoResponseList(List<SimuladoQuestao> questoes) {
        return questoes.stream()
                .map(this::toQuestaoResponse)
                .toList();
    }
}