import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { loginSchema } from '../schemas/user.schema.js';
import { loginLimiter } from '../middlewares/loginLimiter.js';

export const usuarioRoutes = Router();

usuarioRoutes.post('/login', loginLimiter, validateSchema(loginSchema), usuarioController.login);
usuarioRoutes.post('/logout', usuarioController.logout);
usuarioRoutes.post('/verify', verifyToken, usuarioController.obtainUser);
usuarioRoutes.post('/register', usuarioController.register);
usuarioRoutes.post('/refresh', usuarioController.refresh);