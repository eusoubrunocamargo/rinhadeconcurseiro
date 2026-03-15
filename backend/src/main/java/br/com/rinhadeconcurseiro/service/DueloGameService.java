package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.websocket.EventoDueloMessage;
import br.com.rinhadeconcurseiro.dto.websocket.RespostaDueloMessage;
import br.com.rinhadeconcurseiro.entity.Duelo;
import br.com.rinhadeconcurseiro.entity.DueloQuestao;
import br.com.rinhadeconcurseiro.entity.DueloResposta;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.enums.EventoDueloTipo;
import br.com.rinhadeconcurseiro.enums.StatusDuelo;
import br.com.rinhadeconcurseiro.exception.DueloException;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.DueloMapper;
import br.com.rinhadeconcurseiro.repository.DueloQuestaoRepository;
import br.com.rinhadeconcurseiro.repository.DueloRepository;
import br.com.rinhadeconcurseiro.repository.DueloRespostaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DueloGameService {

    private final DueloRepository dueloRepository;
    private final DueloQuestaoRepository dueloQuestaoRepository;
    private final DueloRespostaRepository dueloRespostaRepository;
    private final ThreadPoolTaskScheduler taskScheduler;
    private final SimpMessagingTemplate messagingTemplate;
    private final DueloMapper dueloMapper;

    @Lazy
    @Autowired
    private DueloGameService self;

    @Transactional
    public void responder(Long dueloId, Usuario solicitante, RespostaDueloMessage message) {

        // --- Portão 1: o duelo existe e está em andamento? ---
        Duelo duelo = dueloRepository.findById(dueloId)
                .orElseThrow(() -> new ResourceNotFoundException("Duelo não encontrado."));

        if (duelo.getStatus() != StatusDuelo.EM_ANDAMENTO) {
            throw new DueloException("Este duelo não está em andamento.");
        }

        // --- Portão 2: o solicitante pertence a este duelo? ---
        boolean ehParticipante = duelo.getHost().getId().equals(solicitante.getId())
                || duelo.getDesafiado().getId().equals(solicitante.getId());

        if (!ehParticipante) {
            throw new DueloException("Você não é participante deste duelo.");
        }

        // --- Portão 3: a questão pertence a este duelo? ---
        DueloQuestao dueloQuestao = dueloQuestaoRepository
                .findById(message.dueloQuestaoId())
                .orElseThrow(() -> new ResourceNotFoundException("Questão não encontrada."));

        if (!dueloQuestao.getDuelo().getId().equals(dueloId)) {
            throw new DueloException("Esta questão não pertence a este duelo.");
        }

        // --- Portão 4: a questão já foi resolvida? ---
        // Se resolvida = true, ambos já responderam e o resultado foi processado.
        // Tentativas após isso são silenciosamente ignoradas.
        if (dueloQuestao.getResolvida()) {
            return;
        }

        // --- Portão 5: o jogador já respondeu esta questão? ---
        // Segunda linha de defesa — a constraint UNIQUE no banco é a primeira.
        if (dueloRespostaRepository.existsByDueloQuestaoIdAndUsuarioId(
                dueloQuestao.getId(), solicitante.getId())) {
            throw new DueloException("Você já respondeu esta questão.");
        }

        // Persistimos a resposta do jogador.
        dueloRespostaRepository.save(DueloResposta.builder()
                .dueloQuestao(dueloQuestao)
                .usuario(solicitante)
                .resposta(message.resposta())
                .build());

        // Verificamos quantas respostas esta questão já tem.
        List<DueloResposta> respostas = dueloRespostaRepository
                .findByDueloQuestaoId(dueloQuestao.getId());

        if (respostas.size() < 2) {
            // Apenas um jogador respondeu — avisamos o outro que precisa se apressar.
            // Não revelamos qual foi a resposta para não influenciar o oponente.
            publicar(dueloId, EventoDueloMessage.builder()
                    .evento(EventoDueloTipo.OPONENTE_RESPONDEU)
                    .dueloQuestaoId(dueloQuestao.getId())
                    .ordemQuestao(dueloQuestao.getOrdem())
                    .pontosHost(duelo.getPontosHost())
                    .pontosDesafiado(duelo.getPontosDesafiado())
                    .build());
        } else {
            // Ambos responderam — agendamos a resolução com 5 segundos de delay.
            // O delay serve para o frontend exibir o feedback de "oponente respondeu"
            // antes da tela de resultado aparecer, criando tensão dramática.
            taskScheduler.schedule(
                    () -> self.resolverQuestao(dueloId, dueloQuestao.getId()),
                    java.time.Instant.now().plusSeconds(5)
            );
        }
    }

    // Este método é chamado pelo TaskScheduler em uma thread separada,
    // 5 segundos após o segundo jogador responder.
    // A anotação @Transactional abre uma nova transação nesta thread.
    @Transactional
    public void resolverQuestao(Long dueloId, Long dueloQuestaoId) {

        // A operação atômica: atualiza resolvida = true SOMENTE SE ainda era false.
        // Se retornar 0, significa que outra thread chegou primeiro —
        // descartamos silenciosamente sem fazer nada.
        int linhasAfetadas = dueloQuestaoRepository.marcarComoResolvida(dueloQuestaoId);
        if (linhasAfetadas == 0) {
            log.warn("Questão {} já foi resolvida por outra thread — descartando.", dueloQuestaoId);
            return;
        }

        // A partir daqui, somos a única thread que vai processar esta questão.
        DueloQuestao dueloQuestao = dueloQuestaoRepository.findById(dueloQuestaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Questão não encontrada."));

        Duelo duelo = dueloRepository.findById(dueloId)
                .orElseThrow(() -> new ResourceNotFoundException("Duelo não encontrado."));

        List<DueloResposta> respostas = dueloRespostaRepository
                .findByDueloQuestaoId(dueloQuestaoId);

        // Identificamos qual resposta pertence a cada jogador.
        // Uma das respostas pode ser null se o jogador não respondeu a tempo —
        // a ausência de resposta é tratada como "em branco" (não pontuou).
        DueloResposta respostaHost = respostas.stream()
                .filter(r -> r.getUsuario().getId().equals(duelo.getHost().getId()))
                .findFirst().orElse(null);

        DueloResposta respostaDesafiado = respostas.stream()
                .filter(r -> r.getUsuario().getId().equals(duelo.getDesafiado().getId()))
                .findFirst().orElse(null);

        String gabaritoCorreto = dueloQuestao.getQuestao().getGabarito().name();

        // O acerto é calculado pelo servidor — nunca pelo cliente.
        boolean hostAcertou = respostaHost != null
                && gabaritoCorreto.equals(respostaHost.getResposta());
        boolean desafiadoAcertou = respostaDesafiado != null
                && gabaritoCorreto.equals(respostaDesafiado.getResposta());

        // Atualizamos o campo acertou em cada resposta para histórico.
        if (respostaHost != null) {
            respostaHost.setAcertou(hostAcertou);
            dueloRespostaRepository.save(respostaHost);
        }
        if (respostaDesafiado != null) {
            respostaDesafiado.setAcertou(desafiadoAcertou);
            dueloRespostaRepository.save(respostaDesafiado);
        }

        // Cada acerto vale 1 ponto — o modelo de pontuação pode evoluir
        // futuramente para pesos por dificuldade, por exemplo.
        if (hostAcertou) duelo.setPontosHost(duelo.getPontosHost() + 1);
        if (desafiadoAcertou) duelo.setPontosDesafiado(duelo.getPontosDesafiado() + 1);

        dueloRepository.save(duelo);

        // Verificamos se há uma próxima questão — a ordem atual + 1.
        DueloQuestao proximaQuestao = dueloQuestaoRepository
                .findByDueloIdOrderByOrdem(dueloId)
                .stream()
                .filter(q -> q.getOrdem().equals(dueloQuestao.getOrdem() + 1))
                .findFirst()
                .orElse(null);

        if (proximaQuestao != null) {
            // Ainda há questões — enviamos o resultado desta e a próxima questão.
            publicar(dueloId, EventoDueloMessage.builder()
                    .evento(EventoDueloTipo.QUESTAO_RESOLVIDA)
                    .dueloQuestaoId(dueloQuestaoId)
                    .ordemQuestao(dueloQuestao.getOrdem())
                    .hostAcertou(hostAcertou)
                    .desafiadoAcertou(desafiadoAcertou)
                    .pontosHost(duelo.getPontosHost())
                    .pontosDesafiado(duelo.getPontosDesafiado())
                    .proximaDueloQuestaoId(proximaQuestao.getId())
                    .proximaOrdem(proximaQuestao.getOrdem())
                    .build());
        } else {
            // Última questão — finalizamos o duelo.
            finalizarDuelo(duelo, hostAcertou, desafiadoAcertou, dueloQuestao);
        }
    }

    private void finalizarDuelo(Duelo duelo, boolean hostAcertou,
                                boolean desafiadoAcertou, DueloQuestao ultimaQuestao) {

        duelo.setStatus(StatusDuelo.FINALIZADO);
        duelo.setFinalizadoEm(java.time.LocalDateTime.now());

        // O vencedor é quem tem mais pontos. null indica empate.
        if (duelo.getPontosHost() > duelo.getPontosDesafiado()) {
            duelo.setVencedor(duelo.getHost());
        } else if (duelo.getPontosDesafiado() > duelo.getPontosHost()) {
            duelo.setVencedor(duelo.getDesafiado());
        }
        // Se empatou, vencedor permanece null — que é o estado correto

        dueloRepository.save(duelo);

        publicar(duelo.getId(), EventoDueloMessage.builder()
                .evento(EventoDueloTipo.DUELO_FINALIZADO)
                .dueloQuestaoId(ultimaQuestao.getId())
                .ordemQuestao(ultimaQuestao.getOrdem())
                .hostAcertou(hostAcertou)
                .desafiadoAcertou(desafiadoAcertou)
                .pontosHost(duelo.getPontosHost())
                .pontosDesafiado(duelo.getPontosDesafiado())
                .idVencedor(duelo.getVencedor() != null
                        ? duelo.getVencedor().getId()
                        : null)
                .build());
    }

    // Método utilitário que centraliza o broadcast WebSocket.
    // O destino /topic/duelo/{id} é onde ambos os jogadores estão inscritos.
    private void publicar(Long dueloId, EventoDueloMessage mensagem) {
        messagingTemplate.convertAndSend("/topic/duelo/" + dueloId, mensagem);
    }
}
