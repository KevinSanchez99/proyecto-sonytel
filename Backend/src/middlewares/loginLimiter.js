import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos de login por IP cada 15 minutos
    message: { 
        message: "Demasiados intentos de inicio de sesión de esta IP. Por favor, intenta de nuevo en 15 minutos." 
    },
    standardHeaders: true, 
    legacyHeaders: false,  
});