-- Explicit rollback for 20261002_0002. Run manually only when its data may be removed.
BEGIN;

DROP TABLE IF EXISTS writing_versions;
DROP TABLE IF EXISTS learning_bookmarks;
DROP TABLE IF EXISTS practice_sessions;
DROP TABLE IF EXISTS vocabulary_items;
DROP TABLE IF EXISTS learning_mistakes;
DROP TABLE IF EXISTS study_plan_items;
DROP TABLE IF EXISTS learning_profiles;
ALTER TABLE writing_submissions DROP COLUMN IF EXISTS evaluation_prompt_version;

COMMIT;
