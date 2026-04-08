package br.com.rinhadeconcurseiro.interage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "interage_questao_classificada")
@Getter
@Setter
@NoArgsConstructor
public class QuestaoClassificada {

    public enum Bloco { PRATICA, DESAFIO }
    public enum ClassificadoPor { LLM, MANUAL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String questaoExternaId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fase_id")
    private Fase fase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Bloco bloco;

    private Float confiancaClassificacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ClassificadoPor classificadoPor;

    @Column(nullable = false)
    private boolean ativo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

}
