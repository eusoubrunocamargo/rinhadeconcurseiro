-- Garante pré-requisito do ON CONFLICT usado no salvar/finalizar simulado.
-- Em produção, houve casos sem constraint única em (id_tentativa, id_simulado_questao),
-- o que gera:
--   ERROR: there is no unique or exclusion constraint matching the ON CONFLICT specification

-- 1) Remove duplicidades pré-existentes (mantém o registro mais recente por par).
WITH ranked AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY id_tentativa, id_simulado_questao
            ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
        ) AS rn
    FROM resposta_questao
)
DELETE FROM resposta_questao rq
USING ranked r
WHERE rq.id = r.id
  AND r.rn > 1;

-- 2) Cria índice único usado pelo ON CONFLICT.
CREATE UNIQUE INDEX IF NOT EXISTS uq_resposta_questao_tentativa_simulado_idx
    ON resposta_questao (id_tentativa, id_simulado_questao);

-- 3) Vincula o índice como constraint única da tabela (idempotente).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_resposta_questao_tentativa_simulado'
          AND conrelid = 'resposta_questao'::regclass
    ) THEN
        ALTER TABLE resposta_questao
            ADD CONSTRAINT uq_resposta_questao_tentativa_simulado
            UNIQUE USING INDEX uq_resposta_questao_tentativa_simulado_idx;
    END IF;
END
$$;
