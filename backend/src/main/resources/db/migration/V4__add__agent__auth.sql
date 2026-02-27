-- V4__add_agent_auth.sql
-- Adiciona suporte a autenticação por usuário/senha para agentes de simulação.
-- Usuários reais (OAuth) continuam com role = 'USER' e password_hash NULL.

ALTER TABLE usuario
    ADD COLUMN role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    ADD COLUMN password_hash VARCHAR(255)          DEFAULT NULL;

-- Índice para lookup rápido no login de agentes
CREATE INDEX idx_usuario_role ON usuario(role);