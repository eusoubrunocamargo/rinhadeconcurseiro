package br.com.rinhadeconcurseiro.controller;

import br.com.rinhadeconcurseiro.dto.websocket.RespostaDueloMessage;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.service.DueloGameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class DueloWebSocketController {

    private final DueloGameService dueloGameService;

    @MessageMapping("/duelo/{id}/responder")
    public void responder(
            @DestinationVariable Long id,
            @AuthenticationPrincipal Usuario usuario,
            @Payload @Valid RespostaDueloMessage message
            ) {

        dueloGameService.responder(id, usuario, message);
    }
}
