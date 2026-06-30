import { Router } from 'express';
import * as clienteController from '../controllers/cliente.controller.js';
import { validateSchema } from '../middlewares/validateSchema.js'; 
import { createClienteSchema, updateClienteSchema } from '../schemas/cliente.schema.js';

const router = Router();

router.get('/', clienteController.getAll);
router.get('/:id', clienteController.getById);

router.post('/', validateSchema(createClienteSchema), clienteController.create);
router.put('/:id', validateSchema(updateClienteSchema), clienteController.update);

router.delete('/:id', clienteController.remove);

export default router;