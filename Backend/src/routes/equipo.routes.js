import { Router } from 'express';
import * as equipoController from '../controllers/equipo.controller.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { createEquipoSchema, updateEquipoSchema } from '../schemas/equipo.schema.js';

const router = Router();

router.get('/', equipoController.getAll);
router.get('/:id', equipoController.getById);

router.post('/', validateSchema(createEquipoSchema), equipoController.create);
router.put('/:id', validateSchema(updateEquipoSchema), equipoController.update);

router.delete('/:id', equipoController.remove);

export default router;