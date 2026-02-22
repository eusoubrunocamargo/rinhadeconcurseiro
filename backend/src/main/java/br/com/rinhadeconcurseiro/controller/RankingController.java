package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.response.RankingResponse;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.service.RankingService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping("/geral")
    public ResponseEntity<@NonNull RankingResponse> getRankingGeral(
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(rankingService.getRankingGeral(usuario.getId()));
    }

    @GetMapping("/simulado/{simuladoId}")
    public ResponseEntity<@NonNull RankingResponse> getRankingPorSimulado(
            @PathVariable Long simuladoId,
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(rankingService.getRankingPorSimulado(simuladoId, usuario.getId()));
    }
}