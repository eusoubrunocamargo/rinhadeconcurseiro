package br.com.rinhadeconcurseiro.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "simulado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Simulado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer numero;

    @Column(length = 100)
    private String titulo;

    @Column(name = "data_disponivel", nullable = false)
    private LocalDate dataDisponivel;

    @Column(name = "total_questoes", nullable = false)
    @Builder.Default
    private Integer totalQuestoes = 180;

    @Column(name = "questoes_basicas", nullable = false)
    @Builder.Default
    private Integer questoesBasicas = 90;

    @Column(name = "questoes_especificas", nullable = false)
    @Builder.Default
    private Integer questoesEspecificas = 90;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "simulado", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SimuladoQuestao> questoes = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
