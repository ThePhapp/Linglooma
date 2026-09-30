// Static contract checks only: these tests never connect to PostgreSQL.
const fs = require('fs');
const path = require('path');

const database = path.resolve(__dirname, '../../02-database-postgresql');
const stripComments = sql => sql.replace(/--[^\r\n]*/g, '').replace(/\s+/g, ' ').trim();
const reset = stripComments(fs.readFileSync(path.join(database, 'linglooma_update.sql'), 'utf8'));
const forward = stripComments(fs.readFileSync(path.join(database, 'migrations/20260930_t08_reading_attempts.sql'), 'utf8'));

test('reset and forward migration define identical canonical attempt tables', () => {
    const table = /CREATE TABLE IF NOT EXISTS reading_attempts \(.*?\);/;
    expect(reset.match(table)?.[0]).toBeDefined();
    expect(forward.match(table)?.[0]).toBe(reset.match(table)[0]);
    expect(reset.indexOf('DROP TABLE IF EXISTS reading_answers')).toBeLessThan(reset.indexOf('DROP TABLE IF EXISTS reading_attempts'));
    expect(reset.indexOf('DROP TABLE IF EXISTS reading_attempts')).toBeLessThan(reset.indexOf('DROP TABLE IF EXISTS reading_passages'));
});

test('both schemas enforce attempt ownership and one answer per question per attempt', () => {
    for (const sql of [reset, forward]) {
        expect(sql).toContain('CONSTRAINT reading_answers_attempt_fk FOREIGN KEY (attempt_id, user_id, passage_id) REFERENCES reading_attempts(id, user_id, passage_id) ON DELETE CASCADE');
        expect(sql).toContain('CONSTRAINT reading_answers_attempt_question_key UNIQUE (attempt_id, question_id)');
        expect(sql).toContain('idx_reading_attempts_user ON reading_attempts(user_id, submitted_at DESC, id DESC)');
    }
});

test('forward migration is transactional, additive and preserves unknown legacy boundaries', () => {
    expect(forward.startsWith('BEGIN;')).toBe(true);
    expect(forward.endsWith('COMMIT;')).toBe(true);
    expect(forward).not.toMatch(/\b(DROP|TRUNCATE|UPDATE|INSERT)\b/i);
    expect(forward).not.toMatch(/\bDELETE\s+FROM\b/i);
    expect(forward).toContain('ALTER TABLE reading_answers ADD COLUMN IF NOT EXISTS attempt_id INTEGER;');
    expect(reset).toContain('attempt_id INTEGER,');
    expect(forward).not.toMatch(/attempt_id[^;]*NOT NULL/i);
    expect(forward).toContain("conrelid = 'reading_answers'::regclass AND conname = 'reading_answers_attempt_fk'");
    expect(forward).toContain("conrelid = 'reading_answers'::regclass AND conname = 'reading_answers_attempt_question_key'");
    expect(forward).not.toMatch(/\b(reading_result|reading_answer_detail|reading_option)\b/);
});
