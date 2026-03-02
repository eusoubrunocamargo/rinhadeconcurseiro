package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.request.FinalizarRequest;
import br.com.rinhadeconcurseiro.dto.request.RespostaRequest;
import br.com.rinhadeconcurseiro.dto.request.SalvarRespostasRequest;
import br.com.rinhadeconcurseiro.dto.response.*;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.enums.Caderno;
import br.com.rinhadeconcurseiro.service.TentativaSimuladoService;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TentativaSimuladoController {

    private final TentativaSimuladoService tentativaService;

    //==== Iniciar Simulado ==== //
    @PostMapping("/simulados/{simuladoId}/iniciar")
    public ResponseEntity<@NonNull TentativaIniciadaResponse> iniciar(
            @PathVariable Long simuladoId,
            @RequestParam(defaultValue = "false") boolean refazer,
            @AuthenticationPrincipal Usuario usuario) {

        TentativaIniciadaResponse response = tentativaService.iniciar(simuladoId, usuario.getId(), refazer);
        return ResponseEntity.ok(response);
    }

    //==== Meus Simulados ====//
    @GetMapping("/usuarios/me/simulados/em-andamento")
    public ResponseEntity<@NonNull List<TentativaResumoResponse>> listarEmAndamento(
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(tentativaService.listarEmAndamento(usuario.getId()));
    }

    @GetMapping("/usuarios/me/simulados/finalizados")
    public ResponseEntity<@NonNull List<TentativaResumoResponse>> listarFinalizados(
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(tentativaService.listarFinalizados(usuario.getId()));
    }

    @GetMapping("/usuarios/me/simulados/{tentativaId}")
    public ResponseEntity<@NonNull TentativaDetalheResponse> buscarPorId(
            @PathVariable Long tentativaId,
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(tentativaService.buscarPorId(tentativaId, usuario.getId()));
    }

    //==== Respostas ====//
    @PutMapping("/usuarios/me/simulados/{tentativaId}/respostas")
    public ResponseEntity<@NonNull Void> salvarRespostas(
            @PathVariable Long tentativaId,
            @Valid @RequestBody SalvarRespostasRequest request,
            @AuthenticationPrincipal Usuario usuario) {

        tentativaService.salvarRespostas(tentativaId, usuario.getId(), request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/usuarios/me/simulados/{tentativaId}/finalizar")
    public ResponseEntity<@NonNull TentativaDetalheResponse> finalizar(
            @PathVariable Long tentativaId,
            @RequestBody(required = false) @Valid FinalizarRequest request,
            @AuthenticationPrincipal Usuario usuario) {

        List<RespostaRequest> respostas = request != null ? request.respostas() : null;

        return ResponseEntity.ok(tentativaService.finalizar(tentativaId, usuario.getId(), respostas));
    }

    //==== Progresso e Cadernos ====//
    @GetMapping("/usuarios/me/progresso")
    public ResponseEntity<@NonNull MeuProgressoResponse> obterProgresso(
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(tentativaService.obterProgresso(usuario.getId()));
    }

    @GetMapping("/usuarios/me/cadernos")
    public ResponseEntity<@NonNull CadernoResumoResponse> obterResumoCadernos(
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(tentativaService.obterResumoCadernos(usuario.getId()));
    }

    @GetMapping("/usuarios/me/cadernos/{caderno}")
    public ResponseEntity<@NonNull CadernoDetalheResponse> obterCaderno(
            @PathVariable Caderno caderno,
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(tentativaService.obterCaderno(usuario.getId(), caderno));
    }

    // Sprint 2: resumo completo de assuntos de um caderno (sem limite de 5)
    // Endpoint: GET /api/v1/usuarios/me/cadernos/{caderno}/resumo

    @GetMapping("/usuarios/me/cadernos/{caderno}/resumo")
    public ResponseEntity<@NonNull List<ResumoAssuntoResponse>> resumoCaderno(
            @PathVariable Caderno caderno,
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(
                tentativaService.resumoAssuntosPorCaderno(usuario.getId(), caderno, Integer.MAX_VALUE)
        );
    }

    @GetMapping("/usuarios/me/estatisticas/assuntos")
    public ResponseEntity<@NonNull List<EstatisticaAssuntoResponse>> estatisticasAssuntos(
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(
                tentativaService.estatisticasGlobaisPorAssunto(usuario.getId())
        );
    }

    @GetMapping("/simulados/{simuladoId}/stats")
    public ResponseEntity<@NonNull SimuladoStatsResponse> obterStats(
            @PathVariable Long simuladoId) {

        return ResponseEntity.ok(tentativaService.obterStatsPorSimulado(simuladoId));
    }
}