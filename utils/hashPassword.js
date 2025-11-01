const bcrypt = require('bcrypt');
require('dotenv').config();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;


const hashPassword = async (password) => {
    if (!password) throw new Error('Missing password for hashing');
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
}

const comparePassword = async (password, hash) => {
    if (!password || !hash) return false;
    return bcrypt.compare(password, hash);
}

module.exports = {
    hashPassword,
    comparePassword,
};
