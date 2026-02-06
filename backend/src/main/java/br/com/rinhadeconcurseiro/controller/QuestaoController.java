package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.response.QuestaoResponse;
import br.com.rinhadeconcurseiro.service.QuestaoService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/questoes")
@RequiredArgsConstructor
public class QuestaoController {

    private final QuestaoService questaoService;

    @GetMapping("/{id}")
    public ResponseEntity<@NonNull QuestaoResponse> buscarQuestaoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(questaoService.buscarPorId(id));
    }


    @GetMapping
    public ResponseEntity<@NonNull Page<@NonNull QuestaoResponse>> listarQuestoes(
            @RequestParam(required = false) Long materiaId,
            @RequestParam(required = false) Long assuntoId,
            Pageable pageable) {
        // ... service call would now return a Page
        return ResponseEntity.ok(questaoService.listarQuestoes(materiaId, assuntoId, pageable));
    }


//    @GetMapping("/materia/{materiaId}")
//    public ResponseEntity<List<QuestaoResponse>> listarPorMateria(@PathVariable Long materiaId) {
//        return ResponseEntity.ok(questaoService.listarPorMateria(materiaId));
//    }
//
//    @GetMapping("/assunto/{assuntoId}")
//    public ResponseEntity<List<QuestaoResponse>> listarPorAssunto(@PathVariable Long assuntoId){
//        return ResponseEntity.ok(questaoService.listarPorAssunto(assuntoId));
//    }

}
