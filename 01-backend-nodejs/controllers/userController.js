const { updateUser, findUserByEmail, findUserByName } = require('../models/userModel');
const bcrypt = require('bcrypt');

const updateUserController = async (req, res) => {
    const email = req.user?.email;
    const { username, password, gender, nationality, phoneNumber, currentPassword } = req.body;

    if (!email) {
        return res.status(401).json({ message: "Invalid authentication token" });
    }

    try {
        const userResult = await findUserByEmail(email);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentUser = userResult.rows[0];
        const updatedUsername = typeof username === 'string' && username.trim()
            ? username.trim()
            : currentUser.username;

        if (updatedUsername !== currentUser.username) {
            const user = await findUserByName(updatedUsername);
            const belongsToAnotherAccount = user.rows.some(
                candidate => candidate.email?.toLowerCase() !== email.toLowerCase()
            );

            if (belongsToAnotherAccount) {
                return res.status(400).json({ message: "Username already existed" });
            }
        }

        let updatedPassword = currentUser.password;
        const newPassword = typeof password === 'string' ? password.trim() : '';
        if (newPassword) {
            if (newPassword.length < 6 || newPassword.length > 128) {
                return res.status(400).json({
                    message: 'Mật khẩu mới phải có từ 6 đến 128 ký tự'
                });
            }

            if (!currentPassword) {
                return res.status(400).json({ message: 'Vui lòng nhập mật khẩu hiện tại' });
            }

            const isMatch = await bcrypt.compare(currentPassword || '', currentUser.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mật khẩu hiện tại không chính xác' });
            }

            updatedPassword = await bcrypt.hash(newPassword, 10);
        }

        const updatedGender = typeof gender === 'string' && gender.trim() ? gender.trim() : currentUser.gender;
        const updatedNationality = typeof nationality === 'string' && nationality.trim()
            ? nationality.trim()
            : currentUser.nationality;
        const updatedPhone = typeof phoneNumber === 'string' && phoneNumber.trim()
            ? phoneNumber.trim()
            : currentUser.phonenumber;

        await updateUser(
            email,
            updatedUsername,
            updatedPassword,
            updatedGender,
            updatedNationality,
            updatedPhone
        );


        return res.status(200).json({
            message: "Cập nhật thành công",
            success: true
        });
    } catch (err) {
        return res.status(500).json({ message: "Error updating data" });
    }
};

const getAccountController = async (req, res) => {
    return res.status(200).json(req.user);
};

module.exports = {
    updateUserController, getAccountController
};
