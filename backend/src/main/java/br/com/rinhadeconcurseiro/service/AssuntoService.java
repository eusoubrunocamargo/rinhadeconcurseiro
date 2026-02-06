package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.response.AssuntoResponse;
import br.com.rinhadeconcurseiro.entity.Assunto;
import br.com.rinhadeconcurseiro.entity.Materia;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.AssuntoMapper;
import br.com.rinhadeconcurseiro.repository.AssuntoRepository;
import br.com.rinhadeconcurseiro.repository.QuestaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssuntoService {

    private final AssuntoRepository assuntoRepository;
    private final QuestaoRepository questaoRepository;
    private final AssuntoMapper assuntoMapper;

    @Transactional(readOnly = true)
    public List<AssuntoResponse> listarPorMateria(Long materiaId) {

        return assuntoRepository.findByMateriaIdAndAtivoTrue(materiaId).stream()
                .map(assunto -> {
                    long total = questaoRepository.countByAssuntoIdAndAtivoTrue(assunto.getId());
                    return assuntoMapper.toResponse(assunto, total);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssuntoResponse buscarPorId(Long id) {

        Assunto assunto = assuntoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assunto não encontrado"));

        long total = questaoRepository.countByAssuntoIdAndAtivoTrue(id);
        return assuntoMapper.toResponse(assunto, total);
    }

    @Transactional
    public Assunto buscarOuCriar(Materia materia, String nome) {

        return assuntoRepository.findByMateriaIdAndNome(materia.getId(), nome)
                .orElseGet(() -> {
                    Assunto novo = Assunto.builder()
                            .materia(materia)
                            .nome(nome)
                            .build();
                    return assuntoRepository.save(novo);
                });
    }


}
