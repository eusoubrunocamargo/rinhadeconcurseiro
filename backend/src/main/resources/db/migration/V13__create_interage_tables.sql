-- V13__create_interage_tables.sql

-- Mundo: agrupador temático (ex: "Sons e Escrita", "Morfologia")
CREATE TABLE interage_mundo (
  id            SERIAL PRIMARY KEY,
  numero        SMALLINT    NOT NULL UNIQUE,
  nome          VARCHAR(100) NOT NULL,
  descricao     TEXT,
  materia       VARCHAR(100) NOT NULL, -- ex: 'LINGUA_PORTUGUESA', 'DIREITO_ADMINISTRATIVO'
  total_fases   SMALLINT    NOT NULL,
  ativo         BOOLEAN     NOT NULL DEFAULT true,
  criado_em     TIMESTAMP   NOT NULL DEFAULT now()
);

-- Fase: unidade de progresso dentro de um mundo
CREATE TABLE interage_fase (
  id                       SERIAL PRIMARY KEY,
  mundo_id                 INTEGER      NOT NULL REFERENCES interage_mundo,
  numero                   SMALLINT     NOT NULL,
  nome                     VARCHAR(100) NOT NULL,
  conteudo_introducao_html TEXT         NOT NULL,
  ordem_no_mundo           SMALLINT     NOT NULL,
  ativo                    BOOLEAN      NOT NULL DEFAULT true,
  UNIQUE (mundo_id, ordem_no_mundo)
);

-- Exercício curado manualmente pelo autor
CREATE TABLE interage_exercicio (
  id               SERIAL  PRIMARY KEY,
  fase_id          INTEGER NOT NULL REFERENCES interage_fase,
  bloco            VARCHAR(10) NOT NULL
                   CHECK (bloco IN ('PRATICA', 'DESAFIO')),
  rodada           SMALLINT,        -- 1, 2 ou 3 para PRATICA; NULL para DESAFIO
  ordem_na_rodada  SMALLINT NOT NULL, -- posição 1/2/3/4 (A/B/C/D)
  tipo             CHAR(1)  NOT NULL CHECK (tipo IN ('A','B','C','D')),
  enunciado        TEXT     NOT NULL,
  frase_contexto   TEXT,
  palavra_alvo     TEXT,
  opcoes           JSONB,           -- [{id, texto}] para tipos A e C
  gabarito         TEXT    NOT NULL,
  explicacao       TEXT    NOT NULL,
  nivel            VARCHAR(15) NOT NULL
                   CHECK (nivel IN ('BASICO', 'MEDIO', 'AVANCADO')),
  ativo            BOOLEAN NOT NULL DEFAULT true
);

-- Questões do banco externo classificadas para cada fase
CREATE TABLE interage_questao_classificada (
  id                      SERIAL PRIMARY KEY,
  questao_externa_id      TEXT    NOT NULL, -- id do banco de origem (ex: id_tec)
  fase_id                 INTEGER NOT NULL REFERENCES interage_fase,
  bloco                   VARCHAR(10) NOT NULL
                          CHECK (bloco IN ('PRATICA', 'DESAFIO')),
  confianca_classificacao FLOAT,
  classificado_por        VARCHAR(10) NOT NULL
                          CHECK (classificado_por IN ('LLM', 'MANUAL')),
  ativo                   BOOLEAN NOT NULL DEFAULT true,
  criado_em               TIMESTAMP NOT NULL DEFAULT now()
);

-- Progresso do usuário por mundo
CREATE TABLE interage_progresso_mundo (
  id              SERIAL PRIMARY KEY,
  usuario_id      INTEGER NOT NULL, -- FK para tabela de usuários existente
  mundo_id        INTEGER NOT NULL REFERENCES interage_mundo,
  desbloqueado    BOOLEAN   NOT NULL DEFAULT false,
  total_resets    INTEGER   NOT NULL DEFAULT 0,
  ultimo_reset_em TIMESTAMP,
  UNIQUE (usuario_id, mundo_id)
);

-- Progresso do usuário por fase (save points)
CREATE TABLE interage_progresso_fase (
  id                      SERIAL PRIMARY KEY,
  usuario_id              INTEGER NOT NULL,
  fase_id                 INTEGER NOT NULL REFERENCES interage_fase,

  -- save points
  desbloqueada            BOOLEAN   NOT NULL DEFAULT false,
  bloco1_concluido        BOOLEAN   NOT NULL DEFAULT false,
  rodada1_concluida       BOOLEAN   NOT NULL DEFAULT false,
  rodada2_concluida       BOOLEAN   NOT NULL DEFAULT false,
  rodada3_concluida       BOOLEAN   NOT NULL DEFAULT false,

  -- desafio
  desafio_tentativas      SMALLINT  NOT NULL DEFAULT 0,
  desafio_concluido       BOOLEAN   NOT NULL DEFAULT false,

  -- scores
  score_pratica           SMALLINT, -- 0–12
  score_desafio_t1        SMALLINT, -- 0–8
  score_desafio_t2        SMALLINT, -- 0–8

  -- timestamps
  desbloqueada_em         TIMESTAMP,
  concluida_em            TIMESTAMP,
  ultima_atividade_em     TIMESTAMP,

  UNIQUE (usuario_id, fase_id)
);

-- Log granular de respostas
CREATE TABLE interage_resposta (
  id                      SERIAL PRIMARY KEY,
  usuario_id              INTEGER NOT NULL,
  fase_id                 INTEGER NOT NULL REFERENCES interage_fase,
  exercicio_id            INTEGER REFERENCES interage_exercicio,
  questao_classificada_id INTEGER REFERENCES interage_questao_classificada,
  bloco                   VARCHAR(10) NOT NULL
                          CHECK (bloco IN ('PRATICA', 'DESAFIO')),
  rodada                  SMALLINT,   -- NULL para DESAFIO
  tentativa_desafio       SMALLINT,   -- NULL para PRATICA; 1 ou 2 para DESAFIO
  resposta_dada           TEXT     NOT NULL,
  correto                 BOOLEAN  NOT NULL,
  respondido_em           TIMESTAMP NOT NULL DEFAULT now()
);