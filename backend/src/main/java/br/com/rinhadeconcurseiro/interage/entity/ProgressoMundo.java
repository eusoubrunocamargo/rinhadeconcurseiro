package br.com.rinhadeconcurseiro.interage.entity;

import br.com.rinhadeconcurseiro.entity.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "interage_progresso_mundo",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "mundo_id"}))
@Getter
@Setter
@NoArgsConstructor
public class ProgressoMundo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mundo_id")
    private Mundo mundo;

    @Column(nullable = false)
    private Boolean desbloqueado = false;

    @Column(name = "total_resets", nullable = false)
    private Integer totalResets = 0;

    @Column(name = "ultimo_reset_em")
    private LocalDateTime ultimoResetEm;
}
