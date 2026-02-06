package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.response.MateriaResponse;
import br.com.rinhadeconcurseiro.entity.Materia;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.MateriaMapper;
import br.com.rinhadeconcurseiro.repository.MateriaRepository;
import br.com.rinhadeconcurseiro.repository.QuestaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MateriaService {

    private final MateriaRepository materiaRepository;
    private final QuestaoRepository questaoRepository;
    private final MateriaMapper materiaMapper;

    @Transactional(readOnly = true)
    public List<MateriaResponse> listarAtivas() {

        return materiaRepository.findByAtivoTrue().stream()
                .map(materia -> {
                        long total = questaoRepository.countByMateriaIdAndAtivoTrue(materia.getId());
                        return materiaMapper.toResponse(materia, total);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MateriaResponse buscarPorId(Long id) {

        Materia materia = materiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matéria não encontrada"));

        long total = questaoRepository.countByMateriaIdAndAtivoTrue(id);
        return materiaMapper.toResponse(materia, total);
    }

    @Transactional
    public Materia buscarOuCriar(String nome) {

        return materiaRepository.findByNome(nome)
                .orElseGet(() -> {
                    Materia nova = Materia.builder()
                            .nome(nome)
                            .build();
                    return materiaRepository.save(nova);
                });
    }
}
