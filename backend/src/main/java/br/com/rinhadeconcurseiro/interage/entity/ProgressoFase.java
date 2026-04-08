package br.com.rinhadeconcurseiro.interage.entity;

import br.com.rinhadeconcurseiro.entity.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "interage_progresso_fase",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "fase_id"}))
@Getter
@Setter
@NoArgsConstructor
public class ProgressoFase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fase_id")
    private Fase fase;

    //save points
    @Column(nullable = false)
    private Boolean desbloqueada = false;

    @Column(name = "bloco1_concluido", nullable = false)
    private Boolean bloco1Concluido = false;

    @Column(name = "rodada1_concluida", nullable = false)
    private Boolean rodada1Concluida = false;

    @Column(name = "rodada2_concluida", nullable = false)
    private Boolean rodada2Concluida = false;

    @Column(name = "rodada3_concluida", nullable = false)
    private Boolean rodada3Concluida = false;

    //desafio
    @Column(name = "desafio_tentativas", nullable = false)
    private Short desafioTentativas = 0;

    @Column(name = "desafio_concluido", nullable = false)
    private Boolean desafioConcluido = false;

    //scores
    @Column(name = "score_pratica")
    private Short scorePratica;

    @Column(name = "score_desafio_t1")
    private Short scoreDesafioT1;

    @Column(name = "score_desafio_t2")
    private Short scoreDesafioT2;

    //timestamps
    @Column(name = "desbloqueada_em")
    private LocalDateTime desbloqueadaEm;

    @Column(name = "concluida_em")
    private LocalDateTime concluidaEm;

    @Column(name = "ultima_atividade_em")
    private LocalDateTime ultimaAtividadeEm;
}
