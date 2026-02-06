package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends OidcUserService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        log.info(">>> CustomOAuth2UserService.loadUser() INICIADO");

        OidcUser oidcUser = super.loadUser(userRequest);

        log.info(">>> Atributos recebidos do Google: {}", oidcUser.getAttributes());

        String googleId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String nome = oidcUser.getFullName();
        String fotoUrl = oidcUser.getPicture();

        log.info(">>> GoogleID: {}, Email: {}, Nome: {}", googleId, email, nome);

        try {
            Usuario usuario = usuarioRepository.findByGoogleId(googleId)
                    .map(existente -> {
                        log.info(">>> Usuário existente encontrado: {}", existente.getId());
                        return atualizarUsuarioExistente(existente, nome, fotoUrl);
                    })
                    .orElseGet(() -> {
                        log.info(">>> Criando novo usuário...");
                        return criarNovoUsuario(googleId, email, nome, fotoUrl);
                    });

            log.info(">>> Usuário salvo com ID: {}", usuario.getId());

        } catch (Exception e) {
            log.error(">>> ERRO ao salvar usuário: ", e);
            throw e;
        }

        log.info(">>> CustomOAuth2UserService.loadUser() FINALIZADO");
        return oidcUser;
    }

    private Usuario atualizarUsuarioExistente(Usuario usuario, String nome, String fotoUrl) {
        usuario.setNome(nome);
        usuario.setFotoUrl(fotoUrl);
        usuario.setUltimoAcesso(LocalDateTime.now());
        Usuario salvo = usuarioRepository.save(usuario);
        log.info(">>> Usuário atualizado: {}", salvo.getId());
        return salvo;
    }

    private Usuario criarNovoUsuario(String googleId, String email, String nome, String fotoUrl) {
        Usuario novoUsuario = Usuario.builder()
                .googleId(googleId)
                .email(email)
                .nome(nome)
                .fotoUrl(fotoUrl)
                .ativo(true)
                .build();

        Usuario salvo = usuarioRepository.save(novoUsuario);
        log.info(">>> Novo usuário criado com ID: {}", salvo.getId());
        return salvo;
    }
}