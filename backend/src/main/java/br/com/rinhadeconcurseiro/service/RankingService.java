package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.response.RankingItemResponse;
import br.com.rinhadeconcurseiro.dto.response.RankingResponse;
import br.com.rinhadeconcurseiro.entity.Simulado;
import br.com.rinhadeconcurseiro.entity.TentativaSimulado;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.repository.SimuladoRepository;
import br.com.rinhadeconcurseiro.repository.TentativaSimuladoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RankingService {

    private final TentativaSimuladoRepository tentativaRepository;
    private final SimuladoRepository simuladoRepository;

    /**
     * Ranking de um simulado específico
     */
    public RankingResponse getRankingPorSimulado(Long simuladoId, Long currentUserId) {
        Simulado simulado = simuladoRepository.findById(simuladoId)
                .orElseThrow(() -> new EntityNotFoundException("Simulado não encontrado"));

        List<TentativaSimulado> tentativas = tentativaRepository.findRankingBySimuladoId(simuladoId);
        Integer totalParticipantes = tentativaRepository.countParticipantesBySimuladoId(simuladoId);

        List<RankingItemResponse> ranking = new ArrayList<>();
        RankingItemResponse currentUserPosition = null;

        int posicao = 1;
        for (TentativaSimulado t : tentativas) {
            Usuario u = t.getUsuario();
            boolean isCurrentUser = u.getId().equals(currentUserId);

            int totalRespondidas = (t.getAcertos() != null ? t.getAcertos() : 0)
                    + (t.getErros() != null ? t.getErros() : 0);
            double percentual = totalRespondidas > 0
                    ? (t.getAcertos() * 100.0) / totalRespondidas
                    : 0.0;

            RankingItemResponse item = new RankingItemResponse(
                    posicao,
                    u.getId(),
                    u.getNome(),
                    u.getApelido(),
                    u.getFotoUrl(),
                    t.getPontuacao(),
                    t.getAcertos(),
                    t.getErros(),
                    t.getEmBranco(),
                    percentual,
                    1, // 1 simulado neste contexto
                    isCurrentUser
            );

            ranking.add(item);

            if (isCurrentUser) {
                currentUserPosition = item;
            }

            posicao++;
        }

        return new RankingResponse(
                "SIMULADO",
                simuladoId,
                simulado.getTitulo(),
                totalParticipantes,
                ranking,
                currentUserPosition
        );
    }

    /**
     * Ranking geral (soma de todos os simulados)
     */
    public RankingResponse getRankingGeral(Long currentUserId) {
        List<Object[]> resultados = tentativaRepository.findRankingGeral();
        Integer totalParticipantes = tentativaRepository.countParticipantesGeral();

        List<RankingItemResponse> ranking = new ArrayList<>();
        RankingItemResponse currentUserPosition = null;

        int posicao = 1;
        for (Object[] row : resultados) {
            Long usuarioId = (Long) row[0];
            String nome = (String) row[1];
            String apelido = (String) row[2];
            String fotoUrl = (String) row[3];
            Long totalPontuacao = (Long) row[4];
            Long totalAcertos = (Long) row[5];
            Long totalErros = (Long) row[6];
            Long totalEmBranco = (Long) row[7];
            Long simuladosFinalizados = (Long) row[8];

            boolean isCurrentUser = usuarioId.equals(currentUserId);

            long totalRespondidas = totalAcertos + totalErros;
            double percentual = totalRespondidas > 0
                    ? (totalAcertos * 100.0) / totalRespondidas
                    : 0.0;

            RankingItemResponse item = new RankingItemResponse(
                    posicao,
                    usuarioId,
                    nome,
                    apelido,
                    fotoUrl,
                    totalPontuacao.intValue(),
                    totalAcertos.intValue(),
                    totalErros.intValue(),
                    totalEmBranco.intValue(),
                    percentual,
                    simuladosFinalizados.intValue(),
                    isCurrentUser
            );

            ranking.add(item);

            if (isCurrentUser) {
                currentUserPosition = item;
            }

            posicao++;
        }

        return new RankingResponse(
                "GERAL",
                null,
                null,
                totalParticipantes,
                ranking,
                currentUserPosition
        );
    }
}