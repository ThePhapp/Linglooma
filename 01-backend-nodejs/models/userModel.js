const client = require('../db');

const findUserByEmail = async (email) => {
    const result = await client.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
    )

    return result;
}

const insertUser = async (email, hashedPassword) => {
    await client.query(
        'INSERT INTO users (email, password) VALUES ($1, $2)',
        [email, hashedPassword]
    );
}

const updateUser = async (email, username, password, gender, nationality, phonenumber) => {
    await client.query(
        `
        UPDATE users
        SET username = $1,
            password = $2,
            gender = $3,
            nationality = $4,
            phonenumber = $5
        WHERE LOWER(email) = LOWER($6);
        `,
        [username, password, gender, nationality, phonenumber, email]
    );
};

const findUserByName = async (username) => {
    const result = await client.query(
        `
        SELECT * FROM users
        WHERE username=$1
        `,
        [username]
    );

    return result;
};

module.exports = {
    findUserByEmail,
    insertUser,
    updateUser,
    findUserByName
};
