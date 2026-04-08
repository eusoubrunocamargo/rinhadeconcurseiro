-- V14__fix_interage_ids_to_bigint.sql

ALTER TABLE interage_mundo
  ALTER COLUMN id TYPE BIGINT;
ALTER SEQUENCE interage_mundo_id_seq AS BIGINT;

ALTER TABLE interage_fase
  ALTER COLUMN id   TYPE BIGINT,
  ALTER COLUMN mundo_id TYPE BIGINT;
ALTER SEQUENCE interage_fase_id_seq AS BIGINT;

ALTER TABLE interage_exercicio
  ALTER COLUMN id      TYPE BIGINT,
  ALTER COLUMN fase_id TYPE BIGINT;
ALTER SEQUENCE interage_exercicio_id_seq AS BIGINT;

ALTER TABLE interage_questao_classificada
  ALTER COLUMN id      TYPE BIGINT,
  ALTER COLUMN fase_id TYPE BIGINT;
ALTER SEQUENCE interage_questao_classificada_id_seq AS BIGINT;

ALTER TABLE interage_progresso_mundo
  ALTER COLUMN id         TYPE BIGINT,
  ALTER COLUMN usuario_id TYPE BIGINT,
  ALTER COLUMN mundo_id   TYPE BIGINT;
ALTER SEQUENCE interage_progresso_mundo_id_seq AS BIGINT;

ALTER TABLE interage_progresso_fase
  ALTER COLUMN id         TYPE BIGINT,
  ALTER COLUMN usuario_id TYPE BIGINT,
  ALTER COLUMN fase_id    TYPE BIGINT;
ALTER SEQUENCE interage_progresso_fase_id_seq AS BIGINT;

ALTER TABLE interage_resposta
  ALTER COLUMN id                      TYPE BIGINT,
  ALTER COLUMN usuario_id              TYPE BIGINT,
  ALTER COLUMN fase_id                 TYPE BIGINT,
  ALTER COLUMN exercicio_id            TYPE BIGINT,
  ALTER COLUMN questao_classificada_id TYPE BIGINT;
ALTER SEQUENCE interage_resposta_id_seq AS BIGINT;