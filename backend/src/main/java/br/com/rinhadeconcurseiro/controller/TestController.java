package br.com.rinhadeconcurseiro.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @GetMapping("/test-config")
    public String testConfig() {

        String masked = clientId != null && clientId.length() > 10
                ? clientId.substring(0, 10) + "..."
                : "Não configurado";

        return "Client ID: " + masked;
    }
}
