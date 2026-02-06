package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.request.UsuarioUpdateRequest;
import br.com.rinhadeconcurseiro.dto.response.UsuarioResponse;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.UsuarioMapper;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import br.com.rinhadeconcurseiro.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;

    @GetMapping("/me")
    public ResponseEntity<@NonNull UsuarioResponse> getUsuarioLogado
            (@AuthenticationPrincipal OidcUser oidcUser) {

        String googleId = oidcUser.getSubject();

        Usuario usuario = usuarioRepository.findByGoogleId(googleId)
                .orElseThrow(()-> new ResourceNotFoundException("Usuário não encontrado"));

        return ResponseEntity.ok(usuarioMapper.toResponse(usuario));
    }

    @PutMapping("/me/apelido")
    public ResponseEntity<@NonNull UsuarioResponse> atualizarApelido(
            @AuthenticationPrincipal OidcUser oidcUser,
            @Valid @RequestBody UsuarioUpdateRequest request) {

        String googleId = oidcUser.getSubject();

        Usuario usuario = usuarioRepository.findByGoogleId(googleId)
                .orElseThrow(()-> new ResourceNotFoundException("Usuário não encontrado"));

        UsuarioResponse response = usuarioService.atualizarApelido(usuario.getId(), request);

        return ResponseEntity.ok(response);

    }

}
