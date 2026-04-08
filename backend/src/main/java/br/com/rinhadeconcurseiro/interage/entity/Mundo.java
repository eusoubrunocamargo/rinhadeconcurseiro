package br.com.rinhadeconcurseiro.interage.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interage_mundo")
@Getter @Setter @NoArgsConstructor
public class Mundo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private short numero;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Column(nullable = false, length = 100)
    private String materia;

    @Column(nullable = false)
    private short totalFases;

    @Column(nullable = false)
    private boolean ativo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @OneToMany(mappedBy = "mundo", fetch = FetchType.LAZY)
    @OrderBy("ordemNoMundo ASC")
    private List<Fase> fases = new ArrayList<>();

}
