// DueloQuestao.java
package br.com.rinhadeconcurseiro.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "duelo_questao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DueloQuestao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Lazy porque durante o jogo raramente precisamos carregar
    // todo o objeto Duelo ao acessar uma questão individual.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_duelo", nullable = false)
    private Duelo duelo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_questao", nullable = false)
    private Questao questao;

    @Column(nullable = false)
    private Integer ordem;

    // Controla se esta questão já foi processada.
    // A transição false → true deve ser feita atomicamente no banco.
    @Builder.Default
    @Column(nullable = false)
    private Boolean resolvida = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}