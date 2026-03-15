-- V8__fix_enum_columns_to_varchar.sql
DROP INDEX IF EXISTS idx_convite_expires;

ALTER TABLE convite_duelo ALTER COLUMN status DROP DEFAULT;
ALTER TABLE convite_duelo ALTER COLUMN status TYPE VARCHAR(20) USING status::text;
ALTER TABLE convite_duelo ALTER COLUMN status SET DEFAULT 'PENDENTE';

CREATE INDEX idx_convite_expires ON convite_duelo(expires_at) WHERE status = 'PENDENTE';

ALTER TABLE duelo ALTER COLUMN status DROP DEFAULT;
ALTER TABLE duelo ALTER COLUMN status TYPE VARCHAR(20) USING status::text;
ALTER TABLE duelo ALTER COLUMN status SET DEFAULT 'CONFIGURANDO';