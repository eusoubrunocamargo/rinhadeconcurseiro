package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.request.QuestaoImportRequest;
import br.com.rinhadeconcurseiro.dto.response.ImportacaoResultadoResponse;
import br.com.rinhadeconcurseiro.service.ImportacaoService;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final ImportacaoService importacaoService;

    @PostMapping("/importar/questoes")
    public ResponseEntity<@NonNull ImportacaoResultadoResponse> importarQuestoes(
            @Valid @RequestBody List<QuestaoImportRequest> questoes
    ) {

        log.info("Iniciando a importação de {} questões", questoes.size());

        ImportacaoResultadoResponse resultado = importacaoService.importarQuestoes(questoes);

        return ResponseEntity.ok(resultado);
    }
}
