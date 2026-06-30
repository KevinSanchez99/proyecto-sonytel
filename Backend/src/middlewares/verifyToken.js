import jwt from 'jsonwebtoken';
import * as usuarioService from '../services/usuario.service.js';

export const verifyToken = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies; 

        if (!accessToken)
            return res.status(401).json({ message: "Autorización denegada. Inicie sesión." });

        const decoded = jwt.verify(accessToken, process.env.SECRET_JWT_KEY);
        const user = await usuarioService.obtenerPorId(decoded.id);
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};