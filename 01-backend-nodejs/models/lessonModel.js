const client = require('../db');

const findLessons = async () => {
    const result = await client.query(
        `SELECT id, name, type, image, description, difficulty
         FROM lesson
         WHERE is_active = true
         ORDER BY id`
    );

    return result;
}

module.exports = {
    findLessons
}
