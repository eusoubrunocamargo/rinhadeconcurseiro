package br.com.rinhadeconcurseiro.interage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interage_fase")
@Getter
@Setter
@NoArgsConstructor
public class Fase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mundo_id")
    private Mundo mundo;

    @Column(nullable = false)
    private Short numero;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudoIntroducaoHtml;

    @Column(nullable = false)
    private Short ordemNoMundo;

    @Column(nullable = false)
    private boolean ativo;

    @OneToMany(mappedBy = "fase", fetch = FetchType.LAZY)
    @OrderBy("rodada ASC, ordemNaRodada ASC")
    private List<Exercicio> exercicios = new ArrayList<>();

}
