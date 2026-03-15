-- V6: Tabelas do sistema de Duelo
-- =============================================

-- Status possíveis de um convite
CREATE TYPE status_convite AS ENUM (
    'PENDENTE',   -- aguardando resposta do convidado
    'ACEITO',     -- convidado aceitou, duelo criado
    'RECUSADO',   -- convidado recusou
    'EXPIRADO'    -- prazo de resposta esgotado
);

-- Status possíveis de um duelo
CREATE TYPE status_duelo AS ENUM (
    'CONFIGURANDO',  -- host está escolhendo assuntos/qtd de questões
    'EM_ANDAMENTO',  -- questões sendo respondidas
    'FINALIZADO',    -- duelo encerrado normalmente
    'CANCELADO'      -- encerrado por desconexão ou abandono
);

-- Tabela de convites
-- O token UUID é o segredo que garante que apenas quem recebeu o link
-- pode aceitar o convite. expires_at define o TTL do convite.
CREATE TABLE convite_duelo (
    id          BIGSERIAL PRIMARY KEY,
    token       UUID NOT NULL DEFAULT gen_random_uuid(),
    id_remetente  BIGINT NOT NULL REFERENCES usuario(id),
    id_destinatario BIGINT NOT NULL REFERENCES usuario(id),
    status      status_convite NOT NULL DEFAULT 'PENDENTE',
    expires_at  TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    usado_em    TIMESTAMP,   -- preenchido quando aceito/recusado (auditoria)
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Garante que o token é único na tabela
    CONSTRAINT convite_duelo_token_unique UNIQUE (token),
    -- Impede que um usuário convide a si mesmo
    CONSTRAINT convite_nao_proprio CHECK (id_remetente <> id_destinatario)
);

-- Tabela principal do duelo
-- versao é usado para controle de concorrência otimista no Java,
-- evitando que dois threads atualizem o estado ao mesmo tempo
CREATE TABLE duelo (
    id              BIGSERIAL PRIMARY KEY,
    id_convite      BIGINT NOT NULL REFERENCES convite_duelo(id),
    id_host         BIGINT NOT NULL REFERENCES usuario(id),
    id_desafiado    BIGINT NOT NULL REFERENCES usuario(id),
    status          status_duelo NOT NULL DEFAULT 'CONFIGURANDO',
    total_questoes  INTEGER,
    pontos_host     INTEGER NOT NULL DEFAULT 0,
    pontos_desafiado INTEGER NOT NULL DEFAULT 0,
    id_vencedor     BIGINT REFERENCES usuario(id),  -- NULL = empate
    versao          INTEGER NOT NULL DEFAULT 0,      -- optimistic locking
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    finalizado_em   TIMESTAMP,

    CONSTRAINT duelo_convite_unique UNIQUE (id_convite) -- 1 convite = 1 duelo
);

-- Índices para as queries mais frequentes
CREATE INDEX idx_convite_token       ON convite_duelo(token);
CREATE INDEX idx_convite_destinatario ON convite_duelo(id_destinatario, status);
CREATE INDEX idx_convite_expires     ON convite_duelo(expires_at) WHERE status = 'PENDENTE';
CREATE INDEX idx_duelo_host          ON duelo(id_host);
CREATE INDEX idx_duelo_desafiado     ON duelo(id_desafiado);
CREATE INDEX idx_duelo_status        ON duelo(status);