package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.request.RespostaRequest;
import br.com.rinhadeconcurseiro.dto.request.SalvarRespostasRequest;
import br.com.rinhadeconcurseiro.dto.response.*;
import br.com.rinhadeconcurseiro.entity.*;
import br.com.rinhadeconcurseiro.enums.*;
import br.com.rinhadeconcurseiro.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.Arrays.stream;

@Service
@RequiredArgsConstructor
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
    public TentativaIniciadaResponse iniciar(Long simuladoId, Long usuarioId) {
        //verificar se já existe tentativa iniciada em andamento
        tentativaRepository.findByUsuarioIdAndSimuladoIdAndFinalizadaFalse(
                usuarioId,
                simuladoId
        ).ifPresent(t -> {
            throw new IllegalStateException("Já existe uma tentativa em andamento para este simulado");
        });

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

    //===========
    // Salvar Respostas
    //===========

    @Transactional
    public void salvarRespostas(Long tentativaId, Long usuarioId, SalvarRespostasRequest request) {
        TentativaSimulado tentativa = getTentativaDoUsuario(tentativaId, usuarioId);
        if (tentativa.getFinalizada()) {
            throw new IllegalStateException("Tentativa já finalizada");
        }

        //mapear respostas existentes para atualização
        Map<Long, RespostaQuestao> respostasExistentes = tentativa.getRespostas() == null
                ? Map.of()
                : tentativa.getRespostas().stream()
                .collect(Collectors.toMap(r -> r.getSimuladoQuestao().getId(), r -> r));

        for (RespostaRequest req : request.respostas()) {
            SimuladoQuestao sq = simuladoQuestaoRepository.findById(req.simuladoQuestaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Questão do simulado não encontrada: " + req.simuladoQuestaoId()));

            RespostaQuestao resposta = respostasExistentes.get(req.simuladoQuestaoId());

            if (resposta == null) {
                resposta = new RespostaQuestao();
                resposta.setTentativa(tentativa);
                resposta.setSimuladoQuestao(sq);
                tentativa.addResposta(resposta);
            }

            resposta.setResposta(req.resposta());
            resposta.setConfianca(req.confianca());
            resposta.setTipoErro(req.tipoErro());
        }

        tentativaRepository.save(tentativa);
    }

    //===========
    // Finalizar tentativa
    //===========

    @Transactional
    public TentativaDetalheResponse finalizar (Long tentativaId, Long usuarioId) {
        TentativaSimulado tentativa = getTentativaDoUsuario(tentativaId, usuarioId);
        if (tentativa.getFinalizada()) {
            throw new IllegalStateException("Tentativa já finalizada");
        }

        //classificar cada resposta
        int acertos = 0;
        int erros = 0;
        int emBranco = 0;

        for (RespostaQuestao resposta : tentativa.getRespostas()) {
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

        return toDetalheResponse(tentativa);
    }

    //===========
    // Consultas
    //===========
    @Transactional(readOnly = true)
    public List<TentativaResumoResponse> listarEmAndamento(Long usuarioId){
        return tentativaRepository.findByUsuarioIdAndFinalizadaFalseOrderByDataInicioDesc(usuarioId)
                .stream()
                .map(this::toResumoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TentativaResumoResponse> listarFinalizados(Long usuarioId){
        return tentativaRepository.findByUsuarioIdAndFinalizadaTrueOrderByDataFimDesc(usuarioId)
                .stream()
                .map(this::toResumoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TentativaDetalheResponse buscarPorId(Long tentativaId, Long usuarioId){
        TentativaSimulado tentativa = getTentativaDoUsuario(tentativaId, usuarioId);
        return toDetalheResponse(tentativa);
    }

    @Transactional(readOnly = true)
    public MeuProgressoResponse obterProgresso(Long usuarioId){
        int emAndamento = tentativaRepository
                .findByUsuarioIdAndFinalizadaFalseOrderByDataInicioDesc(usuarioId).size();

        long finalizados = tentativaRepository.countByUsuarioIdAndFinalizadaTrue(usuarioId);

        Double media = tentativaRepository.calcularMediaAproveitamento(usuarioId);

        CadernoResumoResponse cadernos = obterResumoCadernos(usuarioId);

        return new MeuProgressoResponse(
                emAndamento,
                (int) finalizados,
                media != null ? media : 0.0,
                cadernos
        );
    }

    @Transactional(readOnly = true)
    public CadernoResumoResponse obterResumoCadernos(Long usuarioId){
        List<Object[]> counts = respostaRepository.countByUsuarioIdGroupByCaderno(usuarioId);

        int vermelho = 0, amarelo = 0, verde = 0;

        for (Object[] row : counts) {
            Caderno caderno = (Caderno) row[0];
            Long count = (Long) row[1];

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
    public CadernoDetalheResponse obterCaderno(Long usuarioId, Caderno caderno){
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

    //===========
    // Lógica de Classificação
    //===========
    private void classificarResposta(RespostaQuestao resposta) {
        RespostaTipo respostaUsuario = resposta.getResposta();
        RespostaTipo gabarito = resposta.getSimuladoQuestao().getQuestao().getGabarito();
        NivelConfianca confianca = resposta.getConfianca();
        TipoErro tipoErro = resposta.getTipoErro();

        //em branco
        if(respostaUsuario == null || respostaUsuario == RespostaTipo.BRANCO){
            resposta.setTipoResultado(null);
            resposta.setCaderno(null);
            return;
        }

        boolean acertou = respostaUsuario == gabarito;

        if(acertou){
            if(confianca == NivelConfianca.CERTEZA){
                resposta.setTipoResultado(TipoResultado.ACERTO_CONSCIENTE);
                resposta.setCaderno(Caderno.VERDE);
            } else if (confianca == NivelConfianca.DUVIDA){
                resposta.setTipoResultado(TipoResultado.ACERTO_COM_DUVIDA);
                resposta.setCaderno(Caderno.AMARELO);
            } else {
                resposta.setTipoResultado(TipoResultado.ACERTO_POR_CHUTE);
                resposta.setCaderno(Caderno.AMARELO);
            }
        } else {
            if(tipoErro == TipoErro.CONTEUDO){
                resposta.setTipoResultado(TipoResultado.ERRO_CONTEUDO);
                resposta.setCaderno(Caderno.VERMELHO);
            } else if (tipoErro == TipoErro.INTERPRETACAO){
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

    private TentativaResumoResponse toResumoResponse(TentativaSimulado t) {
        Simulado s = t.getSimulado();
        int respondidas = t.getRespostas() == null ? 0 : t.getRespostas().size();
        Double percentual = null;

        if (t.getFinalizada() && t.getAcertos() != null) {
            int total = t.getAcertos() + t.getErros();
            percentual = total > 0 ? (t.getAcertos() * 100.0) / total : 0.0;
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

    private TentativaDetalheResponse toDetalheResponse(TentativaSimulado t){
        Simulado s = t.getSimulado();

        List<RespostaDetalheResponse> respostas = t.getRespostas().stream().map(this::toRespostaDetalheResponse).toList();

        long vermelho = respostas.stream().filter(r -> r.caderno() == Caderno.VERMELHO).count();
        long amarelo = respostas.stream().filter(r -> r.caderno() == Caderno.AMARELO).count();
        long verde = respostas.stream().filter(r -> r.caderno() == Caderno.VERDE).count();
        
        Double percentual = null;
        if(t.getFinalizada() && t.getAcertos() != null){
            int total = t.getAcertos() + t.getErros();
            percentual = total > 0 ? (t.getAcertos() * 100.0) / total : 0.0;
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
    
    private RespostaDetalheResponse toRespostaDetalheResponse(RespostaQuestao r){
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
