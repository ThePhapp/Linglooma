-- Additive continuation: AI traceability, saved resources and writing revisions.
BEGIN;

ALTER TABLE writing_submissions ADD COLUMN IF NOT EXISTS evaluation_prompt_version VARCHAR(80);

CREATE TABLE IF NOT EXISTS learning_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('reading', 'writing', 'question', 'feedback', 'mistake', 'vocabulary')),
    source_id INTEGER NOT NULL,
    title VARCHAR(300) NOT NULL,
    href VARCHAR(500) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT learning_bookmarks_source_key UNIQUE (user_id, item_type, source_id)
);
CREATE INDEX IF NOT EXISTS idx_learning_bookmarks_user ON learning_bookmarks(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS writing_versions (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES writing_submissions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version_no INTEGER NOT NULL CHECK (version_no > 0),
    version_type VARCHAR(20) NOT NULL CHECK (version_type IN ('submission', 'revision')),
    essay_text TEXT NOT NULL,
    word_count INTEGER NOT NULL CHECK (word_count >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT writing_versions_number_key UNIQUE (submission_id, version_no)
);
CREATE INDEX IF NOT EXISTS idx_writing_versions_owner ON writing_versions(user_id, submission_id, version_no);

COMMIT;
