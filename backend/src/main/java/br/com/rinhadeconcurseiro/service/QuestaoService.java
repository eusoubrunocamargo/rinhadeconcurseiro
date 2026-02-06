package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.response.QuestaoResponse;
import br.com.rinhadeconcurseiro.entity.Questao;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.QuestaoMapper;
import br.com.rinhadeconcurseiro.repository.QuestaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuestaoService {

    private final QuestaoRepository questaoRepository;
    private final QuestaoMapper questaoMapper;

    @Transactional(readOnly = true)
    public QuestaoResponse buscarPorId(Long id) {

        Questao questao = questaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Questão não encontrada"));

        return questaoMapper.toResponse(questao);
    }

    @Transactional(readOnly = true)
    public Page<QuestaoResponse> listarQuestoes(Long materiaId, Long assuntoId, Pageable pageable) {
        Page<Questao> questaoPage;

        if (assuntoId != null) {
            questaoPage = questaoRepository.findByAssunto_IdAndAtivoTrue(assuntoId, pageable);
        } else if (materiaId != null) {
            questaoPage = questaoRepository.findByMateria_IdAndAtivoTrue(materiaId, pageable);
        } else {
            // If no filter is provided, return a paginated list of all active questions.
            questaoPage = questaoRepository.findAllByAtivoTrue(pageable);
        }

        return questaoPage.map(questaoMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public boolean existePorIdTec(String idTec) {
        return questaoRepository.existsByIdTec(idTec);
    }
}
