import { prisma } from '../models/prisma.js';
import fs from 'fs';
import path from 'path';

export const eliminarFoto = async (fotoId) => {
    const foto = await prisma.fotos.findUnique({ where: { id: Number(fotoId) } });
    if (!foto) throw new Error("Foto no encontrada");

    if (fs.existsSync(foto.path)) {
        fs.unlinkSync(foto.path);
    }

    return await prisma.fotos.delete({ where: { id: Number(fotoId) } });
};

export const agregarFoto = async (equipoId, file) => {
    return await prisma.fotos.create({
    data: {
        content_type: file.mimetype,
        original_name: file.originalname,
        path: file.path,
        equipo_id: Number(equipoId)
    }
    });
};

export const obtenerFotosPorEquipo = async (equipoId) => {
    return await prisma.fotos.findMany({
    where: { equipo_id: Number(equipoId) }
    });
};