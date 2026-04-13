package br.com.rinhadeconcurseiro.interage.service;

import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.interage.entity.Fase;
import br.com.rinhadeconcurseiro.interage.entity.ProgressoFase;
import br.com.rinhadeconcurseiro.interage.entity.ProgressoMundo;
import br.com.rinhadeconcurseiro.interage.enums.PontoRetomada;
import br.com.rinhadeconcurseiro.interage.enums.ResultadoCheckpoint;
import br.com.rinhadeconcurseiro.interage.repository.FaseRepository;
import br.com.rinhadeconcurseiro.interage.repository.ProgressoFaseRepository;
import br.com.rinhadeconcurseiro.interage.repository.ProgressoMundoRepository;
import br.com.rinhadeconcurseiro.interage.repository.RespostaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProgressoService {

    private static final int TOTAL_EXERCICIOS_PRATICA = 12;
    private static final int TOTAL_EXERCICIOS_DESAFIO = 8;
    private static final double PERCENTUAL_MINIMO = 0.70;

    private static final int ACERTOS_MINIMOS_PRATICA =
            (int) Math.ceil(TOTAL_EXERCICIOS_PRATICA * PERCENTUAL_MINIMO);

    private static final int ACERTOS_MINIMOS_DESAFIO =
            (int) Math.ceil(TOTAL_EXERCICIOS_DESAFIO * PERCENTUAL_MINIMO);

    private final ProgressoFaseRepository progressoFaseRepository;
    private final ProgressoMundoRepository progressoMundoRepository;
    private final RespostaRepository respostaRepository;
    private final FaseRepository faseRepository;

    //******************
    //save points
    //******************

    @Transactional
    public void salvarBloco1Concluido(Usuario usuario, Long faseId){
        ProgressoFase pf = obterOuCriar(usuario, faseId);
        pf.setBloco1Concluido(true);
        pf.setUltimaAtividadeEm(LocalDateTime.now());
        progressoFaseRepository.save(pf);
    }

    @Transactional
    public void salvarRodadaConcluida(Usuario usuario, Long faseId, short rodada){
        ProgressoFase pf = obterOuCriar(usuario, faseId);
        switch (rodada){
            case 1 -> pf.setRodada1Concluida(true);
            case 2 -> pf.setRodada2Concluida(true);
            case 3 -> pf.setRodada3Concluida(true);
            default -> throw new IllegalArgumentException("Rodada inválida: " + rodada);
        }
        pf.setUltimaAtividadeEm(LocalDateTime.now());
        progressoFaseRepository.save(pf);
    }

    //******************
    //checkpoint da prática
    //******************

    @Transactional
    public ResultadoCheckpoint avaliarCheckpointPratica(Usuario usuario, Long faseId){
        int acertos = respostaRepository.contarAcertosPraticaTotal(usuario.getId(), faseId);

        if(acertos >= ACERTOS_MINIMOS_PRATICA){
            ProgressoFase pf = obterOuCriar(usuario, faseId);
            pf.setScorePratica((short) acertos);
            pf.setRodada3Concluida(true);
            pf.setUltimaAtividadeEm(LocalDateTime.now());
            progressoFaseRepository.save(pf);
            return ResultadoCheckpoint.APROVADO;
        }

        //falhou - zera as rodadas, mas mantém bloco1
        resetarPratica(usuario, faseId);
        return ResultadoCheckpoint.REPROVADO_PRATICA;
    }

    //******************
    //checkpoint do desafio
    //******************

    @Transactional
    public ResultadoCheckpoint avaliarCheckpointDesafio(Usuario usuario, Long faseId){

        ProgressoFase pf = obterOuCriar(usuario, faseId);
        short tentativa = (short) (pf.getDesafioTentativas() + 1);
        int acertos = respostaRepository.contarAcertosDesafio(usuario.getId(), faseId, tentativa);

        //persiste tentativa e score
        pf.setDesafioTentativas(tentativa);
        if(tentativa == 1) pf.setScoreDesafioT1((short) acertos);
        else pf.setScoreDesafioT2((short) acertos);
        pf.setUltimaAtividadeEm(LocalDateTime.now());

        if(acertos >= ACERTOS_MINIMOS_DESAFIO){
            concluirFase(pf, usuario);
            progressoFaseRepository.save(pf);
            return ResultadoCheckpoint.APROVADO;
        }

        if(tentativa == 1){
            //primeira falha - salva e libera retry
            progressoFaseRepository.save(pf);
            return ResultadoCheckpoint.REPROVADO_DESAFIO_RETRY;
        }

        //segunda falha - zera o mundo inteiro
        progressoFaseRepository.save(pf);
        resetarMundo(usuario, faseId);
        return ResultadoCheckpoint.REPROVADO_MUNDO_ZERADO;
    }

    //******************
    //retomada de sessão
    //******************

    @Transactional(readOnly = true)
    public PontoRetomada obterPontoRetomada(Usuario usuario, Long faseId){

        ProgressoFase pf = progressoFaseRepository.findByUsuarioIdAndFaseId(usuario.getId(), faseId)
                .orElse(null);

        if (pf == null || !pf.getBloco1Concluido()) return PontoRetomada.BLOCO_1;
        if (!pf.getRodada1Concluida()) return PontoRetomada.RODADA_1;
        if (!pf.getRodada2Concluida()) return PontoRetomada.RODADA_2;
        if (!pf.getRodada3Concluida()) return PontoRetomada.RODADA_3;
        if (pf.getDesafioConcluido()) return PontoRetomada.CONCLUIDA;
        if (pf.getDesafioTentativas() < 2) return PontoRetomada.DESAFIO;

        //chegou aqui apenas se tentativas == 2 e desafio não concluído
        //estado inconsistente pós-reset - nunca deve ocorrer em prod
        return PontoRetomada.BLOCO_1;
    }

    //******************
    //desbloqueio inicial
    //******************

    @Transactional
    public void desbloquearFase(Usuario usuario, Long faseId){
        ProgressoFase pf = obterOuCriar(usuario, faseId);

        if(!pf.getDesbloqueada()){
            pf.setDesbloqueada(true);
            pf.setDesbloqueadaEm(LocalDateTime.now());
            progressoFaseRepository.save(pf);
        }
    }

    @Transactional
    public void desbloquearMundo(Usuario usuario, Long mundoId) {
        ProgressoMundo pm = progressoMundoRepository
                .findByUsuarioIdAndMundoId(usuario.getId(), mundoId)
                .orElseGet(() -> {
                    ProgressoMundo novo = new ProgressoMundo();
                    novo.setUsuario(usuario);
                    novo.setMundo(faseRepository.findById(mundoId)
                            .orElseThrow().getMundo());
                    return novo;
                });

        if (!pm.getDesbloqueado()) {
            pm.setDesbloqueado(true);
            progressoMundoRepository.save(pm);
        }
    }

    //******************
    //helpers
    //******************

    private ProgressoFase obterOuCriar(Usuario usuario, Long faseId){
        return progressoFaseRepository.findByUsuarioIdAndFaseId(usuario.getId(), faseId)
                .orElseGet(() -> {
                    Fase fase = faseRepository.findById(faseId)
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Fase não encontrada: " + faseId));
                    ProgressoFase novo = new ProgressoFase();
                    novo.setUsuario(usuario);
                    novo.setFase(fase);
                    return novo;
                });
    }

    private void concluirFase(ProgressoFase pf, Usuario usuario){
        pf.setDesafioConcluido(true);
        pf.setUltimaAtividadeEm(LocalDateTime.now());

        //tenta desbloquear a próxima fase do mesmo mundo
        Fase faseAtual = pf.getFase();
        short proximaOrdem = (short)(faseAtual.getOrdemNoMundo()+1);

        faseRepository.findAllByMundoIdAndAtivoTrueOrderByOrdemNoMundoAsc(
                faseAtual.getMundo().getId())
                .stream()
                .filter(f -> f.getOrdemNoMundo() == proximaOrdem)
                .findFirst()
                .ifPresent(f -> desbloquearFase(usuario, f.getId()));
    }

    private void resetarPratica(Usuario usuario, Long faseId){
        respostaRepository.deletePraticaByUsuarioIdAndFaseId(usuario.getId(), faseId);
        ProgressoFase pf = obterOuCriar(usuario, faseId);
        pf.setRodada1Concluida(false);
        pf.setRodada2Concluida(false);
        pf.setRodada3Concluida(false);
        pf.setScorePratica(null);
        pf.setUltimaAtividadeEm(LocalDateTime.now());
        progressoFaseRepository.save(pf);
    }

    private void resetarMundo(Usuario usuario, Long faseId){
        Long mundoId = faseRepository.findById(faseId)
                .orElseThrow().getMundo().getId();

        progressoFaseRepository.resetarFasesPorMundo(usuario.getId(), mundoId);

        progressoMundoRepository.findByUsuarioIdAndMundoId(usuario.getId(), mundoId)
                .ifPresent(pm -> {
                    pm.setTotalResets(pm.getTotalResets() + 1);
                    pm.setUltimoResetEm(LocalDateTime.now());
                    progressoMundoRepository.save(pm);
                });
    }

}
