import { prisma } from '../models/prisma.js';
import bcrypt from 'bcrypt';

const SALT_ROUND = Number(process.env.SALT_ROUND) || 10; 

export const login = async ({ username, password }) => {
    const user = await prisma.usuario.findUnique({ where: { username } });

    if (!user) throw new Error("Usuario o contraseña incorrectos");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Usuario o contraseña incorrectos");

    return user;
};

export const register = async ({ username, password }) => {
    const existingUsername = await prisma.usuario.findUnique({ where: { username } });

    if (existingUsername) throw new Error(`El username ${username} ya existe`);

    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

    return await prisma.usuario.create({
    data: {
        username,
        password: hashedPassword
    }
    });
};

export const obtenerPorId = async (id) => {
    const user = await prisma.usuario.findUnique({ where: { id: Number(id) } });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
};

export const guardarRefreshToken = async (id, refreshToken) => {
    return await prisma.usuario.update({
        where: { id: Number(id) },
        data: { refreshToken }
    });
};

export const eliminarRefreshToken = async (id) => {
    return await prisma.usuario.update({
        where: { id: Number(id) },
        data: { refreshToken: null }
    });
};