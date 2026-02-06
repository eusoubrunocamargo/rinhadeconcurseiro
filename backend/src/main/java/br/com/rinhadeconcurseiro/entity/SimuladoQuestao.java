package br.com.rinhadeconcurseiro.entity;

import br.com.rinhadeconcurseiro.enums.CadernoTipo;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "simulado_questao", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"id_simulado", "id_questao"}),
        @UniqueConstraint(columnNames = {"id_simulado", "ordem"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimuladoQuestao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_simulado", nullable = false)
    private Simulado simulado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_questao", nullable = false)
    private Questao questao;

    @Column(nullable = false)
    private Integer ordem;

    @Enumerated(EnumType.STRING)
    @Column(length = 15, nullable = false)
    private CadernoTipo caderno;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

}
