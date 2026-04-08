package br.com.rinhadeconcurseiro.interage.entity;

import br.com.rinhadeconcurseiro.entity.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "interage_resposta")
@Getter
@Setter
@NoArgsConstructor
public class Resposta {

    public enum Bloco { PRATICA, DESAFIO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fase_id")
    private Fase fase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercicio_id")
    private Exercicio exercicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "questao_classificada_id")
    private QuestaoClassificada questaoClassificada;

    @Enumerated(EnumType.STRING)
    @Column(name = "bloco", nullable = false, length = 10)
    private Bloco bloco;

    @Column(name = "rodada")
    private Short rodada;

    @Column(name = "tentativa_desafio")
    private Short tentativaDesafio;

    @Column(name = "resposta_dada", nullable = false, columnDefinition = "TEXT")
    private String respostaDada;

    @Column(name = "correto", nullable = false)
    private Boolean correto;

    @Column(name = "respondido_em", nullable = false, updatable = false)
    private LocalDateTime respondidoEm = LocalDateTime.now();
}
