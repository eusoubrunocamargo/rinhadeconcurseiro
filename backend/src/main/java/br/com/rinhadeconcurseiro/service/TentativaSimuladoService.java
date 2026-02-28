package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.request.RespostaRequest;
import br.com.rinhadeconcurseiro.dto.request.SalvarRespostasRequest;
import br.com.rinhadeconcurseiro.dto.response.*;
import br.com.rinhadeconcurseiro.entity.*;
import br.com.rinhadeconcurseiro.enums.*;
import br.com.rinhadeconcurseiro.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TentativaSimuladoService {

    private final TentativaSimuladoRepository tentativaRepository;
    private final RespostaQuestaoRepository respostaRepository;
    private final SimuladoRepository simuladoRepository;
    private final SimuladoQuestaoRepository simuladoQuestaoRepository;
    private final UsuarioRepository usuarioRepository;

    //===========
    // Iniciar tentativa
    //===========

    @Transactional
    public TentativaIniciadaResponse iniciar(Long simuladoId, Long usuarioId, boolean refazer) {
        // Verificar se já existe tentativa em andamento
        Optional<TentativaSimulado> emAndamento = tentativaRepository
                .findByUsuarioIdAndSimuladoIdAndFinalizadaFalse(usuarioId, simuladoId);

        if (emAndamento.isPresent()) {
            if (refazer) {
                Long tentativaId = emAndamento.get().getId();
                int deleted = tentativaRepository.deleteByIdAndUsuarioIdAndFinalizadaFalse(tentativaId, usuarioId);
                if (deleted == 0) {
                    log.warn("Conflito ao refazer tentativa: tentativaId={} usuarioId={} motivo=nao_excluida_por_estado",
                            tentativaId, usuarioId);
                } else {
                    log.info("Tentativa em andamento excluída para refazer: tentativaId={} usuarioId={}",
                            tentativaId, usuarioId);
                }
            } else {
                // Retornar tentativa existente para continuar
                TentativaSimulado tentativa = emAndamento.get();
                Simulado simulado = tentativa.getSimulado();
                return new TentativaIniciadaResponse(
                        tentativa.getId(),
                        simulado.getId(),
                        simulado.getTitulo(),
                        simulado.getTotalQuestoes(),
                        tentativa.getDataInicio()
                );
            }
        }

        // IMPORTANTE: Não excluir tentativas finalizadas!
        // Elas alimentam os cadernos e o histórico.

        // Criar tentativa
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        Simulado simulado = simuladoRepository.findById(simuladoId)
                .orElseThrow(() -> new EntityNotFoundException("Simulado não encontrado"));

        TentativaSimulado tentativa = TentativaSimulado.builder()
                .usuario(usuario)
                .simulado(simulado)
                .dataInicio(LocalDateTime.now())
                .finalizada(false)
                .build();

        tentativa = tentativaRepository.save(tentativa);

        return new TentativaIniciadaResponse(
                tentativa.getId(),
                simulado.getId(),
                simulado.getTitulo(),
                simulado.getTotalQuestoes(),
                tentativa.getDataInicio()
        );
    }

    // Sobrecarga para manter compatibilidade
    @Transactional
    public TentativaIniciadaResponse iniciar(Long simuladoId, Long usuarioId) {
        return iniciar(simuladoId, usuarioId, false);
    }

    //===========
    // Salvar Respostas
    //===========

    @Transactional
    public void salvarRespostas(Long tentativaId, Long usuarioId, SalvarRespostasRequest request) {
        TentativaSimulado tentativa = getTentativaDoUsuarioComLock(tentativaId, usuarioId);
        if (tentativa.getFinalizada()) {
            log.info("Salvar idempotente ignorado: tentativaId={} usuarioId={} motivo=tentativa_finalizada",
                    tentativaId, usuarioId);
            return;
        }

        // Deduplica por simuladoQuestaoId (última resposta vence) para evitar processamento duplicado.
        Map<Long, RespostaRequest> respostasPorQuestao = request.respostas().stream()
                .collect(Collectors.toMap(
                        RespostaRequest::simuladoQuestaoId,
                        req -> req,
                        (oldValue, newValue) -> newValue,
                        LinkedHashMap::new
                ));

        Map<Long, SimuladoQuestao> simuladoQuestoesPorId = simuladoQuestaoRepository
                .findAllById(respostasPorQuestao.keySet())
                .stream()
                .collect(Collectors.toMap(SimuladoQuestao::getId, sq -> sq, (oldValue, newValue) -> oldValue, HashMap::new));

        List<Long> idsInvalidos = new ArrayList<>();
        for (Long simuladoQuestaoId : respostasPorQuestao.keySet()) {
            SimuladoQuestao sq = simuladoQuestoesPorId.get(simuladoQuestaoId);
            if (sq == null || sq.getSimulado() == null || !sq.getSimulado().getId().equals(tentativa.getSimulado().getId())) {
                idsInvalidos.add(simuladoQuestaoId);
            }
        }

        if (!idsInvalidos.isEmpty()) {
            throw new EntityNotFoundException("Questão do simulado não encontrada: " + idsInvalidos.get(0));
        }

        for (RespostaRequest req : respostasPorQuestao.values()) {
            respostaRepository.upsertResposta(
                    tentativaId,
                    req.simuladoQuestaoId(),
                    req.resposta() == null ? null : req.resposta().name(),
                    req.confianca() == null ? null : req.confianca().name(),
                    req.tipoErro() == null ? null : req.tipoErro().name()
            );
        }
    }

    //===========
    // Finalizar tentativa
    //===========

    @Transactional
    public TentativaDetalheResponse finalizar(Long tentativaId, Long usuarioId) {
        TentativaSimulado tentativa = getTentativaDoUsuarioComLock(tentativaId, usuarioId);
        List<RespostaQuestao> respostas = respostaRepository.findDetalhadasByTentativaId(tentativaId);
        if (tentativa.getFinalizada()) {
            log.info("Finalização idempotente: tentativaId={} usuarioId={} motivo=ja_finalizada",
                    tentativaId, usuarioId);
            return toDetalheResponse(tentativa, respostas);
        }

        //classificar cada resposta
        int acertos = 0;
        int erros = 0;
        int emBranco = 0;

        for (RespostaQuestao resposta : respostas) {
            classificarResposta(resposta);

            if (resposta.getResposta() == null || resposta.getResposta() == RespostaTipo.BRANCO) {
                emBranco++;
            } else if (resposta.isAcerto()) {
                acertos++;
            } else {
                erros++;
            }
        }

        //atualizar métricas da tentativa
        tentativa.setAcertos(acertos);
        tentativa.setErros(erros);
        tentativa.setEmBranco(emBranco);
        tentativa.setPontuacao(acertos - erros);
        tentativa.setFinalizada(true);
        tentativa.setDataFim(LocalDateTime.now());

        tentativaRepository.save(tentativa);
        log.info("Tentativa finalizada com sucesso: tentativaId={} usuarioId={} acertos={} erros={} emBranco={}",
                tentativaId, usuarioId, acertos, erros, emBranco);

        return toDetalheResponse(tentativa, respostas);
    }

    //===========
    // Consultas
    //===========
    @Transactional(readOnly = true)
    public List<TentativaResumoResponse> listarEmAndamento(Long usuarioId) {
        return tentativaRepository.findByUsuarioIdAndFinalizadaFalseOrderByDataInicioDesc(usuarioId)
                .stream()
                .map(this::toResumoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TentativaResumoResponse> listarFinalizados(Long usuarioId) {
        // Buscar apenas a última tentativa finalizada de cada simulado
        return tentativaRepository.findUltimasTentativasFinalizadasPorSimulado(usuarioId)
                .stream()
                .map(this::toResumoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TentativaDetalheResponse buscarPorId(Long tentativaId, Long usuarioId) {
        TentativaSimulado tentativa = getTentativaDoUsuario(tentativaId, usuarioId);
        List<RespostaQuestao> respostas = respostaRepository.findDetalhadasByTentativaId(tentativaId);
        return toDetalheResponse(tentativa, respostas);
    }

    @Transactional(readOnly = true)
    public MeuProgressoResponse obterProgresso(Long usuarioId) {
        int emAndamento = tentativaRepository
                .findByUsuarioIdAndFinalizadaFalseOrderByDataInicioDesc(usuarioId).size();

        long finalizados = tentativaRepository.countByUsuarioIdAndFinalizadaTrue(usuarioId);

        Double media = tentativaRepository.calcularMediaAproveitamento(usuarioId);

        CadernoResumoResponse cadernos = obterResumoCadernos(usuarioId);

        // top 5 assuntos por caderno — mesmo método reutilizado pela Sprint 2
        Map<String, List<ResumoAssuntoResponse>> topAssuntos = Map.of(
                "VERMELHO", resumoAssuntosPorCaderno(usuarioId, Caderno.VERMELHO, 5),
                "AMARELO", resumoAssuntosPorCaderno(usuarioId, Caderno.AMARELO, 5),
                "VERDE", resumoAssuntosPorCaderno(usuarioId, Caderno.VERDE, 5)
        );

        return new MeuProgressoResponse(
                emAndamento,
                (int) finalizados,
                media != null ? media : 0.0,
                cadernos,
                topAssuntos
        );
    }

    // Método central de agregação — usado tanto pelo dashboard (limit=5)
    // quanto pelo endpoint /resumo do CadernoView (limit=Integer.MAX_VALUE):

    @Transactional(readOnly = true)
    public List<ResumoAssuntoResponse> resumoAssuntosPorCaderno(
            Long usuarioId, Caderno caderno, int limit) {

        return respostaRepository
                .aggregatePorAssunto(usuarioId, caderno.name())
                .stream()
                .limit(limit)
                .map(row -> {
                    long total = ((Number) row[2]).longValue();
                    long acertos = ((Number) row[3]).longValue();
                    long erros = total - acertos;
                    double pct = total > 0 ? (acertos * 100.0) / total : 0.0;

                    return new ResumoAssuntoResponse(
                            ((Number) row[0]).longValue(),  // assuntoId
                            (String) row[1],               // assuntoNome
                            (int) total,
                            (int) acertos,
                            (int) erros,
                            Math.round(pct * 100.0) / 100.0 // arredonda para 2 casas
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public CadernoResumoResponse obterResumoCadernos(Long usuarioId) {
        List<Object[]> counts = respostaRepository.countByUsuarioIdGroupByCaderno(usuarioId);

        int vermelho = 0, amarelo = 0, verde = 0;

        for (Object[] row : counts) {
            Caderno caderno = (Caderno) row[0];
            Long count = (Long) row[1];

            // Tratamento defensivo para caderno nulo
            if (caderno == null) continue;

            switch (caderno) {
                case VERMELHO -> vermelho = count.intValue();
                case AMARELO -> amarelo = count.intValue();
                case VERDE -> verde = count.intValue();
            }
        }

        return new CadernoResumoResponse(
                vermelho,
                amarelo,
                verde,
                vermelho + amarelo + verde
        );
    }

    @Transactional(readOnly = true)
    public CadernoDetalheResponse obterCaderno(Long usuarioId, Caderno caderno) {
        List<RespostaQuestao> respostas = respostaRepository.findByUsuarioIdAndCaderno(usuarioId, caderno);

        List<RespostaDetalheResponse> questoes = respostas
                .stream()
                .map(this::toRespostaDetalheResponse)
                .toList();

        String titulo = switch (caderno) {
            case VERMELHO -> "Caderno Vermelho";
            case AMARELO -> "Caderno Amarelo";
            case VERDE -> "Caderno Verde";
        };

        String descricao = switch (caderno) {
            case VERMELHO -> "Revisão crítica - Prioridade alta";
            case AMARELO -> "Reforço - Prioridade média";
            case VERDE -> "Domínio - Manutenção";
        };

        return new CadernoDetalheResponse(
                caderno,
                titulo,
                descricao,
                questoes.size(),
                questoes
        );

    }

    // Converte Object[] → EstatisticaAssuntoResponse e calcula tier
    @Transactional(readOnly = true)
    public List<EstatisticaAssuntoResponse> estatisticasGlobaisPorAssunto(Long usuarioId) {

        return respostaRepository
                .estatisticaGlobalPorAssunto(usuarioId)
                .stream()
                .map(row -> {
                    long total = ((Number) row[3]).longValue();
                    long acertos = ((Number) row[4]).longValue();
                    long erros = total - acertos;
                    double pct = total > 0 ? (acertos * 100.0) / total : 0.0;
                    double pctArredondado = Math.round(pct * 100.0) / 100.0;

                    String tier = pctArredondado >= 70 ? "DOMINIO"
                            : pctArredondado >= 50 ? "ATENCAO"
                            : "CRITICO";

                    return new EstatisticaAssuntoResponse(
                            ((Number) row[0]).longValue(),  // assuntoId
                            (String) row[1],               // assuntoNome
                            (String) row[2],               // materiaNome
                            (int) total,
                            (int) acertos,
                            (int) erros,
                            pctArredondado,
                            tier
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public SimuladoStatsResponse obterStatsPorSimulado(Long simuladoId) {
        int total = (int) tentativaRepository
                .countBySimuladoIdAndFinalizadaTrue(simuladoId);

        Double media = tentativaRepository
                .calcularMediaDesempenhoPorSimulado(simuladoId);

        double mediaArredondada = Math.round((media != null ? media : 0.0) * 10.0) / 10.0;

        return new SimuladoStatsResponse(simuladoId, total, mediaArredondada);
    }

    //===========
    // Lógica de Classificação
    //===========
    private void classificarResposta(RespostaQuestao resposta) {
        RespostaTipo respostaUsuario = resposta.getResposta();
        RespostaTipo gabarito = resposta.getSimuladoQuestao().getQuestao().getGabarito();
        NivelConfianca confianca = resposta.getConfianca();
        TipoErro tipoErro = resposta.getTipoErro();

        //em branco
        if (respostaUsuario == null || respostaUsuario == RespostaTipo.BRANCO) {
            resposta.setTipoResultado(null);
            resposta.setCaderno(null);
            return;
        }

        boolean acertou = respostaUsuario == gabarito;

        if (acertou) {
            if (confianca == NivelConfianca.CERTEZA) {
                resposta.setTipoResultado(TipoResultado.ACERTO_CONSCIENTE);
                resposta.setCaderno(Caderno.VERDE);
            } else if (confianca == NivelConfianca.DUVIDA) {
                resposta.setTipoResultado(TipoResultado.ACERTO_COM_DUVIDA);
                resposta.setCaderno(Caderno.AMARELO);
            } else {
                resposta.setTipoResultado(TipoResultado.ACERTO_POR_CHUTE);
                resposta.setCaderno(Caderno.AMARELO);
            }
        } else {
            if (tipoErro == TipoErro.CONTEUDO) {
                resposta.setTipoResultado(TipoResultado.ERRO_CONTEUDO);
                resposta.setCaderno(Caderno.VERMELHO);
            } else if (tipoErro == TipoErro.INTERPRETACAO) {
                resposta.setTipoResultado(TipoResultado.ERRO_INTERPRETACAO);
                resposta.setCaderno(confianca == NivelConfianca.DUVIDA ?
                        Caderno.AMARELO : Caderno.VERMELHO);
            } else {
                resposta.setTipoResultado(TipoResultado.ERRO_DISTRACAO);
                resposta.setCaderno(Caderno.AMARELO);
            }
        }
    }

    //===========
    // Helpers
    //===========
    private TentativaSimulado getTentativaDoUsuario(Long tentativaId, Long usuarioId) {
        return tentativaRepository.findByIdAndUsuarioId(tentativaId, usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Tentativa não encontrada"));

    }

    private TentativaSimulado getTentativaDoUsuarioComLock(Long tentativaId, Long usuarioId) {
        Optional<TentativaSimulado> locked = tentativaRepository.findByIdAndUsuarioIdWithLock(tentativaId, usuarioId);
        if (locked == null) {
            locked = Optional.empty();
        }

        return locked.or(() -> tentativaRepository.findByIdAndUsuarioId(tentativaId, usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Tentativa não encontrada"));
    }

    private TentativaResumoResponse toResumoResponse(TentativaSimulado t) {
        Simulado s = t.getSimulado();

        int respondidas = t.getRespostas() == null ? 0 :
                (int) t.getRespostas().stream()
                        .filter(r -> r.getResposta() != null && r.getResposta() != RespostaTipo.BRANCO)
                        .count();

        Double percentual = null;

        if (t.getFinalizada() && t.getPontuacao() != null) {
            // Aproveitamento CEBRASPE: pontuação líquida / total questões
            percentual = (t.getPontuacao() * 100.0) / s.getTotalQuestoes();
        }

        return new TentativaResumoResponse(
                t.getId(),
                s.getId(),
                s.getNumero(),
                s.getTitulo(),
                t.getDataInicio(),
                t.getDataFim(),
                t.getFinalizada(),
                s.getTotalQuestoes(),
                respondidas,
                t.getAcertos(),
                t.getErros(),
                t.getEmBranco(),
                t.getPontuacao(),
                percentual
        );
    }

    private TentativaDetalheResponse toDetalheResponse(TentativaSimulado t) {
        return toDetalheResponse(t, respostaRepository.findDetalhadasByTentativaId(t.getId()));
    }

    private TentativaDetalheResponse toDetalheResponse(TentativaSimulado t, List<RespostaQuestao> respostasEntidade) {
        Simulado s = t.getSimulado();

        List<RespostaDetalheResponse> respostas = respostasEntidade == null
                ? List.of()
                : respostasEntidade.stream().map(this::toRespostaDetalheResponse).toList();

        long vermelho = respostas.stream().filter(r -> r.caderno() == Caderno.VERMELHO).count();
        long amarelo = respostas.stream().filter(r -> r.caderno() == Caderno.AMARELO).count();
        long verde = respostas.stream().filter(r -> r.caderno() == Caderno.VERDE).count();

        Double percentual = null;
        if (t.getFinalizada() && t.getPontuacao() != null) {
            // Aproveitamento CEBRASPE: pontuação líquida / total questões
            percentual = (t.getPontuacao() * 100.0) / s.getTotalQuestoes();
        }

        return new TentativaDetalheResponse(
                t.getId(),
                s.getId(),
                s.getNumero(),
                s.getTitulo(),
                t.getDataInicio(),
                t.getDataFim(),
                t.getFinalizada(),
                s.getTotalQuestoes(),
                t.getAcertos(),
                t.getErros(),
                t.getEmBranco(),
                t.getPontuacao(),
                percentual,
                respostas,
                (int) vermelho,
                (int) amarelo,
                (int) verde
        );
    }

    private RespostaDetalheResponse toRespostaDetalheResponse(RespostaQuestao r) {
        SimuladoQuestao sq = r.getSimuladoQuestao();
        Questao q = sq.getQuestao();

        boolean acertou = r.getResposta() != null
                && r.getResposta() != RespostaTipo.BRANCO
                && r.getResposta() == q.getGabarito();

        return new RespostaDetalheResponse(
                r.getId(),
                sq.getId(),
                sq.getOrdem(),
                q.getId(),
                q.getMateria().getNome(),
                sq.getQuestao().getAssunto() != null ? sq.getQuestao().getAssunto().getNome() : null,
                q.getComando(),
                r.getResposta(),
                r.getConfianca(),
                r.getTipoErro(),
                q.getGabarito(),
                acertou,
                r.getTipoResultado(),
                r.getCaderno()
        );
    }


}
