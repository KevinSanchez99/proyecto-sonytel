import * as usuarioService from '../services/usuario.service.js';
import { createAccessToken, createRefreshToken } from '../utils/createToken.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await usuarioService.login({ username, password });
        
        const accessToken = await createAccessToken({ id: user.id });
        const refreshToken = await createRefreshToken({ id: user.id });

        await usuarioService.guardarRefreshToken(user.id, refreshToken);

        res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(200).json({ message: "Logueado correctamente", user: { id: user.id, username: user.username } });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await usuarioService.register({ username, password });
        
        const accessToken = await createAccessToken({ id: user.id });
        const refreshToken = await createRefreshToken({ id: user.id });

        await usuarioService.guardarRefreshToken(user.id, refreshToken);

        res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(201).json({ user: { id: user.id, username: user.username } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

        const decoded = jwt.verify(refreshToken, process.env.SECRET_JWT_KEY);
        const user = await usuarioService.obtenerPorId(decoded.id);

        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = await createAccessToken({ id: user.id });
        res.cookie("accessToken", newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });

        res.status(200).json({ message: "Token renovado" });
    } catch (error) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(401).json({ message: "Refresh token expirado, vuelve a iniciar sesión" });
    }
};

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.SECRET_JWT_KEY, { ignoreExpiration: true });
            await usuarioService.eliminarRefreshToken(decoded.id);
        }
        
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Deslogueado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const obtainUser = async (req, res) => {
    const { id, username } = req.user; 
    return res.status(200).json({ id, username });
};