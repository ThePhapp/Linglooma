-- ARCHIVED: obsolete singular writing_* schema, retained for historical reference.
-- The app uses writing_tasks and writing_submissions.
-- This deliberate error aborts the transaction before any legacy DDL or seed data.
BEGIN;
DO $$ BEGIN RAISE EXCEPTION 'Archived writing_migration.sql must not be executed; use run-migration.bat or run-migration.ps1'; END $$;

-- Bảng chứa các đề bài Writing
CREATE TABLE IF NOT EXISTS writing_prompt (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    task_type VARCHAR(50) NOT NULL,  -- Task 1, Task 2
    prompt_text TEXT NOT NULL,
    difficulty VARCHAR(50),  -- Easy, Medium, Hard, Academic
    topic VARCHAR(200),
    image VARCHAR(1000),
    word_limit INTEGER DEFAULT 250,  -- Số từ tối thiểu
    time_limit INTEGER DEFAULT 40,   -- Thời gian làm bài (phút)
    sample_answer TEXT,  -- Bài mẫu (optional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu bài viết của học viên
CREATE TABLE IF NOT EXISTS writing_submission (
    id SERIAL PRIMARY KEY,
    studentId INTEGER NOT NULL,
    promptId INTEGER NOT NULL,
    essay_text TEXT NOT NULL,
    word_count INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (promptId) REFERENCES writing_prompt(id) ON DELETE CASCADE
);

-- Bảng lưu kết quả chấm bài (AI Gemini)
CREATE TABLE IF NOT EXISTS writing_result (
    id SERIAL PRIMARY KEY,
    submissionId INTEGER NOT NULL UNIQUE,
    
    -- Điểm số chi tiết
    task_achievement FLOAT,      -- Task Achievement / Task Response (0-9)
    coherence_cohesion FLOAT,    -- Coherence and Cohesion (0-9)
    lexical_resource FLOAT,      -- Lexical Resource (0-9)
    grammar_accuracy FLOAT,      -- Grammatical Range and Accuracy (0-9)
    overall_band FLOAT,          -- Overall IELTS Band Score (0-9)
    
    -- Feedback từ AI
    overall_feedback TEXT,       -- Đánh giá tổng quan
    strengths TEXT,              -- Điểm mạnh
    weaknesses TEXT,             -- Điểm yếu
    grammar_errors JSON,         -- Lỗi ngữ pháp [{error, correction, explanation}]
    vocabulary_suggestions JSON, -- Gợi ý từ vựng [{word, suggestion, context}]
    structure_feedback TEXT,     -- Feedback về cấu trúc bài viết
    improvement_tips TEXT,       -- Lời khuyên cải thiện
    
    -- Metadata
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_model VARCHAR(100) DEFAULT 'gemini-2.0-flash',
    
    FOREIGN KEY (submissionId) REFERENCES writing_submission(id) ON DELETE CASCADE
);

-- Thêm dữ liệu mẫu - Task 1 (Academic)
INSERT INTO writing_prompt (title, task_type, prompt_text, difficulty, topic, word_limit, time_limit)
VALUES 
(
    'Line Graph - Internet Users Growth',
    'Task 1',
    'The line graph below shows the percentage of internet users in three different countries from 1999 to 2009.

Summarize the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
    'Medium',
    'Technology & Society',
    150,
    20
),
(
    'Bar Chart - Student Enrollment',
    'Task 1',
    'The bar chart shows the number of students enrolled in different faculties at a university in 2019 and 2020.

Summarize the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
    'Easy',
    'Education',
    150,
    20
);

-- Thêm dữ liệu mẫu - Task 2 (Opinion Essay)
INSERT INTO writing_prompt (title, task_type, prompt_text, difficulty, topic, word_limit, time_limit)
VALUES 
(
    'Technology in Education',
    'Task 2',
    'Some people believe that technology has made learning easier and more accessible, while others think it has made students lazy and less focused.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
    'Medium',
    'Education & Technology',
    250,
    40
),
(
    'Environmental Responsibility',
    'Task 2',
    'Many people believe that individuals can do little to improve the environment. Only governments and large companies can make a real difference.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.',
    'Hard',
    'Environment',
    250,
    40
);

-- Indexes để tối ưu query
CREATE INDEX idx_writing_submission_student ON writing_submission(studentId);
CREATE INDEX idx_writing_submission_prompt ON writing_submission(promptId);
CREATE INDEX idx_writing_result_submission ON writing_result(submissionId);
CREATE INDEX idx_writing_prompt_task_type ON writing_prompt(task_type);
CREATE INDEX idx_writing_prompt_difficulty ON writing_prompt(difficulty);
