package br.com.rinhadeconcurseiro.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "google_id", nullable = false, unique = true, length = 50)
    private String googleId;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 30)
    private String apelido;

    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    // 'USER' para usuários reais (OAuth), 'AGENT' para agentes de simulação
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "USER";

    // Apenas agentes usam este campo — usuários OAuth deixam NULL
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "ultimo_acesso")
    private LocalDateTime ultimoAcesso;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}