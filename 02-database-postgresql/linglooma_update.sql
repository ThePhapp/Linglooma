-- ============================================
-- LINGLOOMA IELTS DATABASE - COMPLETE MIGRATION
-- ============================================
-- Description: Complete database schema for Linglooma IELTS platform
-- Version: 2.0
-- Date: November 9, 2025
-- ============================================

-- DROP EXISTING TABLES (in correct order to handle foreign keys)
-- ============================================
DROP TABLE IF EXISTS incorrectphonemes CASCADE;
DROP TABLE IF EXISTS questionResult CASCADE;
DROP TABLE IF EXISTS lessonResult CASCADE;
DROP TABLE IF EXISTS question CASCADE;
DROP TABLE IF EXISTS lesson CASCADE;
DROP TABLE IF EXISTS writing_submissions CASCADE;
DROP TABLE IF EXISTS writing_tasks CASCADE;
DROP TABLE IF EXISTS reading_answers CASCADE;
DROP TABLE IF EXISTS reading_attempts CASCADE;
DROP TABLE IF EXISTS reading_questions CASCADE;
DROP TABLE IF EXISTS reading_passages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLE: users
-- ============================================
-- Description: Stores user account information
-- ============================================
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_lesson_type ON lesson(type);
CREATE INDEX idx_question_lessonid ON question(lessonId);
CREATE INDEX idx_lessonresult_student ON lessonResult(studentId);
CREATE INDEX idx_questionresult_student ON questionResult(studentId);
CREATE INDEX idx_reading_passages_topic ON reading_passages(topic);
CREATE INDEX idx_reading_questions_passage ON reading_questions(passage_id);
CREATE INDEX idx_reading_answers_user ON reading_answers(user_id);
CREATE INDEX idx_reading_attempts_user ON reading_attempts(user_id, submitted_at DESC, id DESC);
CREATE INDEX idx_writing_submissions_user ON writing_submissions(user_id);

-- ============================================
-- SAMPLE DATA: USERS
-- ============================================
INSERT INTO users (username, email, password, gender, nationality) VALUES
('demo_user', 'demo@linglooma.com', '$2b$10$demohashedpassword', 'male', 'Vietnam'),
('jane_doe', 'jane@example.com', '$2b$10$hashedpassword123', 'female', 'USA'),
('john_smith', 'john@example.com', '$2b$10$hashedpassword456', 'male', 'UK');

-- ============================================
-- SAMPLE DATA: SPEAKING LESSONS
-- ============================================
INSERT INTO lesson (name, type, image, description, difficulty) VALUES
('Technology', 'speaking', 
    'https://cdn.builder.io/api/v1/image/assets/d09fa83e4ab04468bd9329558cd49375/02a90a0b65e66df0963f1b5477527d2ac1445187?placeholderIfAbsent=true',
    'Discuss modern technology and its impact on society', 'medium'),
('Environment', 'speaking',
    'https://cdn.builder.io/api/v1/image/assets/d09fa83e4ab04468bd9329558cd49375/1236d1d71bbeb3c3824f8ab88eb5159654b5e4d1?placeholderIfAbsent=true',
    'Talk about environmental issues and sustainability', 'medium'),
('Education', 'speaking',
    'https://cdn.builder.io/api/v1/image/assets/d09fa83e4ab04468bd9329558cd49375/50ce905aa9a969e7683a8822bd451ce918855619?placeholderIfAbsent=true',
    'Explore education systems and learning methods', 'easy'),
('Health', 'speaking',
    'https://cdn.builder.io/api/v1/image/assets/d09fa83e4ab04468bd9329558cd49375/ddc2f9e7faf4c399e595e15ab3f987f8785f338f?placeholderIfAbsent=true',
    'Discuss health, fitness, and well-being', 'easy'),
('Travel', 'speaking',
    'https://cdn-images.vtv.vn/2019/12/10/untitled-15759663392891201724352.png',
    'Share experiences and opinions about traveling', 'medium'),
('Love', 'speaking',
    'https://bazaarvietnam.vn/wp-content/uploads/2023/04/HBVN-vuong-tu-ky-vuong-ngoc-van-trong-tinh-yeu-anh-danh-cho-em.jpg',
    'Express thoughts on relationships and emotions', 'hard');

-- ============================================
-- SAMPLE DATA: SPEAKING QUESTIONS
-- ============================================
INSERT INTO question (content, lessonId, order_number) VALUES
-- Technology (lessonId = 1)
('Technology plays an important role in our daily life.', 1, 1),
('Artificial intelligence is transforming the world.', 1, 2),
('Social media has both positive and negative impacts.', 1, 3),
('We rely on smartphones for almost everything.', 1, 4),
('The Internet has revolutionized communication.', 1, 5),
('Technology in education makes learning more accessible.', 1, 6),
('Cybersecurity is crucial in the digital age.', 1, 7),
('Online shopping has become increasingly popular.', 1, 8),
('Automation is changing the job market.', 1, 9),
-- Environment (lessonId = 2)
('Climate change is a global concern.', 2, 1),
('We must reduce carbon emissions.', 2, 2),
('Deforestation affects biodiversity.', 2, 3),
('Plastic pollution is harming marine life.', 2, 4),
('Renewable energy is the future.', 2, 5),
('Protecting wildlife is essential.', 2, 6),
('Recycling helps save the environment.', 2, 7),
('Water conservation is necessary.', 2, 8),
('Green technology is being developed rapidly.', 2, 9),
-- Education (lessonId = 3)
('Education is the foundation of a strong society.', 3, 1),
('Online learning is becoming more common.', 3, 2),
('Teachers play a vital role in student development.', 3, 3),
('Access to quality education is still unequal.', 3, 4),
('Homework helps reinforce learning.', 3, 5),
('Classrooms are integrating more technology.', 3, 6),
('Standardized tests are widely debated.', 3, 7),
('Lifelong learning is important.', 3, 8),
('Curriculum reforms are needed.', 3, 9),
-- Health (lessonId = 4)
('A balanced diet is essential for good health.', 4, 1),
('Regular exercise improves physical fitness.', 4, 2),
('Mental health should not be ignored.', 4, 3),
('Vaccines help prevent diseases.', 4, 4),
('Healthcare should be accessible to all.', 4, 5),
('Smoking causes serious health problems.', 4, 6),
('Sleep is important for brain function.', 4, 7),
('Public health campaigns raise awareness.', 4, 8),
('Obesity is a growing concern.', 4, 9),
-- Travel (lessonId = 5)
('Travel broadens our perspective.', 5, 1),
('Tourism can boost the economy.', 5, 2),
('Cultural exchange happens through travel.', 5, 3),
('Air travel is faster but less eco-friendly.', 5, 4),
('Backpacking is popular among youth.', 5, 5),
('Traveling solo builds confidence.', 5, 6),
('Safety is important when traveling abroad.', 5, 7),
('Travel blogs share unique experiences.', 5, 8),
('Visa requirements vary by country.', 5, 9),
-- Love (lessonId = 6)
('Love reflects a person''s deepest emotions.', 6, 1),
('Music is a powerful expression of love.', 6, 2),
('Love brings people closer together.', 6, 3),
('Romantic gestures have symbolic meaning.', 6, 4),
('True love should be cherished and protected.', 6, 5),
('Love evolves through life experiences.', 6, 6),
('Words are key to expressing love.', 6, 7),
('Sharing meals can strengthen love.', 6, 8),
('Love stories have been told for generations.', 6, 9);

-- ============================================
-- SAMPLE DATA: READING PASSAGES
-- ============================================
INSERT INTO reading_passages (title, passage_text, topic, difficulty, reading_time) VALUES
('The Impact of Climate Change on Global Agriculture', 
'Climate change is one of the most pressing challenges facing humanity in the 21st century. Rising global temperatures, changing precipitation patterns, and more frequent extreme weather events are having profound effects on agricultural systems worldwide. Farmers are experiencing shifts in growing seasons, increased pest pressures, and unpredictable weather that makes traditional farming practices less reliable. In tropical regions, higher temperatures are reducing crop yields, while in temperate zones, some areas are seeing extended growing seasons. Scientists estimate that without significant adaptation measures, global crop yields could decline by 10-25% by 2050. This poses serious risks to food security, particularly in developing nations that are already vulnerable to hunger. Adaptation strategies include developing drought-resistant crop varieties, improving irrigation systems, and implementing sustainable farming practices that enhance soil health and water retention.',
'Environment', 'medium', 20),

('The Evolution of Artificial Intelligence', 
'Artificial Intelligence (AI) has evolved from a theoretical concept to a transformative technology that impacts nearly every aspect of modern life. The journey began in the 1950s when computer scientists first explored the possibility of creating machines that could think. Early AI systems were rule-based and could only handle specific, well-defined tasks. The breakthrough came with machine learning, which enabled computers to learn from data rather than following pre-programmed rules. Today, deep learning neural networks can recognize patterns in vast datasets, leading to applications in image recognition, natural language processing, and autonomous vehicles. However, the rapid advancement of AI also raises important ethical questions about privacy, job displacement, and the potential for bias in algorithmic decision-making. As AI continues to evolve, society must balance innovation with responsible development to ensure these powerful tools benefit humanity as a whole.',
'Technology', 'hard', 20),

('The Benefits of Multilingual Education',
'Learning multiple languages from an early age offers numerous cognitive and social advantages. Research shows that bilingual children often demonstrate enhanced executive function, including better problem-solving skills, improved memory, and greater mental flexibility. These cognitive benefits extend beyond language learning, positively impacting performance in mathematics, science, and creative thinking. Multilingual education also promotes cultural awareness and empathy by exposing students to different perspectives and worldviews. In an increasingly globalized world, proficiency in multiple languages opens doors to international career opportunities and facilitates cross-cultural communication. Despite these benefits, many education systems struggle to implement effective multilingual programs due to resource constraints and the challenge of finding qualified teachers. Success stories from countries like Singapore and Switzerland demonstrate that with proper planning and investment, multilingual education can be successfully integrated into mainstream schooling.',
'Education', 'medium', 20);

-- ============================================
-- SAMPLE DATA: READING QUESTIONS
-- ============================================
INSERT INTO reading_questions (passage_id, question_text, question_type, correct_answer, options, order_number, explanation) VALUES
-- Questions for Passage 1 (Climate Change)
(1, 'According to the passage, what is the estimated decline in global crop yields by 2050 without adaptation?', 'multiple_choice', 'C', 
'{"A": "5-10%", "B": "8-15%", "C": "10-25%", "D": "30-40%"}', 1, 
'The passage states: "Scientists estimate that without significant adaptation measures, global crop yields could decline by 10-25% by 2050."'),

(1, 'Climate change affects only tropical farming regions.', 'true_false_notgiven', 'FALSE', NULL, 2,
'The passage mentions effects in both tropical regions (reduced yields) and temperate zones (extended growing seasons).'),

(1, 'What are farmers experiencing due to climate change?', 'multiple_choice', 'D',
'{"A": "Shifts in growing seasons", "B": "Increased pest pressures", "C": "Unpredictable weather", "D": "All of the above"}', 3,
'All three factors are explicitly mentioned in the passage.'),

-- Questions for Passage 2 (AI Evolution)
(2, 'When did the exploration of Artificial Intelligence begin?', 'multiple_choice', 'B',
'{"A": "1940s", "B": "1950s", "C": "1960s", "D": "1970s"}', 1,
'The passage states: "The journey began in the 1950s when computer scientists first explored the possibility."'),

(2, 'Early AI systems were based on machine learning techniques.', 'true_false_notgiven', 'FALSE', NULL, 2,
'The passage says early AI systems were "rule-based" and the breakthrough came later with machine learning.'),

(2, 'What ethical concerns does the passage mention regarding AI?', 'multiple_choice', 'D',
'{"A": "Privacy issues only", "B": "Job displacement only", "C": "Algorithmic bias only", "D": "All of the above"}', 3,
'The passage lists privacy, job displacement, and bias as ethical concerns.'),

-- Questions for Passage 3 (Multilingual Education)
(3, 'Which countries are mentioned as success stories for multilingual education?', 'multiple_choice', 'C',
'{"A": "USA and UK", "B": "China and Japan", "C": "Singapore and Switzerland", "D": "France and Germany"}', 1,
'The passage explicitly mentions Singapore and Switzerland as success stories.'),

(3, 'Bilingual children show improvements only in language-related subjects.', 'true_false_notgiven', 'FALSE', NULL, 2,
'The passage states benefits extend beyond language to mathematics, science, and creative thinking.'),

(3, 'What is mentioned as a challenge for implementing multilingual programs?', 'multiple_choice', 'C',
'{"A": "Resource constraints", "B": "Finding qualified teachers", "C": "Both A and B", "D": "Neither A nor B"}', 3,
'The passage mentions both resource constraints and the challenge of finding qualified teachers.');

-- ============================================
-- SAMPLE DATA: WRITING TASKS
-- ============================================
INSERT INTO writing_tasks (title, task_type, prompt, topic, difficulty, min_words, time_limit) VALUES
('Graph Analysis: Internet Usage', 'task1',
'The graph below shows the percentage of households with internet access in different countries from 2010 to 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
'Technology', 'medium', 150, 20),

('Opinion Essay: Technology in Education', 'task2',
'Some people believe that technology has made learning easier and more accessible, while others think it has made students less focused and more dependent. Discuss both views and give your own opinion.',
'Education', 'medium', 250, 40),

('Problem-Solution Essay: Environmental Issues', 'task2',
'Environmental pollution is increasing day by day. What are the main causes of this problem? What solutions can you suggest to solve this issue?',
'Environment', 'hard', 250, 40),

('Chart Description: Employment Sectors', 'task1',
'The pie chart shows the distribution of employment across different sectors in a developed country. Describe the main features and make comparisons where relevant.',
'Work', 'easy', 150, 20),

('Argumentative Essay: Public Health', 'task2',
'Some people think governments should spend money on public health programs, while others believe individuals should be responsible for their own health. Discuss both views and give your opinion.',
'Health', 'medium', 250, 40);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
-- Migration completed successfully!
-- Tables created: 11
--   - users
--   - lesson (speaking)
--   - question (speaking)
--   - lessonResult (speaking)
--   - questionResult (speaking)
--   - incorrectphonemes (speaking)
--   - reading_passages
--   - reading_questions
--   - reading_answers
--   - writing_tasks
--   - writing_submissions
-- 
-- Sample data inserted:
--   - Users: 3
--   - Speaking lessons: 6
--   - Speaking questions: 54 (9 per lesson)
--   - Reading passages: 3
--   - Reading questions: 9 (3 per passage)
--   - Writing tasks: 5
-- 
-- Indexes created: 9
-- ============================================
