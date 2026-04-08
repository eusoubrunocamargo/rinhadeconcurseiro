package br.com.rinhadeconcurseiro.interage.entity;

import br.com.rinhadeconcurseiro.interage.converter.OpcaoListConverter;
import br.com.rinhadeconcurseiro.interage.dto.OpcaoDto;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "interage_exercicio")
@Getter
@Setter
@NoArgsConstructor
public class Exercicio {

    public enum Bloco { PRATICA, DESAFIO }
    public enum Tipo { A, B, C, D }
    public enum Nivel { BASICO, MEDIO, AVANCADO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fase_id")
    private Fase fase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Bloco bloco;

    private Short rodada;

    @Column(nullable = false)
    private Short ordemNaRodada;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 1)
    private Tipo tipo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String enunciado;

    @Column(columnDefinition = "TEXT")
    private String fraseContexto;

    private String palavraAlvo;

    @Convert(converter = OpcaoListConverter.class)
    @Column(columnDefinition = "JSONB")
    private List<OpcaoDto> opcoes;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String gabarito;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explicacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Nivel nivel;

    @Column(nullable = false)
    private boolean ativo;

}
