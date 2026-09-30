-- Read-only canonical schema check. Use: psql -X -v ON_ERROR_STOP=1 -f check-migration.sql
-- Raises an error for missing app tables or columns; never checks sample row counts.
DO $$
DECLARE
    missing text;
BEGIN
    SELECT string_agg(name, ', ' ORDER BY name) INTO missing
    FROM (VALUES
        ('users'), ('lesson'), ('question'), ('lessonresult'),
        ('questionresult'), ('incorrectphonemes'), ('reading_passages'),
        ('reading_questions'), ('reading_attempts'), ('reading_answers'),
        ('writing_tasks'), ('writing_submissions'), ('schema_migrations')
    ) AS expected(name)
    WHERE to_regclass('public.' || name) IS NULL;
    IF missing IS NOT NULL THEN
        RAISE EXCEPTION 'Missing canonical tables: %', missing;
    END IF;

    SELECT string_agg(table_name || '.' || column_name, ', ' ORDER BY table_name, column_name) INTO missing
    FROM (VALUES
        ('reading_passages', 'passage_text'),
        ('reading_questions', 'passage_id'),
        ('reading_answers', 'attempt_id'),
        ('reading_answers', 'user_id'),
        ('reading_attempts', 'total_score'),
        ('writing_tasks', 'prompt'),
        ('writing_submissions', 'task_id'),
        ('writing_submissions', 'is_completed')
    ) AS expected(table_name, column_name)
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.table_name = expected.table_name
          AND c.column_name = expected.column_name
    );
    IF missing IS NOT NULL THEN
        RAISE EXCEPTION 'Missing canonical columns: %', missing;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.reading_answers'::regclass
          AND conname = 'reading_answers_attempt_fk'
    ) THEN
        RAISE EXCEPTION 'Missing reading_answers_attempt_fk';
    END IF;
END;
$$;

SELECT filename, applied_at FROM public.schema_migrations ORDER BY filename;
