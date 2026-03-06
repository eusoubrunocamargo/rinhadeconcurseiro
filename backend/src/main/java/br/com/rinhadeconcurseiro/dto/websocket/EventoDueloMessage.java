package br.com.rinhadeconcurseiro.dto.websocket;

import br.com.rinhadeconcurseiro.enums.EventoDueloTipo;
import lombok.Builder;

@Builder
public record EventoDueloMessage(

        EventoDueloTipo evento,

        //OP_RESP e QUESTAO_RESOLVIDA
        Long dueloQuestaoId,
        Integer ordemQuestao,

        //Preenche em Q_RES + DUELO_FIN
        //null antes da resolução
        Boolean hostAcertou,
        Boolean desafiadoAcertou,

        //placar atual atualizado a cada rodada
        Integer pontosHost,
        Integer pontosDesafiado,

        //DUELO_FINALIZADO
        //null = empate
        Long idVencedor,

        //null na última questão
        Long proximaDueloQuestaoId,
        Integer proximaOrdem
) {}
