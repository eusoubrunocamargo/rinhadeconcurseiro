-- =============================================
-- V1: Tipos ENUM e tabelas base
-- =============================================

-- ENUMs
CREATE TYPE resposta_tipo AS ENUM ('CERTO', 'ERRADO', 'BRANCO');
CREATE TYPE caderno_tipo AS ENUM ('BASICO', 'ESPECIFICO');

-- Tabela: materia
CREATE TABLE materia (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: assunto
CREATE TABLE assunto (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    id_materia BIGINT NOT NULL REFERENCES materia(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nome, id_materia)
);

-- Tabela: usuario
CREATE TABLE usuario (
    id BIGSERIAL PRIMARY KEY,
    google_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    apelido VARCHAR(100),
    foto_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: questao
CREATE TABLE questao (
    id BIGSERIAL PRIMARY KEY,
    comando TEXT,
    gabarito resposta_tipo NOT NULL,
    id_materia BIGINT NOT NULL REFERENCES materia(id),
    id_assunto BIGINT REFERENCES assunto(id),
    ano INTEGER,
    banca VARCHAR(100),
    orgao VARCHAR(255),
    cargo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_questao_materia ON questao(id_materia);
CREATE INDEX idx_questao_assunto ON questao(id_assunto);
CREATE INDEX idx_assunto_materia ON assunto(id_materia);