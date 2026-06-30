import { Router } from 'express';
import * as fotosController from '../controllers/fotos.controller.js';
import { uploadFoto } from '../middlewares/upload.middleware.js';
import { verifyToken } from '../middlewares/verifyToken.js';
const router = Router();

router.post('/equipo/:equipoId', uploadFoto.array('imagenes', 10), fotosController.upload);


router.get('/equipo/:equipoId', fotosController.getByEquipo);
router.delete('/:fotoId', fotosController.eliminar);
router.get('/ver/:nombreArchivo', verifyToken, fotosController.obtenerImagen);

export default router;