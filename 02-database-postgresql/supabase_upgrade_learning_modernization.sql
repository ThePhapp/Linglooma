-- Linglooma: upgrade an existing Supabase PostgreSQL database to the
-- Learning Modernization schema.
-- Safe properties: additive, transactional, idempotent, and no DROP/DELETE.
-- Paste this entire file into Supabase > SQL Editor and click Run once.

BEGIN;

-- Fail early with a useful message if this is not the expected Linglooma schema.
DO $preflight$
BEGIN
  IF to_regclass('public.users') IS NULL THEN
    RAISE EXCEPTION 'Missing public.users. Apply the canonical Linglooma baseline first.';
  END IF;
  IF to_regclass('public.writing_submissions') IS NULL THEN
    RAISE EXCEPTION 'Missing public.writing_submissions. Apply the canonical Linglooma baseline first.';
  END IF;
END
$preflight$;

ALTER TABLE public.writing_submissions
  ADD COLUMN IF NOT EXISTS evaluation_prompt_version VARCHAR(80);

CREATE TABLE IF NOT EXISTS public.learning_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  target_band NUMERIC(2,1) CHECK (target_band BETWEEN 0 AND 9),
  current_level VARCHAR(20) CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
  exam_date DATE,
  study_days_per_week INTEGER CHECK (study_days_per_week BETWEEN 1 AND 7),
  minutes_per_day INTEGER CHECK (minutes_per_day BETWEEN 5 AND 240),
  weekly_practice_goal INTEGER CHECK (weekly_practice_goal BETWEEN 1 AND 50),
  weak_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.study_plan_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.learning_mistakes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill VARCHAR(20) NOT NULL CHECK (skill IN ('speaking', 'writing', 'reading', 'listening')),
  category VARCHAR(40) NOT NULL CHECK (category IN (
    'grammar', 'vocabulary', 'coherence', 'task_response', 'sentence_structure', 'spelling',
    'pronunciation', 'fluency', 'repetition', 'hesitation', 'keyword_matching', 'inference',
    'detail', 'main_idea', 'time_management', 'number', 'date', 'keyword', 'distractor'
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
  ON public.learning_mistakes (
    user_id, skill, category, source_type,
    COALESCE(source_id, 0), COALESCE(source_item_id, 0), md5(problem)
  );
CREATE INDEX IF NOT EXISTS idx_learning_mistakes_review
  ON public.learning_mistakes(user_id, status, next_review_at);

CREATE TABLE IF NOT EXISTS public.vocabulary_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_vocabulary_review
  ON public.vocabulary_items(user_id, status, next_review_at);

CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_practice_sessions_resume
  ON public.practice_sessions(user_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.learning_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('reading', 'writing', 'question', 'feedback', 'mistake', 'vocabulary')),
  source_id INTEGER NOT NULL,
  title VARCHAR(300) NOT NULL,
  href VARCHAR(500) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT learning_bookmarks_source_key UNIQUE (user_id, item_type, source_id)
);
CREATE INDEX IF NOT EXISTS idx_learning_bookmarks_user
  ON public.learning_bookmarks(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.writing_versions (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES public.writing_submissions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL CHECK (version_no > 0),
  version_type VARCHAR(20) NOT NULL CHECK (version_type IN ('submission', 'revision')),
  essay_text TEXT NOT NULL,
  word_count INTEGER NOT NULL CHECK (word_count >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT writing_versions_number_key UNIQUE (submission_id, version_no)
);
CREATE INDEX IF NOT EXISTS idx_writing_versions_owner
  ON public.writing_versions(user_id, submission_id, version_no);

-- Preserve existing essays as version 1 so old users can use revision history.
INSERT INTO public.writing_versions
  (submission_id, user_id, version_no, version_type, essay_text, word_count, created_at)
SELECT
  submission.id,
  submission.user_id,
  1,
  'submission',
  submission.essay_text,
  COALESCE(
    submission.word_count,
    array_length(regexp_split_to_array(trim(submission.essay_text), E'\\s+'), 1),
    0
  ),
  COALESCE(submission.submitted_at, CURRENT_TIMESTAMP)
FROM public.writing_submissions AS submission
WHERE submission.essay_text IS NOT NULL
  AND trim(submission.essay_text) <> ''
ON CONFLICT (submission_id, version_no) DO NOTHING;

COMMIT;

-- Verification result: every value should be true.
SELECT
  to_regclass('public.learning_profiles') IS NOT NULL AS learning_profiles_ok,
  to_regclass('public.study_plan_items') IS NOT NULL AS study_plan_items_ok,
  to_regclass('public.learning_mistakes') IS NOT NULL AS learning_mistakes_ok,
  to_regclass('public.vocabulary_items') IS NOT NULL AS vocabulary_items_ok,
  to_regclass('public.practice_sessions') IS NOT NULL AS practice_sessions_ok,
  to_regclass('public.learning_bookmarks') IS NOT NULL AS learning_bookmarks_ok,
  to_regclass('public.writing_versions') IS NOT NULL AS writing_versions_ok,
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'writing_submissions'
      AND column_name = 'evaluation_prompt_version'
  ) AS writing_prompt_version_ok;
