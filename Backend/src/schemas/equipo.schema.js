import { z } from 'zod';

export const createEquipoSchema = z.object({
    diagnostico: z.string().max(255, "Máximo 255 caracteres").optional(),
    marca: z.string().max(255, "Máximo 255 caracteres").optional(),
    modelo: z.string().max(255, "Máximo 255 caracteres").optional(),
    nro_serie: z.string().max(255, "Máximo 255 caracteres").optional(),
    costo: z.number().nonnegative("El costo no puede ser negativo").optional(),
    reparacion: z.string().optional(),
    nro_condensador: z.string().max(255, "Máximo 255 caracteres").optional(),
    nro_evaporador: z.string().max(255, "Máximo 255 caracteres").optional(),
    cliente_id: z.number().int().positive("El ID del cliente debe ser válido").optional(),
    meses_garantia: z.number().int().nonnegative("Los meses de garantía no pueden ser negativos").optional(),
    estado: z.enum(["PENDIENTE", "REPARADO", "DEVUELTO"]).optional(),
});

export const updateEquipoSchema = createEquipoSchema.partial();