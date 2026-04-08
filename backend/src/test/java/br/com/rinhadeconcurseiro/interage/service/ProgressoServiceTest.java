package br.com.rinhadeconcurseiro.interage.service;

import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.interage.entity.*;
import br.com.rinhadeconcurseiro.interage.enums.ResultadoCheckpoint;
import br.com.rinhadeconcurseiro.interage.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgressoServiceTest {

    @Mock private ProgressoFaseRepository  progressoFaseRepo;
    @Mock private ProgressoMundoRepository progressoMundoRepo;
    @Mock private RespostaRepository       respostaRepo;
    @Mock private FaseRepository           faseRepo;

    @InjectMocks
    private ProgressoService service;

    private Usuario usuario;
    private Fase    fase;
    private Mundo   mundo;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);

        mundo = new Mundo();
        mundo.setId(10L);

        fase = new Fase();
        fase.setId(100L);
        fase.setMundo(mundo);
        fase.setOrdemNoMundo((short) 1);
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT DA PRÁTICA
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("Checkpoint da Prática")
    class CheckpointPratica {

        @Test
        @DisplayName("Deve aprovar quando acertos >= 9")
        void deveAprovarComNoveOuMaisAcertos() {
            when(respostaRepo.contarAcertosPraticaTotal(1L, 100L)).thenReturn(9);
            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.of(progressoFaseVazio()));
            //when(faseRepo.findById(100L)).thenReturn(Optional.of(fase));

            ResultadoCheckpoint resultado =
                    service.avaliarCheckpointPratica(usuario, 100L);

            assertThat(resultado).isEqualTo(ResultadoCheckpoint.APROVADO);
            verify(progressoFaseRepo).save(any(ProgressoFase.class));
        }

        @Test
        @DisplayName("Deve reprovar e zerar rodadas quando acertos < 9")
        void deveReprovarComMenosDeNoveAcertos() {
            when(respostaRepo.contarAcertosPraticaTotal(1L, 100L)).thenReturn(7);
            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.of(progressoFaseVazio()));
            //when(faseRepo.findById(100L)).thenReturn(Optional.of(fase));

            ResultadoCheckpoint resultado =
                    service.avaliarCheckpointPratica(usuario, 100L);

            assertThat(resultado).isEqualTo(ResultadoCheckpoint.REPROVADO_PRATICA);

            // Verifica que as rodadas foram zeradas
            verify(progressoFaseRepo, times(1)).save(argThat(pf ->
                    !pf.getRodada1Concluida()
                            && !pf.getRodada2Concluida()
                            && !pf.getRodada3Concluida()
                            && pf.getScorePratica() == null
            ));
        }

        @Test
        @DisplayName("Limite exato: 8 acertos deve reprovar")
        void oitoAcertosDeveReprovar() {
            when(respostaRepo.contarAcertosPraticaTotal(1L, 100L)).thenReturn(8);
            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.of(progressoFaseVazio()));
            //when(faseRepo.findById(100L)).thenReturn(Optional.of(fase));

            ResultadoCheckpoint resultado =
                    service.avaliarCheckpointPratica(usuario, 100L);

            assertThat(resultado).isEqualTo(ResultadoCheckpoint.REPROVADO_PRATICA);
        }

        @Test
        @DisplayName("Limite exato: 12 acertos deve aprovar")
        void dozeAcertosDeveAprovar() {
            when(respostaRepo.contarAcertosPraticaTotal(1L, 100L)).thenReturn(12);
            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.of(progressoFaseVazio()));
            //when(faseRepo.findById(100L)).thenReturn(Optional.of(fase));

            ResultadoCheckpoint resultado =
                    service.avaliarCheckpointPratica(usuario, 100L);

            assertThat(resultado).isEqualTo(ResultadoCheckpoint.APROVADO);
        }
    }

    // -------------------------------------------------------------------------
    // CHECKPOINT DO DESAFIO
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("Checkpoint do Desafio")
    class CheckpointDesafio {

        @Test
        @DisplayName("Deve aprovar na primeira tentativa com >= 6 acertos")
        void deveAprovarNaPrimeiraTentativa() {
            ProgressoFase pf = progressoFaseVazio(); // tentativas = 0

            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.of(pf));
            when(respostaRepo.contarAcertosDesafio(1L, 100L, (short) 1))
                    .thenReturn(6);
            //when(faseRepo.findById(100L)).thenReturn(Optional.of(fase));
            when(faseRepo.findAllByMundoIdAndAtivoTrueOrderByOrdemNoMundoAsc(10L))
                    .thenReturn(java.util.List.of(fase));

            ResultadoCheckpoint resultado =
                    service.avaliarCheckpointDesafio(usuario, 100L);

            assertThat(resultado).isEqualTo(ResultadoCheckpoint.APROVADO);
            assertThat(pf.getDesafioConcluido()).isTrue();
        }

        @Test
        @DisplayName("Deve liberar retry na primeira falha do desafio")
        void deveLiberarRetryNaPrimeiraFalha() {
            ProgressoFase pf = progressoFaseVazio(); // tentativas = 0

            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.of(pf));
            when(respostaRepo.contarAcertosDesafio(1L, 100L, (short) 1))
                    .thenReturn(4);

            ResultadoCheckpoint resultado =
                    service.avaliarCheckpointDesafio(usuario, 100L);

            assertThat(resultado).isEqualTo(ResultadoCheckpoint.REPROVADO_DESAFIO_RETRY);
            assertThat(pf.getDesafioTentativas()).isEqualTo((short) 1);
            assertThat(pf.getScoreDesafioT1()).isEqualTo((short) 4);
        }

        @Test
        @DisplayName("Deve zerar o mundo na segunda falha do desafio")
        void deveZerarMundoNaSegundaFalha() {
            ProgressoFase pf = progressoFaseComPrimeiraFalha(); // já falhou 1x

            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.of(pf));
            when(respostaRepo.contarAcertosDesafio(1L, 100L, (short) 2))
                    .thenReturn(3);
            when(faseRepo.findById(100L)).thenReturn(Optional.of(fase));
            when(progressoMundoRepo.findByUsuarioIdAndMundoId(1L, 10L))
                    .thenReturn(Optional.of(progressoMundoVazio()));

            ResultadoCheckpoint resultado =
                    service.avaliarCheckpointDesafio(usuario, 100L);

            assertThat(resultado).isEqualTo(ResultadoCheckpoint.REPROVADO_MUNDO_ZERADO);
            verify(progressoFaseRepo).resetarFasesPorMundo(1L, 10L);
            verify(progressoMundoRepo).save(argThat(pm ->
                    pm.getTotalResets() == 1
            ));
        }

        @Test
        @DisplayName("Deve aprovar na segunda tentativa com >= 6 acertos")
        void deveAprovarNaSegundaTentativa() {
            ProgressoFase pf = progressoFaseComPrimeiraFalha();

            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.of(pf));
            when(respostaRepo.contarAcertosDesafio(1L, 100L, (short) 2))
                    .thenReturn(8);
            //when(faseRepo.findById(100L)).thenReturn(Optional.of(fase));
            when(faseRepo.findAllByMundoIdAndAtivoTrueOrderByOrdemNoMundoAsc(10L))
                    .thenReturn(java.util.List.of(fase));

            ResultadoCheckpoint resultado =
                    service.avaliarCheckpointDesafio(usuario, 100L);

            assertThat(resultado).isEqualTo(ResultadoCheckpoint.APROVADO);
            assertThat(pf.getDesafioConcluido()).isTrue();
            assertThat(pf.getScoreDesafioT2()).isEqualTo((short) 8);
        }
    }

    // -------------------------------------------------------------------------
    // PONTO DE RETOMADA
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("Ponto de Retomada")
    class PontoRetomadaTestes {

        @Test
        @DisplayName("Deve retornar BLOCO_1 quando não há progresso")
        void deveRetornarBloco1SemProgresso() {
            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.empty());

            var ponto = service.obterPontoRetomada(usuario, 100L);

            assertThat(ponto).isEqualTo(
                    br.com.rinhadeconcurseiro.interage.enums.PontoRetomada.BLOCO_1);
        }

        @Test
        @DisplayName("Deve retornar RODADA_2 quando rodada 1 concluída")
        void deveRetornarRodada2QuandoRodada1Concluida() {
            ProgressoFase pf = progressoFaseVazio();
            pf.setBloco1Concluido(true);
            pf.setRodada1Concluida(true);

            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.of(pf));

            var ponto = service.obterPontoRetomada(usuario, 100L);

            assertThat(ponto).isEqualTo(
                    br.com.rinhadeconcurseiro.interage.enums.PontoRetomada.RODADA_2);
        }

        @Test
        @DisplayName("Deve retornar CONCLUÍDA quando desafio concluído")
        void deveRetornarConcluidaQuandoDesafioConcluido() {
            ProgressoFase pf = progressoFaseVazio();
            pf.setBloco1Concluido(true);
            pf.setRodada1Concluida(true);
            pf.setRodada2Concluida(true);
            pf.setRodada3Concluida(true);
            pf.setDesafioConcluido(true);

            when(progressoFaseRepo.findByUsuarioIdAndFaseId(1L, 100L))
                    .thenReturn(Optional.of(pf));

            var ponto = service.obterPontoRetomada(usuario, 100L);

            assertThat(ponto).isEqualTo(
                    br.com.rinhadeconcurseiro.interage.enums.PontoRetomada.CONCLUIDA);
        }
    }

    // -------------------------------------------------------------------------
    // HELPERS DE FIXTURE
    // -------------------------------------------------------------------------

    private ProgressoFase progressoFaseVazio() {
        ProgressoFase pf = new ProgressoFase();
        pf.setUsuario(usuario);
        pf.setFase(fase);
        pf.setDesbloqueada(true);
        pf.setBloco1Concluido(false);
        pf.setRodada1Concluida(false);
        pf.setRodada2Concluida(false);
        pf.setRodada3Concluida(false);
        pf.setDesafioTentativas((short) 0);
        pf.setDesafioConcluido(false);
        return pf;
    }

    private ProgressoFase progressoFaseComPrimeiraFalha() {
        ProgressoFase pf = progressoFaseVazio();
        pf.setBloco1Concluido(true);
        pf.setRodada1Concluida(true);
        pf.setRodada2Concluida(true);
        pf.setRodada3Concluida(true);
        pf.setDesafioTentativas((short) 1);
        pf.setScoreDesafioT1((short) 4);
        return pf;
    }

    private ProgressoMundo progressoMundoVazio() {
        ProgressoMundo pm = new ProgressoMundo();
        pm.setUsuario(usuario);
        pm.setMundo(mundo);
        pm.setDesbloqueado(true);
        pm.setTotalResets(0);
        return pm;
    }
}