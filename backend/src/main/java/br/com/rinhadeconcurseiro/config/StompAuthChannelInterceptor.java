package br.com.rinhadeconcurseiro.config;

import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import br.com.rinhadeconcurseiro.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor
    implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel){
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        //validar somente no CONNECT - msg posterior herdam
        if(accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader = accessor.getFirstNativeHeader("Authorization");

            //rejeitar token invalido, lancar excecao e fechar conexao
            if (authHeader == null || !authHeader.startsWith("Bearer")) {
                throw new IllegalStateException("Token JWT ausente ou mal formatado.");
            }

            String token = authHeader.substring(7);

            if (!jwtService.isTokenValid(token)) {
                throw new IllegalStateException("Token JWT inválido ou expirado.");
            }

            Long usuarioId = jwtService.getUsuarioIdFromToken(token);
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            //registra usuario --> principal na sessão WS
            //@messagemapping pode acessar o usuario autenticado via @authPrincipal
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            usuario,
                            null,
                            Collections.emptyList()
                    );

            accessor.setUser(auth);
            log.debug("WebSocket autenticado: usuário {} conectado.", usuario.getEmail());
        }

        return message;

    }
}
