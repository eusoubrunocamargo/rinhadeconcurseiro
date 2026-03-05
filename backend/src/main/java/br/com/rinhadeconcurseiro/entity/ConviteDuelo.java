// ConviteDuelo.java
package br.com.rinhadeconcurseiro.entity;

import br.com.rinhadeconcurseiro.enums.StatusConvite;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "convite_duelo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConviteDuelo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // O UUID é gerado no Java antes do INSERT, garantindo que podemos
    // retorná-lo ao cliente sem precisar de um SELECT adicional.
    @Column(nullable = false, unique = true)
    private UUID token;

    // FetchType.LAZY é o padrão correto para relacionamentos — o JPA só
    // carrega o Usuario se você acessar explicitamente o campo.
    // Sem isso, cada ConviteDuelo carregaria dois Usuarios automaticamente.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_remetente", nullable = false)
    private Usuario remetente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_destinatario", nullable = false)
    private Usuario destinatario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusConvite status;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // Preenchido apenas quando o convite é consumido (aceito ou recusado).
    // Serve como registro de auditoria — sabemos exatamente quando aconteceu.
    @Column(name = "usado_em")
    private LocalDateTime usadoEm;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Método utilitário que encapsula a regra de validade do convite.
    // Centralizar aqui evita duplicar esta lógica no service e em testes.
    public boolean isValido() {
        return this.status == StatusConvite.PENDENTE
                && LocalDateTime.now().isBefore(this.expiresAt);
    }
}