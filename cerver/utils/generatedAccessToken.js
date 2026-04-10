import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generatedAccessToken = (id, role = 'USER') => {
    return jwt.sign({ id, role }, process.env.SECRET_KEY_ACCESS_TOKEN, {
        expiresIn: '1d', // 1 day
    });
};

export default generatedAccessToken;
