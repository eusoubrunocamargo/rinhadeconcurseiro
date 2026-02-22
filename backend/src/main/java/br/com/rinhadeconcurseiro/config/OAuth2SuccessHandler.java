package br.com.rinhadeconcurseiro.config;

import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import br.com.rinhadeconcurseiro.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByGoogleId(googleId);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            log.info("Login bem-sucedido: {} (ID: {})", usuario.getEmail(), usuario.getId());

            // Gera o token JWT
            String token = jwtService.generateToken(googleId, email, usuario.getId());

            // Redireciona para o frontend com o token na URL
            String redirectUrl = frontendUrl + "/oauth/callback?token=" + token;
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } else {
            log.error("Usuário não encontrado para googleId: {}", googleId);
            getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=user_not_found");
        }
    }
}