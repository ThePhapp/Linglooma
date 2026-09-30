-- Canonical plural schema baseline for empty databases and additive adoption.
-- No sample accounts or content. Existing tables and rows are preserved.
-- Run only through run-migration.bat / run-migration.ps1.
BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(320) UNIQUE,
    email VARCHAR(320) UNIQUE NOT NULL,
    phoneNumber CHAR(11),
    password VARCHAR(320) NOT NULL,
    gender VARCHAR(50),
    nationality VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    profile_picture VARCHAR(500)
);

-- ============================================
-- TABLE: lesson (Speaking Practice)
-- ============================================
-- Description: Stores speaking lesson topics
-- ============================================
CREATE TABLE IF NOT EXISTS lesson (
    id SERIAL PRIMARY KEY,
    name VARCHAR(320) NOT NULL,
    type VARCHAR(320) DEFAULT 'speaking',
    image VARCHAR(1000),
    description TEXT,
    difficulty VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- ============================================
-- TABLE: question (Speaking Questions)
-- ============================================
-- Description: Stores speaking practice questions
-- ============================================
CREATE TABLE IF NOT EXISTS question (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    lessonId INTEGER NOT NULL,
    order_number INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: lessonResult (Speaking Results)
-- ============================================
-- Description: Stores overall results for speaking lessons
-- ============================================
CREATE TABLE IF NOT EXISTS lessonResult (
    id SERIAL PRIMARY KEY,
    studentId INTEGER NOT NULL,
    lessonId INTEGER NOT NULL,
    finishedTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    averageScore FLOAT,
    feedback TEXT,
    total_questions INTEGER,
    completed_questions INTEGER,
    FOREIGN KEY (lessonId) REFERENCES lesson(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: questionResult (Speaking Question Results)
-- ============================================
-- Description: Stores individual question results for speaking
-- ============================================
CREATE TABLE IF NOT EXISTS questionResult (
    id SERIAL PRIMARY KEY,
    studentId INTEGER NOT NULL,
    lessonResultId INTEGER NOT NULL,
    questionId INTEGER NOT NULL,
    ieltsBand FLOAT,
    accuracy FLOAT,
    fluency FLOAT,
    completeness FLOAT,
    pronunciation FLOAT,
    feedback TEXT,
    audio_url VARCHAR(500),
    transcription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lessonResultId) REFERENCES lessonResult(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES question(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: incorrectphonemes
-- ============================================
-- Description: Tracks pronunciation errors for speaking practice
-- ============================================
CREATE TABLE IF NOT EXISTS incorrectphonemes (
    id SERIAL PRIMARY KEY,
    phoneme VARCHAR(10),
    questionResultId INTEGER,
    lessonResultId INTEGER,
    questionId INTEGER,
    studentId INTEGER NOT NULL,
    incorrect_count INTEGER DEFAULT 1,
    example_word VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionResultId) REFERENCES questionResult(id) ON DELETE CASCADE,
    FOREIGN KEY (lessonResultId) REFERENCES lessonResult(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES question(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: reading_passages
-- ============================================
-- Description: Stores IELTS reading passages
-- ============================================
CREATE TABLE IF NOT EXISTS reading_passages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    passage_text TEXT NOT NULL,
    topic VARCHAR(100),
    difficulty VARCHAR(50) DEFAULT 'medium',
    reading_time INTEGER DEFAULT 20,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    author VARCHAR(200),
    source VARCHAR(200)
);

-- ============================================
-- TABLE: reading_questions
-- ============================================
-- Description: Stores questions for reading passages
-- ============================================
CREATE TABLE IF NOT EXISTS reading_questions (
    id SERIAL PRIMARY KEY,
    passage_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    correct_answer TEXT NOT NULL,
    options JSONB,
    order_number INTEGER DEFAULT 1,
    points INTEGER DEFAULT 1,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passage_id) REFERENCES reading_passages(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: reading_attempts
-- ============================================
-- One row per submission; scores are saved at submission time.
-- ============================================
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

-- ============================================
-- TABLE: reading_answers
-- ============================================
-- Description: Stores user answers for reading questions
-- ============================================
CREATE TABLE IF NOT EXISTS reading_answers (
    id SERIAL PRIMARY KEY,
    -- Nullable only to preserve legacy answers with unknown submission boundaries.
    attempt_id INTEGER,
    user_id INTEGER NOT NULL,
    passage_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN,
    time_spent INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (passage_id) REFERENCES reading_passages(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES reading_questions(id) ON DELETE CASCADE,
    CONSTRAINT reading_answers_attempt_fk FOREIGN KEY (attempt_id, user_id, passage_id)
        REFERENCES reading_attempts(id, user_id, passage_id) ON DELETE CASCADE,
    CONSTRAINT reading_answers_attempt_question_key UNIQUE (attempt_id, question_id)
);

-- ============================================
-- TABLE: writing_tasks
-- ============================================
-- Description: Stores IELTS writing tasks (Task 1 & Task 2)
-- ============================================
CREATE TABLE IF NOT EXISTS writing_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    topic VARCHAR(100),
    difficulty VARCHAR(50) DEFAULT 'medium',
    min_words INTEGER DEFAULT 150,
    time_limit INTEGER DEFAULT 20,
    image_url VARCHAR(500),
    sample_answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- ============================================
-- TABLE: writing_submissions
-- ============================================
-- Description: Stores user writing submissions and AI feedback
-- ============================================
CREATE TABLE IF NOT EXISTS writing_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL,
    essay_text TEXT NOT NULL,
    word_count INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    overall_band FLOAT,
    task_achievement FLOAT,
    coherence_cohesion FLOAT,
    lexical_resource FLOAT,
    grammatical_range FLOAT,

    feedback_overall TEXT,
    feedback_task_achievement TEXT,
    feedback_coherence TEXT,
    feedback_vocabulary TEXT,
    feedback_grammar TEXT,
    suggestions TEXT,

    time_spent INTEGER,
    is_completed BOOLEAN DEFAULT true,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES writing_tasks(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES for Better Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_lesson_type ON lesson(type);
CREATE INDEX IF NOT EXISTS idx_question_lessonid ON question(lessonId);
CREATE INDEX IF NOT EXISTS idx_lessonresult_student ON lessonResult(studentId);
CREATE INDEX IF NOT EXISTS idx_questionresult_student ON questionResult(studentId);
CREATE INDEX IF NOT EXISTS idx_reading_passages_topic ON reading_passages(topic);
CREATE INDEX IF NOT EXISTS idx_reading_questions_passage ON reading_questions(passage_id);
CREATE INDEX IF NOT EXISTS idx_reading_answers_user ON reading_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_attempts_user ON reading_attempts(user_id, submitted_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_user ON writing_submissions(user_id);

-- ============================================

COMMIT;
