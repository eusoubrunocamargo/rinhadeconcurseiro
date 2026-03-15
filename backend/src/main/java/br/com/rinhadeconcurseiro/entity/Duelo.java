// Duelo.java
package br.com.rinhadeconcurseiro.entity;

import br.com.rinhadeconcurseiro.enums.StatusDuelo;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "duelo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Duelo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @OneToOne porque a constraint UNIQUE(id_convite) na migration garante
    // que um convite só pode originar um único duelo.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_convite", nullable = false, unique = true)
    private ConviteDuelo convite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_host", nullable = false)
    private Usuario host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_desafiado", nullable = false)
    private Usuario desafiado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusDuelo status;

    @Column(name = "total_questoes")
    private Integer totalQuestoes;

    @Builder.Default
    @Column(name = "pontos_host", nullable = false)
    private Integer pontosHost = 0;

    @Builder.Default
    @Column(name = "pontos_desafiado", nullable = false)
    private Integer pontosDesafiado = 0;

    // Null enquanto o duelo estiver em andamento.
    // Permanece null também em caso de empate após finalização.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vencedor")
    private Usuario vencedor;

    // Esta anotação é tudo que precisamos para o optimistic locking.
    // O JPA gerencia o incremento e a verificação automaticamente.
    @Version
    private Integer versao;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "finalizado_em")
    private LocalDateTime finalizadoEm;
}