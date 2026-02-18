package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.request.SalvarRespostasRequest;
import br.com.rinhadeconcurseiro.dto.response.*;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.enums.Caderno;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import br.com.rinhadeconcurseiro.service.TentativaSimuladoService;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TentativaSimuladoController {

    private final TentativaSimuladoService tentativaService;
    private final UsuarioRepository usuarioRepository;

    //==== Iniciar Simulado ==== //
    @PostMapping("/simulados/{simuladoId}/iniciar")
    public ResponseEntity<@NonNull TentativaIniciadaResponse> iniciar(
            @PathVariable Long simuladoId,
            @RequestParam(defaultValue = "false") boolean refazer,
            @AuthenticationPrincipal OidcUser oidcUser) {

        Long usuarioId = getUsuarioId(oidcUser);
        TentativaIniciadaResponse response = tentativaService.iniciar(simuladoId, usuarioId, refazer);
        return ResponseEntity.ok(response);
    }

    //==== Meus Simulados ====//
    @GetMapping("/usuarios/me/simulados/em-andamento")
    public ResponseEntity<@NonNull List<TentativaResumoResponse>> listarEmAndamento(
            @AuthenticationPrincipal OidcUser oidcUser) {

        Long usuarioId = getUsuarioId(oidcUser);
        return ResponseEntity.ok(tentativaService.listarEmAndamento(usuarioId));
    }

    @GetMapping("/usuarios/me/simulados/finalizados")
    public ResponseEntity<@NonNull List<TentativaResumoResponse>> listarFinalizados(
            @AuthenticationPrincipal OidcUser oidcUser) {

        Long usuarioId = getUsuarioId(oidcUser);
        return ResponseEntity.ok(tentativaService.listarFinalizados(usuarioId));
    }

    @GetMapping("/usuarios/me/simulados/{tentativaId}")
    public ResponseEntity<@NonNull TentativaDetalheResponse> buscarPorId(
            @PathVariable Long tentativaId,
            @AuthenticationPrincipal OidcUser oidcUser) {

        Long usuarioId = getUsuarioId(oidcUser);
        return ResponseEntity.ok(tentativaService.buscarPorId(tentativaId, usuarioId));
    }

    //==== Respostas ====//
    @PutMapping("/usuarios/me/simulados/{tentativaId}/respostas")
    public ResponseEntity<@NonNull Void> salvarRespostas(
            @PathVariable Long tentativaId,
            @Valid @RequestBody SalvarRespostasRequest request,
            @AuthenticationPrincipal OidcUser oidcUser) {

        Long usuarioId = getUsuarioId(oidcUser);
        tentativaService.salvarRespostas(tentativaId, usuarioId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/usuarios/me/simulados/{tentativaId}/finalizar")
    public ResponseEntity<@NonNull TentativaDetalheResponse> finalizar(
            @PathVariable Long tentativaId,
            @AuthenticationPrincipal OidcUser oidcUser){

        Long usuarioId = getUsuarioId(oidcUser);
        return ResponseEntity.ok(tentativaService.finalizar(tentativaId, usuarioId));
    }

    //==== Progresso e Cadernos ====//
    @GetMapping("/usuarios/me/progresso")
    public ResponseEntity<@NonNull MeuProgressoResponse> obterProgresso(
            @AuthenticationPrincipal OidcUser oidcUser){

        Long usuarioId = getUsuarioId(oidcUser);
        return ResponseEntity.ok(tentativaService.obterProgresso(usuarioId));
    }

    @GetMapping("/usuarios/me/cadernos")
    public ResponseEntity<@NonNull CadernoResumoResponse> obterResumoCadernos(
            @AuthenticationPrincipal OidcUser oidcUser){

        Long usuarioId = getUsuarioId(oidcUser);
        return ResponseEntity.ok(tentativaService.obterResumoCadernos(usuarioId));

    }

    @GetMapping("/usuarios/me/cadernos/{caderno}")
    public ResponseEntity<@NonNull CadernoDetalheResponse> obterCaderno(
            @PathVariable Caderno caderno,
            @AuthenticationPrincipal OidcUser oidcUser) {

        Long usuarioId = getUsuarioId(oidcUser);
        return ResponseEntity.ok(tentativaService.obterCaderno(usuarioId, caderno));
    }

    //===========
    // Helpers
    //===========
    private Long getUsuarioId(OidcUser oidcUser) {
        String googleId = oidcUser.getSubject();
        Usuario usuario = usuarioRepository.findByGoogleId(googleId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return usuario.getId();
    }
}
