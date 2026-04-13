package br.com.rinhadeconcurseiro.interage.controller;

import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.interage.dto.CheckpointResultadoDto;
import br.com.rinhadeconcurseiro.interage.dto.FeedbackRespostaDto;
import br.com.rinhadeconcurseiro.interage.dto.RespostaSubmitDto;
import br.com.rinhadeconcurseiro.interage.dto.SessaoFaseDto;
import br.com.rinhadeconcurseiro.interage.entity.*;
import br.com.rinhadeconcurseiro.interage.enums.PontoRetomada;
import br.com.rinhadeconcurseiro.interage.enums.ResultadoCheckpoint;
import br.com.rinhadeconcurseiro.interage.repository.*;
import br.com.rinhadeconcurseiro.interage.service.ProgressoService;
import br.com.rinhadeconcurseiro.interage.service.SessaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interage")
@RequiredArgsConstructor
public class InterageController {

    private final SessaoService                sessaoService;
    private final ProgressoService             progressoService;
    private final MundoRepository              mundoRepo;
    private final FaseRepository               faseRepo;
    private final ExercicioRepository          exercicioRepo;
    private final QuestaoClassificadaRepository questaoClassificadaRepo;
    private final RespostaRepository           respostaRepo;
    private final ProgressoMundoRepository     progressoMundoRepo;
    private final ProgressoFaseRepository      progressoFaseRepo;


    // ------------------------------------------------------------------
    // MUNDOS
    // ------------------------------------------------------------------

    @GetMapping("/mundos")
    public ResponseEntity<List<MundoResumoDto>> listarMundos(
            @AuthenticationPrincipal Usuario usuario) {

        List<MundoResumoDto> mundos = mundoRepo
                .findAllByAtivoTrueOrderByNumeroAsc()
                .stream()
                .map(m -> {
                    boolean desbloqueado = progressoMundoRepo
                            .findByUsuarioIdAndMundoId(usuario.getId(), m.getId())
                            .map(ProgressoMundo::getDesbloqueado)
                            .orElse(m.getNumero() == 1); // Mundo 1 sempre desbloqueado
                    return new MundoResumoDto(
                            m.getId(),
                            m.getNumero(),
                            m.getNome(),
                            m.getDescricao(),
                            desbloqueado);
                })
                .toList();

        return ResponseEntity.ok(mundos);
    }

    // ------------------------------------------------------------------
    // FASES
    // ------------------------------------------------------------------

    @GetMapping("/mundos/{mundoId}/fases")
    public ResponseEntity<List<FaseResumoDto>> listarFases(
            @PathVariable Long mundoId,
            @AuthenticationPrincipal Usuario usuario) {

        List<FaseResumoDto> fases = faseRepo
                .findAllByMundoIdAndAtivoTrueOrderByOrdemNoMundoAsc(mundoId)
                .stream()
                .map(f -> {
                    PontoRetomada etapa = progressoService.obterPontoRetomada(usuario, f.getId());
                    boolean desbloqueada = progressoFaseRepo
                            .findByUsuarioIdAndFaseId(usuario.getId(), f.getId())
                            .map(ProgressoFase::getDesbloqueada)
                            .orElse(f.getOrdemNoMundo() == 1 && f.getMundo().getNumero() == 1);
                    return new FaseResumoDto(
                            f.getId(), f.getNumero(), f.getNome(),
                            f.getOrdemNoMundo(), etapa, desbloqueada);
                })
                .toList();

        return ResponseEntity.ok(fases);
    }

    // ------------------------------------------------------------------
    // SESSÃO
    // ------------------------------------------------------------------

    @GetMapping("/fases/{faseId}/sessao")
    public ResponseEntity<SessaoFaseDto> iniciarSessao(
            @PathVariable Long faseId,
            @AuthenticationPrincipal Usuario usuario) {

        return ResponseEntity.ok(sessaoService.iniciarSessao(usuario, faseId));
    }

    // ------------------------------------------------------------------
    // SAVE POINTS
    // ------------------------------------------------------------------

    @PostMapping("/fases/{faseId}/bloco1/concluir")
    public ResponseEntity<Void> concluirBloco1(
            @PathVariable Long faseId,
            @AuthenticationPrincipal Usuario usuario) {

        progressoService.salvarBloco1Concluido(usuario, faseId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/fases/{faseId}/rodadas/{rodada}/concluir")
    public ResponseEntity<Void> concluirRodada(
            @PathVariable Long faseId,
            @PathVariable short rodada,
            @AuthenticationPrincipal Usuario usuario) {

        progressoService.salvarRodadaConcluida(usuario, faseId, rodada);
        return ResponseEntity.ok().build();
    }

    // ------------------------------------------------------------------
    // RESPOSTA
    // ------------------------------------------------------------------

    @PostMapping("/fases/{faseId}/responder")
    public ResponseEntity<FeedbackRespostaDto> responder(
            @PathVariable Long faseId,
            @RequestBody RespostaSubmitDto dto,
            @AuthenticationPrincipal Usuario usuario) {

        Fase fase = faseRepo.findById(faseId).orElseThrow();

        String gabarito;
        String explicacao;

        if (dto.exercicioId() != null) {
            Exercicio ex = exercicioRepo.findById(dto.exercicioId()).orElseThrow();
            gabarito   = ex.getGabarito();
            explicacao = ex.getExplicacao();
        } else {
            // Questão externa — gabarito será integrado ao JSON enriquecido futuramente
            gabarito   = "Ver gabarito no banco externo";
            explicacao = "";
        }

        boolean correto = gabarito.equalsIgnoreCase(dto.respostaDada().trim());

        Resposta resposta = new Resposta();
        resposta.setUsuario(usuario);
        resposta.setFase(fase);
        resposta.setBloco(dto.bloco());
        resposta.setRodada(dto.rodada());
        resposta.setTentativaDesafio(dto.tentativaDesafio());
        resposta.setRespostaDada(dto.respostaDada());
        resposta.setCorreto(correto);

        if (dto.exercicioId() != null) {
            Exercicio ex = new Exercicio();
            ex.setId(dto.exercicioId());
            resposta.setExercicio(ex);
        }

        if (dto.questaoClassificadaId() != null) {
            QuestaoClassificada qc = new QuestaoClassificada();
            qc.setId(dto.questaoClassificadaId());
            resposta.setQuestaoClassificada(qc);
        }

        respostaRepo.save(resposta);

        return ResponseEntity.ok(new FeedbackRespostaDto(correto, gabarito, explicacao));
    }

    // ------------------------------------------------------------------
    // CHECKPOINTS
    // ------------------------------------------------------------------

    @PostMapping("/fases/{faseId}/pratica/checkpoint")
    public ResponseEntity<CheckpointResultadoDto> checkpointPratica(
            @PathVariable Long faseId,
            @AuthenticationPrincipal Usuario usuario) {

        // lê acertos ANTES do serviço porque resetarPratica apaga as respostas
        int acertos = respostaRepo.contarAcertosPraticaTotal(usuario.getId(), faseId);

        ResultadoCheckpoint resultado =
                progressoService.avaliarCheckpointPratica(usuario, faseId);

        String mensagem = switch (resultado) {
            case APROVADO          -> "Parabéns! Você avançou para o Desafio.";
            case REPROVADO_PRATICA -> "Você precisava de 9 acertos. Tente novamente!";
            default                -> "";
        };

        return ResponseEntity.ok(
                new CheckpointResultadoDto(resultado, acertos, 12, mensagem));
    }

    @PostMapping("/fases/{faseId}/desafio/checkpoint")
    public ResponseEntity<CheckpointResultadoDto> checkpointDesafio(
            @PathVariable Long faseId,
            @AuthenticationPrincipal Usuario usuario) {

        // calcula tentativa ANTES do serviço: após REPROVADO_MUNDO_ZERADO,
        // resetarFasesPorMundo zera desafioTentativas para 0 e a query retornaria 0
        short tentativa = (short) (progressoFaseRepo
                .findByUsuarioIdAndFaseId(usuario.getId(), faseId)
                .map(ProgressoFase::getDesafioTentativas)
                .orElse((short) 0) + 1);

        // total dinâmico: conta exatamente quantos itens de desafio existem na fase
        int total = exercicioRepo.countByFaseIdAndBlocoAndAtivoTrue(faseId, Exercicio.Bloco.DESAFIO)
                  + questaoClassificadaRepo.countByFaseIdAndBlocoAndAtivoTrue(faseId, QuestaoClassificada.Bloco.DESAFIO);

        ResultadoCheckpoint resultado =
                progressoService.avaliarCheckpointDesafio(usuario, faseId, total);

        int acertos = respostaRepo.contarAcertosDesafio(
                usuario.getId(), faseId, tentativa);

        String mensagem = switch (resultado) {
            case APROVADO                -> "Fase concluída! Próxima fase desbloqueada.";
            case REPROVADO_DESAFIO_RETRY -> "Quase lá! Você tem mais uma tentativa.";
            case REPROVADO_MUNDO_ZERADO  -> "Mundo zerado. Recomece do início!";
            default                      -> "";
        };

        return ResponseEntity.ok(
                new CheckpointResultadoDto(resultado, acertos, total, mensagem));
    }

    // ------------------------------------------------------------------
    // RECORDS INTERNOS
    // ------------------------------------------------------------------

    record MundoResumoDto(
            Long id,
            Short numero,
            String nome,
            String descricao,
            boolean desbloqueado) {}

    record FaseResumoDto(
            Long id,
            Short numero,
            String nome,
            Short ordemNoMundo,
            PontoRetomada etapa,
            boolean desbloqueada
            ) {}
}
