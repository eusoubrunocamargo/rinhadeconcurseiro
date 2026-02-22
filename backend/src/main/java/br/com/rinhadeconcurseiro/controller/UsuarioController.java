package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.request.UsuarioUpdateRequest;
import br.com.rinhadeconcurseiro.dto.response.UsuarioResponse;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.mapper.UsuarioMapper;
import br.com.rinhadeconcurseiro.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioMapper usuarioMapper;

    @GetMapping("/me")
    public ResponseEntity<@NonNull UsuarioResponse> getUsuarioLogado(
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(usuarioMapper.toResponse(usuario));
    }

    @PutMapping("/me/apelido")
    public ResponseEntity<@NonNull UsuarioResponse> atualizarApelido(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody UsuarioUpdateRequest request) {

        UsuarioResponse response = usuarioService.atualizarApelido(usuario.getId(), request);

        return ResponseEntity.ok(response);
    }
}