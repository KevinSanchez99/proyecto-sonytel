import jwt from 'jsonwebtoken';

export const createAccessToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.SECRET_JWT_KEY, { expiresIn: '15m' }, (err, token) => {
            if (err) reject(err);
            resolve(token);
        });
    });
};

export const createRefreshToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.SECRET_JWT_KEY, { expiresIn: '7d' }, (err, token) => {
            if (err) reject(err);
            resolve(token);
        });
    });
};