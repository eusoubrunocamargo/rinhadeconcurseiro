package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.request.IniciarDueloRequest;
import br.com.rinhadeconcurseiro.dto.response.DueloResponse;
import br.com.rinhadeconcurseiro.entity.Duelo;
import br.com.rinhadeconcurseiro.entity.DueloQuestao;
import br.com.rinhadeconcurseiro.entity.Questao;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.enums.StatusDuelo;
import br.com.rinhadeconcurseiro.exception.DueloException;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.DueloMapper;
import br.com.rinhadeconcurseiro.repository.DueloQuestaoRepository;
import br.com.rinhadeconcurseiro.repository.DueloRepository;
import br.com.rinhadeconcurseiro.repository.QuestaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DueloService {

    private final DueloRepository dueloRepository;
    private final DueloQuestaoRepository dueloQuestaoRepository;
    private final QuestaoRepository questaoRepository;
    private final DueloMapper dueloMapper;

    @Transactional
    public DueloResponse iniciar(Long dueloId, Usuario solicitante, IniciarDueloRequest request){

        Duelo duelo = dueloRepository.findById(dueloId)
                .orElseThrow(()-> new ResourceNotFoundException("Duelo não encontrado."));

        //apenas host inicia duelo
        if(!duelo.getHost().getId().equals(solicitante.getId())){
            throw new DueloException("Apenas o host pode iniciar o duelo.");
        }

        //duelo só pode ser iniciado uma vez - checar status configurando
        if(duelo.getStatus() != StatusDuelo.CONFIGURANDO){
            throw new DueloException("Este duelo não pode ser iniciado no status atual: "
                + duelo.getStatus());
        }

        //Sortear as questões ANTES do duelo. Se não houver questões, exceção e reverte
        List<Questao> questoesSorteadas = sortear(request);

        if(questoesSorteadas.size() < request.totalQuestoes()){
            throw new DueloException("Não há questões suficientes para iniciar o duelo. " +
                    "Encontradas: " + questoesSorteadas.size() +
                    ", necessárias: " + request.totalQuestoes());
        }

        //Persistir ordem sequencial - jogadores veem a mesma sequencia no jogo
        for (int i = 0; i < questoesSorteadas.size(); i++) {
            DueloQuestao dueloQuestao = DueloQuestao.builder()
                    .duelo(duelo)
                    .questao(questoesSorteadas.get(i))
                    .ordem(i + 1)
                    .build();
            dueloQuestaoRepository.save(dueloQuestao);
        }

        //atualizar status após persistir questoes com sucesso - erro -> reverte
        duelo.setStatus(StatusDuelo.EM_ANDAMENTO);
        duelo.setTotalQuestoes(request.totalQuestoes());

        return dueloMapper.toDueloResponse(dueloRepository.save(duelo));

    }

    private List<Questao> sortear(IniciarDueloRequest request){

        Pageable limite = PageRequest.of(0, request.totalQuestoes());

        return switch (request.tipoFiltro().toUpperCase()){
            case "MATERIA" -> questaoRepository.sortearPorMateria(request.filtroId(), limite);
            case "ASSUNTO" -> questaoRepository.sortearPorAssunto(request.filtroId(), limite);
            default -> throw new DueloException(
                    "Tipo de filtro inválido: '" + request.tipoFiltro() + "'. Use 'MATERIA' ou 'ASSUNTO'"
            );
        };
    }

    // DueloService.java — adicionar:
    @Transactional(readOnly = true)
    public DueloResponse buscar(Long id, Usuario usuario) {
        Duelo duelo = dueloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Duelo não encontrado."));

        boolean ehParticipante = duelo.getHost().getId().equals(usuario.getId())
                || duelo.getDesafiado().getId().equals(usuario.getId());

        if (!ehParticipante) {
            throw new DueloException("Você não tem acesso a este duelo.");
        }

        return dueloMapper.toDueloResponse(duelo);
    }

    @Transactional(readOnly = true)
    public List<DueloResponse> listarPorUsuario(Usuario usuario) {
        return dueloRepository
                .findByHostIdOrDesafiadoId(usuario.getId(), usuario.getId())
                .stream()
                .map(dueloMapper::toDueloResponse)
                .toList();
    }
}
