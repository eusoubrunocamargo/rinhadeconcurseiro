package br.com.rinhadeconcurseiro.interage.service;

import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.interage.dto.ExercicioDto;
import br.com.rinhadeconcurseiro.interage.dto.QuestaoClassificadaDto;
import br.com.rinhadeconcurseiro.interage.dto.SessaoFaseDto;
import br.com.rinhadeconcurseiro.interage.entity.Exercicio;
import br.com.rinhadeconcurseiro.interage.entity.Fase;
import br.com.rinhadeconcurseiro.interage.entity.ProgressoFase;
import br.com.rinhadeconcurseiro.interage.entity.QuestaoClassificada;
import br.com.rinhadeconcurseiro.interage.enums.PontoRetomada;
import br.com.rinhadeconcurseiro.interage.repository.ExercicioRepository;
import br.com.rinhadeconcurseiro.interage.repository.FaseRepository;
import br.com.rinhadeconcurseiro.interage.repository.ProgressoFaseRepository;
import br.com.rinhadeconcurseiro.interage.repository.QuestaoClassificadaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessaoService {

    private final FaseRepository faseRepository;
    private final ExercicioRepository exercicioRepository;
    private final QuestaoClassificadaRepository questaoClassificadaRepository;
    private final ProgressoFaseRepository progressoFaseRepository;
    private final ProgressoService progressoService;

    //******************
    //Sessão da fase - ponto de entrada do frontend ao abrir uma fase
    //******************

    @Transactional(readOnly = true)
    public SessaoFaseDto iniciarSessao(Usuario usuario, Long faseId){
        Fase fase = faseRepository.findById(faseId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Fase não encontrada: " + faseId
                ));

        validarAcesso(usuario, fase);

        PontoRetomada ponto = progressoService.obterPontoRetomada(usuario, faseId);

        return switch (ponto){
            case BLOCO_1 -> montarRespostaBloco1(fase);
            case RODADA_1 -> montarRespostaPratica(fase, (short) 1);
            case RODADA_2 -> montarRespostaPratica(fase, (short) 2);
            case RODADA_3 -> montarRespostaPratica(fase, (short) 3);
            case DESAFIO -> montarRespostaDesafio(fase, usuario);
            case CONCLUIDA -> SessaoFaseDto.concluida(fase.getId(), fase.getNome());
        };
    }

    //******************
    //Montagem de respostas por etapa
    //******************

    private SessaoFaseDto montarRespostaBloco1(Fase fase){
        return new SessaoFaseDto(
                fase.getId(),
                fase.getNome(),
                PontoRetomada.BLOCO_1,
                fase.getConteudoIntroducaoHtml(),
                null,
                null,
                null
        );
    }

    private SessaoFaseDto montarRespostaPratica(Fase fase, short rodada) {
        List<ExercicioDto> exercicios = exercicioRepository
                .findAllByFaseIdAndBlocoAndAtivoTrueOrderByRodadaAscOrdemNaRodadaAsc(
                        fase.getId(),
                        Exercicio.Bloco.PRATICA)
                .stream()
                .filter(e -> e.getRodada() != null && e.getRodada() == rodada)
                .map(ExercicioDto::from)
                .toList();

        return new SessaoFaseDto(
                fase.getId(),
                fase.getNome(),
                rodadaParaPonto(rodada),
                null,
                exercicios,
                null,
                null
        );
    }

    private SessaoFaseDto montarRespostaDesafio(Fase fase, Usuario usuario) {
        List<ExercicioDto> exercicios = exercicioRepository
                .findAllByFaseIdAndBlocoAndAtivoTrueOrderByRodadaAscOrdemNaRodadaAsc(
                        fase.getId(), Exercicio.Bloco.DESAFIO)
                .stream()
                .map(ExercicioDto::from)
                .toList();

        List<QuestaoClassificadaDto> questoes = questaoClassificadaRepository
                .findAllByFaseIdAndBlocoAndAtivoTrue(fase.getId(), QuestaoClassificada.Bloco.DESAFIO)
                .stream()
                .map(QuestaoClassificadaDto::from)
                .toList();

        short tentativas = progressoFaseRepository
                .findByUsuarioIdAndFaseId(usuario.getId(), fase.getId())
                .map(ProgressoFase::getDesafioTentativas)
                .orElse((short) 0);

        return new SessaoFaseDto(
                fase.getId(),
                fase.getNome(),
                PontoRetomada.DESAFIO,
                null,
                exercicios,
                questoes,
                tentativas
        );
    }

    //******************
    //helpers
    //******************

    private void validarAcesso(Usuario usuario, Fase fase){
        boolean desbloqueada = progressoFaseRepository
                .findByUsuarioIdAndFaseId(usuario.getId(), fase.getId())
                .map(ProgressoFase::getDesbloqueada)
                .orElse(false);

        //Fase 1 do Mundo 1 é sempre acessível
        boolean isPrimeiraFase = fase.getOrdemNoMundo() == 1
                && fase.getMundo().getNumero() == 1;

        if(!desbloqueada && !isPrimeiraFase){
            throw new IllegalArgumentException("Fase bloqueada: " + fase.getId());
        }
    }

    private PontoRetomada rodadaParaPonto(short rodada){
        return switch (rodada){
            case 1 -> PontoRetomada.RODADA_1;
            case 2 -> PontoRetomada.RODADA_2;
            case 3 -> PontoRetomada.RODADA_3;
            default -> throw new IllegalArgumentException("Rodada inválida: " + rodada);
        };
    }

}
