import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generatedRefreshToken = (id, role = 'USER') => {
    return jwt.sign({ id, role }, process.env.SECRET_KEY_REFRESH_TOKEN, {
        expiresIn: '7d', // 7 days
    });
};

export default generatedRefreshToken;
