// DueloResposta.java
package br.com.rinhadeconcurseiro.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "duelo_resposta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DueloResposta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_duelo_questao", nullable = false)
    private DueloQuestao dueloQuestao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    // Resposta enviada pelo cliente: "CERTO", "ERRADO" ou null (em branco).
    // VARCHAR no banco, String no Java — sem enum aqui para flexibilidade.
    @Column(length = 10)
    private String resposta;

    // Calculado pelo servidor. Null até a questão ser resolvida.
    private Boolean acertou;

    @Column(name = "respondido_em", nullable = false)
    @Builder.Default
    private LocalDateTime respondidoEm = LocalDateTime.now();
}