const client = require('../db');

const requestError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const parseId = (value, name) => {
    if (!['string', 'number'].includes(typeof value) || !/^[1-9]\d*$/.test(String(value)) ||
        !Number.isSafeInteger(Number(value)) || Number(value) > 2147483647) {
        throw requestError(`${name} must be a positive integer`);
    }
    return Number(value);
};

// Use the same option IDs for public questions and submission validation (including 0).
const getOptions = (question) => {
    const options = question.options;
    if (options && typeof options === 'object' && !Array.isArray(options)) {
        return Object.entries(options).map(([id, option_text]) => ({ id, option_text }));
    }
    if (Array.isArray(options)) {
        return options.map((option, index) => {
            if (option && typeof option === 'object' && (option.option_text || option.text || option.label)) {
                return { id: option.id ?? index, option_text: option.option_text ?? option.text ?? option.label };
            }
            return { id: index, option_text: String(option) };
        });
    }
    if (question.question_type?.toLowerCase().includes('true')) {
        return ['TRUE', 'FALSE', 'NOT GIVEN'].map(id => ({ id, option_text: id }));
    }
    return [];
};

const normalizeValue = (value) => {
    if ((typeof value !== 'string' && !(typeof value === 'number' && Number.isSafeInteger(value))) ||
        String(value).trim().length === 0) {
        throw requestError('Answer values must be non-empty strings or integer option IDs');
    }
    return String(value).trim();
};

const normalizeAnswers = (answers) => {
    if (!Array.isArray(answers) || answers.length === 0) {
        throw requestError('Answers must be a non-empty array');
    }
    const seen = new Set();
    return answers.map(answer => {
        if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
            throw requestError('Each answer must be an object');
        }
        const questionId = parseId(answer.questionId, 'questionId');
        if (seen.has(questionId)) throw requestError('Duplicate questionId');
        seen.add(questionId);
        const hasOption = Object.prototype.hasOwnProperty.call(answer, 'selectedOptionId');
        const hasAnswer = Object.prototype.hasOwnProperty.call(answer, 'userAnswer');
        if (!hasOption && !hasAnswer) throw requestError('Each answer needs selectedOptionId or userAnswer');
        const option = hasOption ? normalizeValue(answer.selectedOptionId) : null;
        const value = hasAnswer ? normalizeValue(answer.userAnswer) : option;
        if (hasOption && option.toLowerCase() !== value.toLowerCase()) {
            throw requestError('selectedOptionId and userAnswer must agree');
        }
        const timeSpent = answer.timeSpent === undefined ? 0 : answer.timeSpent;
        if (!Number.isInteger(timeSpent) || timeSpent < 0 || timeSpent > 2147483647) {
            throw requestError('timeSpent must be a non-negative integer');
        }
        return { questionId, userAnswer: value, timeSpent };
    });
};

// Lấy tất cả bài đọc
const getAllPassages = async () => {
    const result = await client.query(
        `SELECT id, title, difficulty, topic, image_url as image, created_at 
         FROM reading_passages 
         WHERE is_active = true
         ORDER BY created_at DESC`
    );
    return result;
};

// Lấy một bài đọc kèm theo câu hỏi (KHÔNG bao gồm đáp án đúng)
const getPassageById = async (passageId) => {
    // Lấy thông tin bài đọc
    const passageResult = await client.query(
        'SELECT id, title, passage_text, topic, difficulty, reading_time, image_url, author, source FROM reading_passages WHERE id = $1',
        [passageId]
    );
    
    if (passageResult.rows.length === 0) {
        return null;
    }

    // Lấy câu hỏi của bài đọc (không trả về correct_answer)
    const questionsResult = await client.query(
        `SELECT id, question_text, question_type, options, order_number, points 
         FROM reading_questions 
         WHERE passage_id = $1 
         ORDER BY order_number`,
        [passageId]
    );

    // Normalize options for each question so frontend can safely iterate
    const normalizedQuestions = questionsResult.rows.map(q => {
        return {
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: getOptions(q),
            order_number: q.order_number,
            points: q.points
        };
    });

    return {
        passage: passageResult.rows[0],
        questions: normalizedQuestions
    };
};

// Chấm bài và lưu kết quả
const submitReading = async (studentId, passageId, answers) => {
    studentId = parseId(studentId, 'studentId');
    passageId = parseId(passageId, 'passageId');
    const normalized = normalizeAnswers(answers);
    const connection = await client.connect();
    let began = false;
    let releaseError;
    try {
        await connection.query('BEGIN');
        began = true;
        const passage = await connection.query('SELECT id FROM reading_passages WHERE id = $1 FOR SHARE', [passageId]);
        if (!passage.rows.length) throw requestError('Reading passage not found', 404);
        const questions = await connection.query(
            `SELECT id, correct_answer, points, question_type, options
             FROM reading_questions WHERE passage_id = $1 ORDER BY order_number FOR SHARE`,
            [passageId]
        );
        if (!questions.rows.length) throw requestError('Reading passage has no questions');
        const byId = new Map(questions.rows.map(question => [question.id, question]));
        // Missing answers score zero; the denominator always covers the whole passage.
        const maxScore = questions.rows.reduce((sum, question) => sum + (question.points ?? 1), 0);
        const details = normalized.map(answer => {
            const question = byId.get(answer.questionId);
            if (!question) throw requestError('questionId does not belong to this passage');
            const option = getOptions(question).find(item =>
                String(item.id).trim().toLowerCase() === answer.userAnswer.toLowerCase());
            if (!option) throw requestError(`Unsupported answer for question ${answer.questionId}`);
            const userAnswer = String(option.id);
            const isCorrect = question.correct_answer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
            return {
                questionId: answer.questionId,
                userAnswer,
                correctAnswer: question.correct_answer,
                isCorrect,
                points: isCorrect ? (question.points ?? 1) : 0
            };
        });
        const score = details.reduce((sum, answer) => sum + answer.points, 0);
        const attempt = await connection.query(
            `INSERT INTO reading_attempts (user_id, passage_id, total_score, max_score, total_questions)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [studentId, passageId, score, maxScore, questions.rows.length]
        );
        const resultId = attempt.rows[0].id;
        for (let index = 0; index < details.length; index++) {
            const answer = details[index];
            await connection.query(
                `INSERT INTO reading_answers (attempt_id, user_id, passage_id, question_id, user_answer, is_correct, time_spent)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [resultId, studentId, passageId, answer.questionId, answer.userAnswer, answer.isCorrect, normalized[index].timeSpent]
            );
        }
        await connection.query('COMMIT');
        return {
            resultId,
            score,
            maxScore,
            totalQuestions: questions.rows.length,
            percentage: maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0,
            details
        };
    } catch (error) {
        if (began) {
            try {
                await connection.query('ROLLBACK');
            } catch (rollbackError) {
                // Discard a connection that could still have an open transaction.
                releaseError = rollbackError;
            }
        }
        throw error;
    } finally {
        connection.release(releaseError);
    }
};

// Lấy lịch sử làm bài của học viên
const getStudentResults = async (studentId, passageId = null) => {
    studentId = parseId(studentId, 'studentId');
    let query = `
        SELECT
            a.id,
            a.passage_id,
            rp.title,
            rp.topic,
            rp.difficulty,
            a.total_score,
            a.max_score,
            a.total_questions,
            CASE WHEN a.max_score > 0 THEN ROUND(100.0 * a.total_score / a.max_score, 2) ELSE 0 END AS percentage,
            COUNT(ra.id) AS total_answered,
            COUNT(ra.id) FILTER (WHERE ra.is_correct) AS correct_count,
            a.submitted_at AS last_attempt
        FROM reading_attempts a
        INNER JOIN reading_passages rp ON a.passage_id = rp.id
        LEFT JOIN reading_answers ra ON ra.attempt_id = a.id
        WHERE a.user_id = $1
    `;
    const params = [studentId];

    if (passageId !== null && passageId !== undefined) {
        query += ' AND a.passage_id = $2';
        params.push(parseId(passageId, 'passageId'));
    }

    query += ' GROUP BY a.id, rp.title, rp.topic, rp.difficulty ORDER BY a.submitted_at DESC, a.id DESC';

    const result = await client.query(query, params);
    return result;
};

// Lấy chi tiết kết quả một lần làm bài
const getResultDetail = async (resultId, studentId) => {
    resultId = parseId(resultId, 'resultId');
    studentId = parseId(studentId, 'studentId');
    const attempt = await client.query(
        `SELECT id, passage_id, user_id, total_score, max_score, total_questions, submitted_at,
                CASE WHEN max_score > 0 THEN ROUND(100.0 * total_score / max_score, 2) ELSE 0 END AS percentage
         FROM reading_attempts WHERE id = $1 AND user_id = $2`,
        [resultId, studentId]
    );
    if (!attempt.rows.length) return null;

    const answersResult = await client.query(
        `SELECT 
            ra.*,
            rq.question_text,
            rq.question_type,
            rq.correct_answer,
            rq.explanation,
            rq.points
         FROM reading_answers ra
         INNER JOIN reading_questions rq ON ra.question_id = rq.id
         WHERE ra.attempt_id = $1 AND ra.user_id = $2
         ORDER BY rq.order_number, ra.id`,
        [resultId, studentId]
    );

    return {
        result: attempt.rows[0],
        details: answersResult.rows
    };
};

module.exports = {
    getAllPassages,
    getPassageById,
    submitReading,
    getStudentResults,
    getResultDetail
};
