package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.request.EnviarConviteRequest;
import br.com.rinhadeconcurseiro.dto.response.ConviteResponse;
import br.com.rinhadeconcurseiro.dto.response.DueloResponse;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.service.ConviteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/duelos")
@RequiredArgsConstructor
public class DueloController {

    private final ConviteService conviteService;

    @PostMapping("/convites")
    public ResponseEntity<ConviteResponse> enviarConvite(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody EnviarConviteRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conviteService.enviar(usuario, request.emailDestinatario()));
    }

    @GetMapping("/convites/{token}")
    public ResponseEntity<ConviteResponse> buscarConvite(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable UUID token) {

        return ResponseEntity.ok(conviteService.buscarPorToken(token, usuario));
    }

    @PostMapping("/convites/{token}/aceitar")
    public ResponseEntity<DueloResponse> aceitarConvite(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable UUID token) {

        return ResponseEntity.ok(conviteService.aceitar(token, usuario));
    }
}