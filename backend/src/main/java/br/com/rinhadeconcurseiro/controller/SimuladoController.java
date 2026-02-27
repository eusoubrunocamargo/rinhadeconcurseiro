package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.response.SimuladoDetalheResponse;
import br.com.rinhadeconcurseiro.dto.response.SimuladoQuestaoResponse;
import br.com.rinhadeconcurseiro.dto.response.SimuladoQuestaoResumoResponse;
import br.com.rinhadeconcurseiro.dto.response.SimuladoResumoResponse;
import br.com.rinhadeconcurseiro.enums.CadernoTipo;
import br.com.rinhadeconcurseiro.repository.SimuladoQuestaoRepository;
import br.com.rinhadeconcurseiro.service.SimuladoService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/simulados")
@RequiredArgsConstructor
public class SimuladoController {

    private final SimuladoService simuladoService;
    private final SimuladoQuestaoRepository simuladoQuestaoRepository;


    /**
     * Lista todos os simulados ativos (disponíveis e futuros).
     * O frontend decide o que exibir baseado na data de disponibilidade.
     */
    @GetMapping
    public ResponseEntity<@NonNull List<SimuladoResumoResponse>> listarTodos() {
        List<SimuladoResumoResponse> simulados = simuladoService.listarTodos();
        return ResponseEntity.ok(simulados);
    }

    /**
     * Busca o simulado do dia atual.
     */
    @GetMapping("/hoje")
    public ResponseEntity<@NonNull SimuladoResumoResponse> buscarSimuladoHoje() {
        SimuladoResumoResponse simulado = simuladoService.buscarSimuladoHoje();
        return ResponseEntity.ok(simulado);
    }

    /**
     * Busca o próximo simulado agendado.
     */
    @GetMapping("/proximo")
    public ResponseEntity<@NonNull SimuladoResumoResponse> buscarProximoSimulado() {
        SimuladoResumoResponse simulado = simuladoService.buscarProximoSimulado();
        return ResponseEntity.ok(simulado);
    }

    /**
     * Busca simulado por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<@NonNull SimuladoResumoResponse> buscarPorId(@PathVariable Long id) {
        SimuladoResumoResponse simulado = simuladoService.buscarPorId(id);
        return ResponseEntity.ok(simulado);
    }

    /**
     * Busca simulado por ID com todas as questões.
     */
    @GetMapping("/{id}/detalhes")
    public ResponseEntity<@NonNull SimuladoDetalheResponse> buscarComQuestoes(@PathVariable Long id) {
        SimuladoDetalheResponse simulado = simuladoService.buscarComQuestoes(id);
        return ResponseEntity.ok(simulado);
    }

    /**
     * Busca questões de um simulado.
     * Pode filtrar por caderno usando query param: ?caderno=BASICO ou ?caderno=ESPECIFICO
     */
    @GetMapping("/{id}/questoes")
    public ResponseEntity<@NonNull List<SimuladoQuestaoResponse>> buscarQuestoes(
            @PathVariable Long id,
            @RequestParam(required = false) CadernoTipo caderno
    ) {
        List<SimuladoQuestaoResponse> questoes;

        if (caderno != null) {
            questoes = simuladoService.buscarQuestoesPorCaderno(id, caderno);
        } else {
            questoes = simuladoService.buscarQuestoes(id);
        }

        return ResponseEntity.ok(questoes);
    }

    // ─────────────────────────────────────────────────────────────────────────────
// 1) ADICIONAR ao controller de simulados (SimuladoController ou TentativaSimuladoController)
//    Injetar SimuladoQuestaoRepository se ainda não estiver presente.
// ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/simulados/{simuladoId}/questoes")
    public ResponseEntity<List<SimuladoQuestaoResumoResponse>> listarQuestoes(
            @PathVariable Long simuladoId) {

        List<SimuladoQuestaoResumoResponse> questoes = simuladoQuestaoRepository
                .findBySimuladoIdOrderByOrdemAsc(simuladoId)
                .stream()
                .map(sq -> new SimuladoQuestaoResumoResponse(
                        sq.getId(),
                        sq.getQuestao().getMateria().getNome()
                ))
                .toList();

        return ResponseEntity.ok(questoes);
    }
}