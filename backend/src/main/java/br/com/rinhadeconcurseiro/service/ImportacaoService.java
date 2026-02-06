package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.request.QuestaoImportRequest;
import br.com.rinhadeconcurseiro.dto.response.ImportacaoResultadoResponse;
import br.com.rinhadeconcurseiro.entity.Assunto;
import br.com.rinhadeconcurseiro.entity.Materia;
import br.com.rinhadeconcurseiro.entity.Questao;
import br.com.rinhadeconcurseiro.enums.RespostaTipo;
import br.com.rinhadeconcurseiro.repository.QuestaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImportacaoService {

    private final QuestaoRepository questaoRepository;
    private final MateriaService materiaService;
    private final AssuntoService assuntoService;

    @Transactional
    public ImportacaoResultadoResponse importarQuestoes(List<QuestaoImportRequest> questoes) {

        int totalImportadas = 0;
        int totalIgnoradas = 0;
        List<String> erros = new ArrayList<>();

        for (int i = 0; i < questoes.size(); i++) {

            QuestaoImportRequest request = questoes.get(i);

            try {
                if(request.idTec() != null && questaoRepository.existsByIdTec(request.idTec())){
                    log.debug("Questão já existe: {}", request.idTec());
                    totalIgnoradas++;
                    continue;
                }

                Materia materia = materiaService.buscarOuCriar(request.materia().trim());

                Assunto assunto = null;
                if(request.assunto() != null && !request.assunto().isBlank()){
                    assunto = assuntoService.buscarOuCriar(materia, request.assunto().trim());
                }

                RespostaTipo gabarito = converterGabarito(request.gabarito());

                Questao questao = Questao.builder()
                        .materia(materia)
                        .assunto(assunto)
                        .idTec(request.idTec())
                        .link(request.link())
                        .bancaOrgao(request.bancaOrgao())
                        .comando(request.comando())
                        .enunciado(request.enunciado())
                        .gabarito(gabarito)
                        .imagemUrl(request.imagemUrl())
                        .hasLatex(request.hasLatex() != null ? request.hasLatex() : false)
                        .build();

                questaoRepository.save(questao);
                totalImportadas++;

                log.debug("Questão importada: {}", request.idTec());
            } catch (Exception e) {

                String erro = String.format("Linha %d (idTec=%s): %s",
                        i + 1, request.idTec(), e.getMessage());
                erros.add(erro);
                log.error("Erro ao importar questão: {}", erro);
            }
        }

        log.info("Importação finalizada: {} importadas, {} ignoradas, {} erros",
                totalImportadas, totalIgnoradas, erros.size());

        return ImportacaoResultadoResponse.builder()
                .totalRecebidas(questoes.size())
                .totalImportadas(totalImportadas)
                .totalIgnoradas(totalIgnoradas)
                .totalErros(erros.size())
                .erros(erros)
                .build();

    }

    private RespostaTipo converterGabarito(String gabarito) {
        if(gabarito == null || gabarito.isBlank()){
            throw new IllegalArgumentException("Gabarito não pode ser vazio");
        }

        String valor = gabarito.trim().toUpperCase();

        return switch (valor) {
            case "C", "CERTO", "V", "VERDADEIRO", "TRUE" -> RespostaTipo.CERTO;
            case "E", "ERRADO", "F", "FALSO", "FALSE" -> RespostaTipo.ERRADO;
            default -> throw new IllegalArgumentException("Gabarito inválido: " + gabarito);
        };
    }
}
