-- ARCHIVED: obsolete singular reading_* schema, retained for historical reference.
-- The app uses reading_passages, reading_questions, reading_attempts, reading_answers.
-- This deliberate error aborts the transaction before any legacy DDL or seed data.
BEGIN;
DO $$ BEGIN RAISE EXCEPTION 'Archived reading_migration.sql must not be executed; use run-migration.bat or run-migration.ps1'; END $$;

-- Bảng chứa các bài đọc (Reading passages)
CREATE TABLE IF NOT EXISTS reading_passage (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    passage TEXT NOT NULL,
    difficulty VARCHAR(50),  -- Easy, Medium, Hard, Academic
    topic VARCHAR(200),
    image VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chứa câu hỏi trắc nghiệm cho mỗi bài đọc
CREATE TABLE IF NOT EXISTS reading_question (
    id SERIAL PRIMARY KEY,
    passageId INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple-choice',  -- multiple-choice, true-false, matching
    question_order INTEGER,
    FOREIGN KEY (passageId) REFERENCES reading_passage(id) ON DELETE CASCADE
);

-- Bảng chứa các lựa chọn cho mỗi câu hỏi
CREATE TABLE IF NOT EXISTS reading_option (
    id SERIAL PRIMARY KEY,
    questionId INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INTEGER,
    FOREIGN KEY (questionId) REFERENCES reading_question(id) ON DELETE CASCADE
);

-- Bảng lưu kết quả làm bài reading của học viên
CREATE TABLE IF NOT EXISTS reading_result (
    id SERIAL PRIMARY KEY,
    studentId INTEGER NOT NULL,
    passageId INTEGER NOT NULL,
    score INTEGER NOT NULL,  -- Số câu đúng
    total_questions INTEGER NOT NULL,  -- Tổng số câu
    percentage FLOAT,  -- Phần trăm điểm
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (passageId) REFERENCES reading_passage(id) ON DELETE CASCADE
);

-- Bảng lưu chi tiết câu trả lời của từng câu hỏi
CREATE TABLE IF NOT EXISTS reading_answer_detail (
    id SERIAL PRIMARY KEY,
    resultId INTEGER NOT NULL,
    questionId INTEGER NOT NULL,
    selectedOptionId INTEGER,
    is_correct BOOLEAN,
    FOREIGN KEY (resultId) REFERENCES reading_result(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES reading_question(id) ON DELETE CASCADE,
    FOREIGN KEY (selectedOptionId) REFERENCES reading_option(id) ON DELETE SET NULL
);

-- Thêm dữ liệu mẫu
INSERT INTO reading_passage (title, passage, difficulty, topic, image)
VALUES 
(
    'The Impact of Technology on Modern Education',
    'Technology has revolutionized the way we approach education in the 21st century. From online learning platforms to interactive whiteboards, digital tools have transformed traditional classrooms into dynamic learning environments. Students can now access vast amounts of information at their fingertips, collaborate with peers across the globe, and receive personalized feedback through artificial intelligence.

However, this digital transformation comes with its own set of challenges. Not all students have equal access to technology, creating a digital divide that can exacerbate existing educational inequalities. Moreover, the over-reliance on technology may reduce face-to-face interaction and critical thinking skills.

Despite these concerns, many educators believe that when used appropriately, technology can enhance learning outcomes and prepare students for an increasingly digital world. The key lies in finding the right balance between traditional teaching methods and innovative technological solutions.',
    'Medium',
    'Education & Technology',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'
),
(
    'Climate Change and Its Effects',
    'Climate change is one of the most pressing challenges facing humanity today. Rising global temperatures, melting ice caps, and extreme weather events are just some of the visible impacts of this phenomenon. Scientists agree that human activities, particularly the burning of fossil fuels and deforestation, are the primary drivers of climate change.

The consequences of climate change extend far beyond environmental concerns. It affects food security, water resources, human health, and economic stability. Coastal communities face the threat of rising sea levels, while inland regions experience more frequent droughts and floods.

International cooperation is essential to address this global crisis. The Paris Agreement, signed by nearly 200 countries, represents a collective effort to limit global warming. However, individual actions also matter. By reducing our carbon footprint, supporting renewable energy, and adopting sustainable practices, each person can contribute to the solution.',
    'Hard',
    'Environment',
    'https://images.unsplash.com/photo-1569163139394-de4798aa62b0?w=800'
);

-- Câu hỏi cho bài đọc 1 (Technology in Education)
INSERT INTO reading_question (passageId, question_text, question_type, question_order)
VALUES 
(1, 'According to the passage, what has technology done to education?', 'multiple-choice', 1),
(1, 'What is mentioned as a challenge of digital transformation in education?', 'multiple-choice', 2),
(1, 'What do many educators believe about technology in education?', 'multiple-choice', 3),
(1, 'The passage suggests that over-reliance on technology may reduce critical thinking skills.', 'true-false', 4);

-- Lựa chọn cho câu hỏi 1.1
INSERT INTO reading_option (questionId, option_text, is_correct, option_order)
VALUES 
(1, 'It has made education more expensive', FALSE, 1),
(1, 'It has transformed traditional classrooms into dynamic learning environments', TRUE, 2),
(1, 'It has eliminated the need for teachers', FALSE, 3),
(1, 'It has reduced student engagement', FALSE, 4);

-- Lựa chọn cho câu hỏi 1.2
INSERT INTO reading_option (questionId, option_text, is_correct, option_order)
VALUES 
(2, 'Technology is too expensive for schools', FALSE, 1),
(2, 'Not all students have equal access to technology', TRUE, 2),
(2, 'Teachers don''t know how to use technology', FALSE, 3),
(2, 'Students prefer traditional methods', FALSE, 4);

-- Lựa chọn cho câu hỏi 1.3
INSERT INTO reading_option (questionId, option_text, is_correct, option_order)
VALUES 
(3, 'Technology should replace all traditional teaching', FALSE, 1),
(3, 'Technology is harmful to learning', FALSE, 2),
(3, 'When used appropriately, technology can enhance learning outcomes', TRUE, 3),
(3, 'Technology should be banned from classrooms', FALSE, 4);

-- Lựa chọn cho câu hỏi 1.4 (True/False)
INSERT INTO reading_option (questionId, option_text, is_correct, option_order)
VALUES 
(4, 'True', TRUE, 1),
(4, 'False', FALSE, 2);

-- Câu hỏi cho bài đọc 2 (Climate Change)
INSERT INTO reading_question (passageId, question_text, question_type, question_order)
VALUES 
(2, 'What are the primary drivers of climate change according to the passage?', 'multiple-choice', 1),
(2, 'Which of the following is NOT mentioned as a consequence of climate change?', 'multiple-choice', 2),
(2, 'What does the Paris Agreement represent?', 'multiple-choice', 3),
(2, 'According to the passage, individual actions cannot help address climate change.', 'true-false', 4);

-- Lựa chọn cho câu hỏi 2.1
INSERT INTO reading_option (questionId, option_text, is_correct, option_order)
VALUES 
(5, 'Natural disasters and volcanic eruptions', FALSE, 1),
(5, 'Burning fossil fuels and deforestation', TRUE, 2),
(5, 'Overpopulation and urbanization', FALSE, 3),
(5, 'Ocean currents and solar radiation', FALSE, 4);

-- Lựa chọn cho câu hỏi 2.2
INSERT INTO reading_option (questionId, option_text, is_correct, option_order)
VALUES 
(6, 'Food security issues', FALSE, 1),
(6, 'Water resource problems', FALSE, 2),
(6, 'Increased tourism', TRUE, 3),
(6, 'Economic instability', FALSE, 4);

-- Lựa chọn cho câu hỏi 2.3
INSERT INTO reading_option (questionId, option_text, is_correct, option_order)
VALUES 
(7, 'A treaty signed by only developed countries', FALSE, 1),
(7, 'A collective effort by nearly 200 countries to limit global warming', TRUE, 2),
(7, 'A plan to eliminate all fossil fuels immediately', FALSE, 3),
(7, 'A financial aid program for poor countries', FALSE, 4);

-- Lựa chọn cho câu hỏi 2.4 (True/False)
INSERT INTO reading_option (questionId, option_text, is_correct, option_order)
VALUES 
(8, 'True', FALSE, 1),
(8, 'False', TRUE, 2);

-- Index để tối ưu query
CREATE INDEX idx_reading_question_passage ON reading_question(passageId);
CREATE INDEX idx_reading_option_question ON reading_option(questionId);
CREATE INDEX idx_reading_result_student ON reading_result(studentId);
CREATE INDEX idx_reading_result_passage ON reading_result(passageId);
CREATE INDEX idx_reading_answer_result ON reading_answer_detail(resultId);
