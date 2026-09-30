const { findLessons } = require('../models/lessonModel');

const getAllLessonsController = async (req, res) => {
    try {
        const result = await findLessons();
        res.status(200).json(result.rows);
    } catch {
        return res.status(500).json({ message: 'Unable to retrieve lessons' });
    }
};
module.exports = {
    getAllLessonsController
};
