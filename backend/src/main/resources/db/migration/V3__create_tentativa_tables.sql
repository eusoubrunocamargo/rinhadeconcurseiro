-- =============================================
-- V3: Tabelas de Tentativa e Sistema de Confiança
-- =============================================

-- Novos ENUMs
CREATE TYPE nivel_confianca AS ENUM ('CERTEZA', 'DUVIDA', 'CHUTE');
CREATE TYPE tipo_erro AS ENUM ('CONTEUDO', 'INTERPRETACAO', 'DISTRACAO');
CREATE TYPE tipo_resultado AS ENUM (
    'ACERTO_CONSCIENTE',
    'ACERTO_COM_DUVIDA',
    'ACERTO_POR_CHUTE',
    'ERRO_CONTEUDO',
    'ERRO_INTERPRETACAO',
    'ERRO_DISTRACAO'
);
CREATE TYPE caderno AS ENUM ('VERMELHO', 'AMARELO', 'VERDE');

-- Tabela: tentativa_simulado
CREATE TABLE tentativa_simulado (
    id BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL REFERENCES usuario(id),
    id_simulado BIGINT NOT NULL REFERENCES simulado(id),
    data_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP,
    acertos INTEGER,
    erros INTEGER,
    em_branco INTEGER,
    pontuacao INTEGER,
    finalizada BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: resposta_questao
CREATE TABLE resposta_questao (
    id BIGSERIAL PRIMARY KEY,
    id_tentativa BIGINT NOT NULL REFERENCES tentativa_simulado(id) ON DELETE CASCADE,
    id_simulado_questao BIGINT NOT NULL REFERENCES simulado_questao(id),
    resposta VARCHAR(10),
    confianca VARCHAR(20),
    tipo_erro VARCHAR(20),
    tipo_resultado VARCHAR(30),
    caderno VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_tentativa, id_simulado_questao)
);

-- Índices
CREATE INDEX idx_tentativa_usuario ON tentativa_simulado(id_usuario);
CREATE INDEX idx_tentativa_simulado ON tentativa_simulado(id_simulado);
CREATE INDEX idx_tentativa_finalizada ON tentativa_simulado(finalizada);
CREATE INDEX idx_resposta_tentativa ON resposta_questao(id_tentativa);
CREATE INDEX idx_resposta_caderno ON resposta_questao(caderno);