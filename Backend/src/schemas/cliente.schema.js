import { z } from 'zod';

export const createClienteSchema = z.object({
    dni_cuit: z.string().max(255, "El DNI/CUIT no puede superar los 255 caracteres").optional(),
    direccion: z.string().max(255, "La dirección no puede superar los 255 caracteres").optional(),
    nombre_completo: z.string().max(255, "El nombre no puede superar los 255 caracteres").optional(),
    telefono: z.string().max(255, "El teléfono no puede superar los 255 caracteres").optional(),
});

export const updateClienteSchema = createClienteSchema.partial();