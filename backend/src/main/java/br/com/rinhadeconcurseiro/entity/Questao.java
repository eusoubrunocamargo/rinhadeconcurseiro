package br.com.rinhadeconcurseiro.entity;

import br.com.rinhadeconcurseiro.enums.RespostaTipo;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "questao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Questao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_materia", nullable = false)
    private Materia materia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_assunto")
    private Assunto assunto;

    @Column(name = "id_tec", unique = true, length = 20)
    private String idTec;

    @Column(length = 255)
    private String link;

    @Column(name = "banca_orgao", length = 200)
    private String bancaOrgao;

    @Column(columnDefinition = "TEXT")
    private String comando;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String enunciado;

    @Enumerated(EnumType.STRING)
    @Column(name = "gabarito", nullable = false)
    private RespostaTipo gabarito;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    @Column(name = "has_latex")
    @Builder.Default
    private Boolean hasLatex = false;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
