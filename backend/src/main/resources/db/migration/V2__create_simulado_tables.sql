-- =============================================
-- V2: Tabelas de Simulado
-- =============================================

-- Tabela: simulado
CREATE TABLE simulado (
    id BIGSERIAL PRIMARY KEY,
    numero INTEGER NOT NULL UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    data_disponivel DATE NOT NULL,
    total_questoes INTEGER NOT NULL DEFAULT 0,
    questoes_basicas INTEGER NOT NULL DEFAULT 0,
    questoes_especificas INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: simulado_questao (relacionamento N:N)
CREATE TABLE simulado_questao (
    id BIGSERIAL PRIMARY KEY,
    id_simulado BIGINT NOT NULL REFERENCES simulado(id) ON DELETE CASCADE,
    id_questao BIGINT NOT NULL REFERENCES questao(id),
    ordem INTEGER NOT NULL,
    caderno caderno_tipo NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_simulado, id_questao),
    UNIQUE(id_simulado, ordem)
);

-- Índices
CREATE INDEX idx_simulado_data ON simulado(data_disponivel);
CREATE INDEX idx_simulado_ativo ON simulado(ativo);
CREATE INDEX idx_simulado_questao_simulado ON simulado_questao(id_simulado);
CREATE INDEX idx_simulado_questao_questao ON simulado_questao(id_questao);