package br.com.rinhadeconcurseiro.entity;

import br.com.rinhadeconcurseiro.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resposta_questao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespostaQuestao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tentativa", nullable = false)
    private TentativaSimulado tentativa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_simulado_questao", nullable = false)
    private SimuladoQuestao simuladoQuestao;

    @Enumerated(EnumType.STRING)
    @Column(name = "resposta")
    private RespostaTipo resposta;

    @Enumerated(EnumType.STRING)
    @Column(name = "confianca")
    private NivelConfianca confianca;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_erro")
    private TipoErro tipoErro;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_resultado")
    private TipoResultado tipoResultado;

    @Enumerated(EnumType.STRING)
    @Column(name = "caderno")
    private Caderno caderno;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean isAcerto(){
        return tipoResultado != null && tipoResultado.name().startsWith("ACERTO");
    }



}
