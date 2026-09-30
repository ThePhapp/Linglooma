const { updateUser, findUserByEmail, findUserByName } = require('../models/userModel');
const { isBody, isValidPassword, hashPassword, comparePassword } = require('./authController');
const { normalizeEmail } = require('../middleware/jwtauth');

const updateUserController = async (req, res) => {
    const email = normalizeEmail(req.user?.email);
    if (!email || !Number.isSafeInteger(req.user?.id) || req.user.id <= 0) {
        return res.status(401).json({ message: 'Invalid authentication token' });
    }
    const invalid = () => res.status(400).json({ message: 'Invalid account details' });
    if (!isBody(req.body)) return invalid();
    const body = req.body;
    // Empty strings remain no-ops for the existing settings form; malformed types never do.
    const limits = { username: 100, gender: 50, nationality: 50, phoneNumber: 11, phonenumber: 11 };
    for (const [field, limit] of Object.entries(limits)) {
        if (Object.hasOwn(body, field) && (typeof body[field] !== 'string' || body[field].length > limit || /[\x00-\x1f\x7f]/.test(body[field]))) return invalid();
    }
    for (const field of ['password', 'currentPassword']) {
        if (Object.hasOwn(body, field) && (typeof body[field] !== 'string' || body[field].length > 256 || [...body[field]].length > 128)) return invalid();
    }
    if (body.password && (!isValidPassword(body.password) || !body.currentPassword)) return invalid();
    if (Object.hasOwn(body, 'phoneNumber') && Object.hasOwn(body, 'phonenumber') && body.phoneNumber !== body.phonenumber) return invalid();
    const phone = body.phoneNumber ?? body.phonenumber;
    if (phone?.trim() && !/^\+?[0-9]{1,11}$/.test(phone.trim())) return invalid();
    try {
        const userResult = await findUserByEmail(email);
        if (!userResult.rows.length) return res.status(404).json({ message: 'User not found' });
        const currentUser = userResult.rows[0];
        if (currentUser.id !== req.user.id) {
            return res.status(401).json({ message: 'Invalid authentication token' });
        }
        const username = body.username?.trim() || currentUser.username;
        if (username !== currentUser.username) {
            const candidates = await findUserByName(username);
            if (candidates.rows.some(candidate => normalizeEmail(candidate.email) !== email)) {
                return res.status(400).json({ message: 'Username already existed' });
            }
        }
        let password = currentUser.password;
        if (body.password) {
            if (!await comparePassword(body.currentPassword, currentUser.password)) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
            password = await hashPassword(body.password);
        }
        await updateUser(email, username, password, body.gender?.trim() || currentUser.gender,
            body.nationality?.trim() || currentUser.nationality, phone?.trim() || currentUser.phonenumber);
        return res.status(200).json({ message: 'Cập nhật thành công', success: true });
    } catch (err) {
        if (err?.code === '23505') return res.status(400).json({ message: 'Username already existed' });
        return res.status(500).json({ message: 'Error updating data' });
    }
};

const getAccountController = async (req, res) => {
    if (!normalizeEmail(req.user?.email) || !Number.isSafeInteger(req.user?.id) || req.user.id <= 0) {
        return res.status(401).json({ message: 'Invalid authentication token' });
    }
    return res.status(200).json(req.user);
};

module.exports = { updateUserController, getAccountController };
