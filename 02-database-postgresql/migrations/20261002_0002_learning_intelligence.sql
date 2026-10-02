-- Learning intelligence foundation: goals, plans, reviewable mistakes and vocabulary.
-- Additive and replay-safe; existing learning data is preserved.
BEGIN;

CREATE TABLE IF NOT EXISTS learning_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    target_band NUMERIC(2,1) CHECK (target_band BETWEEN 0 AND 9),
    current_level VARCHAR(20) CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
    exam_date DATE,
    study_days_per_week INTEGER CHECK (study_days_per_week BETWEEN 1 AND 7),
    minutes_per_day INTEGER CHECK (minutes_per_day BETWEEN 5 AND 240),
    weekly_practice_goal INTEGER CHECK (weekly_practice_goal BETWEEN 1 AND 50),
    weak_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_plan_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    skill VARCHAR(20) NOT NULL CHECK (skill IN ('speaking', 'writing', 'reading', 'listening', 'vocabulary')),
    title VARCHAR(200) NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 5 AND 240),
    status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'skipped')),
    source VARCHAR(30) NOT NULL DEFAULT 'rule_based',
    href VARCHAR(500),
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT study_plan_user_date_title_key UNIQUE (user_id, scheduled_date, title)
);

CREATE TABLE IF NOT EXISTS learning_mistakes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(20) NOT NULL CHECK (skill IN ('speaking', 'writing', 'reading', 'listening')),
    category VARCHAR(40) NOT NULL CHECK (category IN (
      'grammar', 'vocabulary', 'coherence', 'task_response', 'sentence_structure', 'spelling',
      'pronunciation', 'fluency', 'repetition', 'hesitation',
      'keyword_matching', 'inference', 'detail', 'main_idea', 'time_management',
      'number', 'date', 'keyword', 'distractor'
    )),
    original_answer TEXT,
    problem TEXT NOT NULL,
    suggestion TEXT,
    corrected_version TEXT,
    source_type VARCHAR(40) NOT NULL,
    source_id INTEGER,
    source_item_id INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'review' CHECK (status IN ('review', 'understood')),
    review_stage INTEGER NOT NULL DEFAULT 0 CHECK (review_stage BETWEEN 0 AND 5),
    next_review_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_learning_mistakes_source
ON learning_mistakes(user_id, skill, category, source_type, COALESCE(source_id, 0), COALESCE(source_item_id, 0), md5(problem));
CREATE INDEX IF NOT EXISTS idx_learning_mistakes_review
ON learning_mistakes(user_id, status, next_review_at);

CREATE TABLE IF NOT EXISTS vocabulary_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word VARCHAR(200) NOT NULL,
    meaning TEXT NOT NULL,
    example TEXT,
    topic VARCHAR(100),
    source VARCHAR(40) NOT NULL DEFAULT 'manual',
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status VARCHAR(20) NOT NULL DEFAULT 'review' CHECK (status IN ('review', 'known')),
    next_review_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vocabulary_user_word_key UNIQUE (user_id, word)
);
CREATE INDEX IF NOT EXISTS idx_vocabulary_review ON vocabulary_items(user_id, status, next_review_at);

CREATE TABLE IF NOT EXISTS practice_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(20) NOT NULL CHECK (skill IN ('speaking', 'writing', 'reading', 'listening', 'vocabulary')),
    mode VARCHAR(40) NOT NULL DEFAULT 'practice',
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    source_id INTEGER,
    score NUMERIC(6,2),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_resume ON practice_sessions(user_id, status, updated_at DESC);

COMMIT;
