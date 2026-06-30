import {z} from "zod";

export const loginSchema = z.object({
    username: z.string({
        required_error: "El username debe ser un string",
    }),
    password: z.string({
        required_error: "El password es requerido",
    }).min(6,{
        message: "La contraseña debe ser de al menos 6 caracteres",
    }).max(50),
});
