-- Repair an older study-plan status constraint without editing prior migrations.
BEGIN;

DO $repair_plan_status$
DECLARE
  constraint_row RECORD;
BEGIN
  FOR constraint_row IN
    SELECT con.conname, pg_get_constraintdef(con.oid) AS definition
    FROM pg_constraint con
    WHERE con.conrelid = 'public.study_plan_items'::regclass
      AND con.contype = 'c'
  LOOP
    IF constraint_row.definition ILIKE '%status%'
       AND NOT (
         constraint_row.definition ILIKE '%planned%'
         AND constraint_row.definition ILIKE '%completed%'
         AND constraint_row.definition ILIKE '%skipped%'
       ) THEN
      EXECUTE format('ALTER TABLE public.study_plan_items DROP CONSTRAINT %I', constraint_row.conname);
    END IF;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    WHERE con.conrelid = 'public.study_plan_items'::regclass
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%skipped%'
  ) THEN
    ALTER TABLE public.study_plan_items
      ADD CONSTRAINT study_plan_items_status_check
      CHECK (status IN ('planned', 'completed', 'skipped'));
  END IF;
END
$repair_plan_status$;

COMMIT;
