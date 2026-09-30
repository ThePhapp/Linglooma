-- T08: additive migration for the canonical plural reading_* tables.
-- Apply before deploying the new reading API; quiesce old submit writers during rollout.
-- Do NOT run linglooma_update.sql against an existing database (it is a reset script).
-- Historical reading_answers have no reliable submission boundary. Preserve every
-- row unchanged, with attempt_id NULL; do not infer attempts from timestamps or
-- user/passage pairs. These rows remain available for audit but are intentionally
-- excluded from attempt history/detail. New submissions always supply attempt_id.
-- No changes are made to the separate, obsolete singular reading_* tables.
BEGIN;

CREATE TABLE IF NOT EXISTS reading_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    passage_id INTEGER NOT NULL REFERENCES reading_passages(id) ON DELETE CASCADE,
    total_score INTEGER NOT NULL CHECK (total_score >= 0),
    max_score INTEGER NOT NULL CHECK (max_score >= total_score),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reading_attempts_owner_key UNIQUE (id, user_id, passage_id)
);

ALTER TABLE reading_answers ADD COLUMN IF NOT EXISTS attempt_id INTEGER;

-- Named guards allow a safe replay, including after a canonical schema reset.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'reading_answers'::regclass AND conname = 'reading_answers_attempt_fk'
    ) THEN
        ALTER TABLE reading_answers
            ADD CONSTRAINT reading_answers_attempt_fk FOREIGN KEY (attempt_id, user_id, passage_id)
            REFERENCES reading_attempts(id, user_id, passage_id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'reading_answers'::regclass AND conname = 'reading_answers_attempt_question_key'
    ) THEN
        ALTER TABLE reading_answers
            ADD CONSTRAINT reading_answers_attempt_question_key UNIQUE (attempt_id, question_id);
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_reading_attempts_user ON reading_attempts(user_id, submitted_at DESC, id DESC);

COMMIT;
