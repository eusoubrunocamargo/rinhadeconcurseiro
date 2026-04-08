package br.com.rinhadeconcurseiro.interage.repository;

import br.com.rinhadeconcurseiro.interage.entity.QuestaoClassificada;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestaoClassificadaRepository
extends JpaRepository<QuestaoClassificada, Long> {
    List<QuestaoClassificada> findAllByFaseIdAndBlocoAndAtivoTrue(
            Long faseId,
            QuestaoClassificada.Bloco bloco
    );
}
