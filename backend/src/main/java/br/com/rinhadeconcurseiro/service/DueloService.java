package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.request.IniciarDueloRequest;
import br.com.rinhadeconcurseiro.dto.response.DueloQuestaoResponse;
import br.com.rinhadeconcurseiro.dto.response.DueloResponse;
import br.com.rinhadeconcurseiro.dto.response.DueloResultadoQuestaoResponse;
import br.com.rinhadeconcurseiro.dto.websocket.EventoDueloMessage;
import br.com.rinhadeconcurseiro.entity.*;
import br.com.rinhadeconcurseiro.enums.EventoDueloTipo;
import br.com.rinhadeconcurseiro.enums.StatusDuelo;
import br.com.rinhadeconcurseiro.exception.DueloException;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.DueloMapper;
import br.com.rinhadeconcurseiro.repository.DueloQuestaoRepository;
import br.com.rinhadeconcurseiro.repository.DueloRepository;
import br.com.rinhadeconcurseiro.repository.DueloRespostaRepository;
import br.com.rinhadeconcurseiro.repository.QuestaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DueloService {

    private final DueloRepository dueloRepository;
    private final DueloQuestaoRepository dueloQuestaoRepository;
    private final QuestaoRepository questaoRepository;
    private final DueloMapper dueloMapper;
    private final SimpMessagingTemplate messagingTemplate; // novo
    private final DueloRespostaRepository dueloRespostaRepository;

    @Transactional
    public DueloResponse iniciar(Long dueloId, Usuario solicitante, IniciarDueloRequest request) {

        Duelo duelo = dueloRepository.findById(dueloId)
                .orElseThrow(() -> new ResourceNotFoundException("Duelo não encontrado."));

        if (!duelo.getHost().getId().equals(solicitante.getId()))
            throw new DueloException("Apenas o host pode iniciar o duelo.");

        if (duelo.getStatus() != StatusDuelo.CONFIGURANDO)
            throw new DueloException("Este duelo não pode ser iniciado no status atual: " + duelo.getStatus());

        List<Questao> questoesSorteadas = sortear(request);

        if (questoesSorteadas.size() < request.totalQuestoes())
            throw new DueloException("Não há questões suficientes. Encontradas: "
                    + questoesSorteadas.size() + ", necessárias: " + request.totalQuestoes());

        // persiste e guarda referência da primeira
        DueloQuestao primeiraQuestao = null;
        for (int i = 0; i < questoesSorteadas.size(); i++) {
            DueloQuestao dq = DueloQuestao.builder()
                    .duelo(duelo)
                    .questao(questoesSorteadas.get(i))
                    .ordem(i + 1)
                    .build();
            DueloQuestao salva = dueloQuestaoRepository.save(dq);
            if (i == 0) primeiraQuestao = salva;
        }

        duelo.setStatus(StatusDuelo.EM_ANDAMENTO);
        duelo.setTotalQuestoes(request.totalQuestoes());
        dueloRepository.save(duelo);

        // publica DUELO_INICIADO para ambos os participantes
        assert primeiraQuestao != null;
        messagingTemplate.convertAndSend("/topic/duelo/" + duelo.getId(),
                EventoDueloMessage.builder()
                        .evento(EventoDueloTipo.DUELO_INICIADO)
                        .dueloQuestaoId(primeiraQuestao.getId())
                        .ordemQuestao(1)
                        .pontosHost(0)
                        .pontosDesafiado(0)
                        .build());

        return dueloMapper.toDueloResponse(duelo);
    }

    @Transactional(readOnly = true)
    public List<DueloQuestaoResponse> listarQuestoes(Long dueloId, Usuario usuario) {
        Duelo duelo = dueloRepository.findById(dueloId)
                .orElseThrow(() -> new ResourceNotFoundException("Duelo não encontrado."));

        boolean ehParticipante = duelo.getHost().getId().equals(usuario.getId())
                || duelo.getDesafiado().getId().equals(usuario.getId());
        if (!ehParticipante) throw new DueloException("Você não tem acesso a este duelo.");

        return dueloQuestaoRepository.findByDueloIdWithQuestaoOrderByOrdem(dueloId)
                .stream()
                .map(dq -> new DueloQuestaoResponse(
                        dq.getId(),
                        dq.getOrdem(),
                        dq.getQuestao().getEnunciado(),
//                        dq.getQuestao().getComando(),
                        dq.getQuestao().getMateria().getNome(),
                        dq.getQuestao().getAssunto() != null
                                ? dq.getQuestao().getAssunto().getNome() : null
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public DueloResponse buscar(Long id, Usuario usuario) {
        Duelo duelo = dueloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Duelo não encontrado."));
        boolean ehParticipante = duelo.getHost().getId().equals(usuario.getId())
                || duelo.getDesafiado().getId().equals(usuario.getId());
        if (!ehParticipante) throw new DueloException("Você não tem acesso a este duelo.");
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

    private List<Questao> sortear(IniciarDueloRequest request) {
        Pageable limite = PageRequest.of(0, request.totalQuestoes());
        return switch (request.tipoFiltro().toUpperCase()) {
            case "MATERIA" -> questaoRepository.sortearPorMateria(request.filtroId(), limite);
            case "ASSUNTO" -> questaoRepository.sortearPorAssunto(request.filtroId(), limite);
            default -> throw new DueloException(
                    "Tipo de filtro inválido: '" + request.tipoFiltro() + "'. Use 'MATERIA' ou 'ASSUNTO'");
        };
    }

    @Transactional
    public void cancelar(Long dueloId, Usuario usuario){

        Duelo duelo = dueloRepository.findById(dueloId)
                .orElseThrow(()-> new ResourceNotFoundException("Duelo não encontrado."));

        boolean ehParticipante = duelo.getHost().getId().equals(usuario.getId())
                || duelo.getDesafiado().getId().equals(usuario.getId());

        if(!ehParticipante) throw new DueloException("Você não tem acesso a este duelo.");

        if(duelo.getStatus() == StatusDuelo.FINALIZADO)
            throw new DueloException("Não é possível cancelar um duelo finalizado.");

        duelo.setStatus(StatusDuelo.CANCELADO);
        dueloRepository.save(duelo);

        //notificar ambos participantes via WS
        messagingTemplate.convertAndSend(
                "/topic/duelo/" + dueloId,
                EventoDueloMessage.builder()
                        .evento(EventoDueloTipo.DUELO_CANCELADO)
                        .build()
        );

    }

    @Transactional(readOnly = true)
    public List<DueloResultadoQuestaoResponse> listarResultadoQuestoes(Long dueloId, Usuario usuario){

        Duelo duelo = dueloRepository.findById(dueloId)
                .orElseThrow(()-> new ResourceNotFoundException("Duelo não encontrado."));

        boolean ehParticipante = duelo.getHost().getId().equals(usuario.getId())
                || duelo.getDesafiado().getId().equals(usuario.getId());

        if(!ehParticipante)
            throw new DueloException("Você não tem acesso a este duelo.");

        if(duelo.getStatus() != StatusDuelo.FINALIZADO)
            throw new DueloException("Resultado disponível apenas para duelos finalizados.");

        List<DueloQuestao> questoes = dueloQuestaoRepository.findByDueloIdWithQuestaoOrderByOrdem(dueloId);

        List<Long> questaoIds = questoes.stream().map(DueloQuestao::getId).toList();

        //batch load all user answers
        Map<Long, DueloResposta> mapaRespostas =
                dueloRespostaRepository.findByDueloQuestaoIdsAndUsuarioId(questaoIds, usuario.getId())
                        .stream().collect(Collectors.toMap(
                                r -> r.getDueloQuestao().getId(),
                                r -> r
                        ));
        return questoes.stream().map(dq -> {
            DueloResposta resp = mapaRespostas.get(dq.getId());
            return new DueloResultadoQuestaoResponse(
                    dq.getOrdem(),
                    dq.getQuestao().getEnunciado(),
                    dq.getQuestao().getMateria().getNome(),
                    dq.getQuestao().getAssunto() != null ? dq.getQuestao().getAssunto().getNome() : null,
                    dq.getQuestao().getGabarito().name(),
                    resp != null ? resp.getResposta() : null,
                    resp != null && Boolean.TRUE.equals(resp.getAcertou())
            );
        }).toList();
    }

}
