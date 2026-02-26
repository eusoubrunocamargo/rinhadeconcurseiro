package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import br.com.rinhadeconcurseiro.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AgentAuthController {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder bcryptEncoder;

    public record AgentLoginRequest(String username, String password) {
    }

    public record AgentLoginResponse(String token, Long usuarioId, String nome) {
    }

    @PostMapping("/agent/login")
    public ResponseEntity<?> login(@RequestBody AgentLoginRequest request) {

        // Busca por email (username = email do agente)
        Usuario usuario = usuarioRepository.findByEmail(request.username())
                .orElse(null);

        // Só agentes podem usar este endpoint
        if (usuario == null
                || !"AGENT".equals(usuario.getRole())
                || usuario.getPasswordHash() == null) {
            return ResponseEntity.status(401).body("Credenciais inválidas.");
        }

        if (!bcryptEncoder.matches(request.password(), usuario.getPasswordHash())) {
            return ResponseEntity.status(401).body("Credenciais inválidas.");
        }

        // Gera JWT usando o mesmo método do OAuth — o filtro JWT existente aceita sem modificação
        String token = jwtService.generateToken(
                usuario.getGoogleId(),   // googleId sintético: "AGENT_001", etc.
                usuario.getEmail(),
                usuario.getId()
        );

        return ResponseEntity.ok(new AgentLoginResponse(token, usuario.getId(), usuario.getNome()));
    }
}