package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.response.RankingResponse;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import br.com.rinhadeconcurseiro.service.RankingService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/geral")
    public ResponseEntity<@NonNull RankingResponse> getRankingGeral(
            @AuthenticationPrincipal OidcUser oidcUser) {

        Long usuarioId = getUsuarioId(oidcUser);
        return ResponseEntity.ok(rankingService.getRankingGeral(usuarioId));
    }

    @GetMapping("/simulado/{simuladoId}")
    public ResponseEntity<@NonNull RankingResponse> getRankingPorSimulado(
            @PathVariable Long simuladoId,
            @AuthenticationPrincipal OidcUser oidcUser) {

        Long usuarioId = getUsuarioId(oidcUser);
        return ResponseEntity.ok(rankingService.getRankingPorSimulado(simuladoId, usuarioId));
    }

    private Long getUsuarioId(OidcUser oidcUser) {
        String googleId = oidcUser.getSubject();
        Usuario usuario = usuarioRepository.findByGoogleId(googleId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return usuario.getId();
    }
}