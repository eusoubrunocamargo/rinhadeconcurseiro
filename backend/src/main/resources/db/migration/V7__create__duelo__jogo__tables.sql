-- V7: Tabelas do jogo em si — questões sorteadas e respostas dos participantes
-- =============================================

-- Questões sorteadas para um duelo específico.
-- Cada linha representa uma questão na ordem em que será apresentada.
CREATE TABLE duelo_questao (
    id              BIGSERIAL PRIMARY KEY,
    id_duelo        BIGINT NOT NULL REFERENCES duelo(id) ON DELETE CASCADE,
    id_questao      BIGINT NOT NULL REFERENCES questao(id),
    ordem           INTEGER NOT NULL,

    -- Começa false. Só vira true após ambos responderem E o servidor
    -- processar o resultado. A transição é feita atomicamente com
    -- UPDATE ... WHERE resolvida = false, garantindo que apenas um
    -- thread dispara a resolução mesmo em cenários de concorrência.
    resolvida       BOOLEAN NOT NULL DEFAULT FALSE,

    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Garante que a mesma questão não apareça duas vezes no mesmo duelo
    CONSTRAINT duelo_questao_unica UNIQUE (id_duelo, id_questao),
    -- Garante que a ordem é única dentro de um duelo
    CONSTRAINT duelo_questao_ordem_unica UNIQUE (id_duelo, ordem)
);

-- Respostas de cada participante para cada questão do duelo.
-- Uma linha por (questão, usuário) — o UNIQUE abaixo torna isso uma
-- constraint de banco, não apenas uma regra de negócio no código.
CREATE TABLE duelo_resposta (
    id                  BIGSERIAL PRIMARY KEY,
    id_duelo_questao    BIGINT NOT NULL REFERENCES duelo_questao(id) ON DELETE CASCADE,
    id_usuario          BIGINT NOT NULL REFERENCES usuario(id),

    -- NULL significa que o usuário deixou em branco (não respondeu a tempo).
    -- Usamos VARCHAR em vez do enum resposta_tipo para manter flexibilidade —
    -- o enum do banco exigiria uma migration adicional para qualquer mudança.
    resposta            VARCHAR(10),

    -- Indica se o usuário acertou. Calculado pelo servidor no momento
    -- da resolução, nunca enviado pelo cliente.
    acertou             BOOLEAN,

    respondido_em       TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Esta é a proteção mais importante desta tabela: impede que um usuário
    -- responda à mesma questão duas vezes, mesmo que o cliente tente.
    CONSTRAINT duelo_resposta_unica UNIQUE (id_duelo_questao, id_usuario)
);

-- Índices para as queries mais frequentes durante o jogo
CREATE INDEX idx_duelo_questao_duelo    ON duelo_questao(id_duelo);
CREATE INDEX idx_duelo_questao_ordem    ON duelo_questao(id_duelo, ordem);
CREATE INDEX idx_duelo_resposta_questao ON duelo_resposta(id_duelo_questao);
CREATE INDEX idx_duelo_resposta_usuario ON duelo_resposta(id_usuario);