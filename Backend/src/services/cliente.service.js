import { prisma } from '../models/prisma.js';

export const obtenerTodos = async () => {
    return await prisma.cliente.findMany({
        orderBy: {
            id: 'desc'
        }
    });
};

export const obtenerPorId = async (id) => {
    return await prisma.cliente.findUnique({
    where: { id: Number(id) }
    });
};

export const crear = async (data) => {
    return await prisma.cliente.create({
    data
    });
};

export const actualizar = async (id, data) => {
    return await prisma.cliente.update({
    where: { id: Number(id) },
    data
    });
};

export const eliminar = async (id) => {
    return await prisma.cliente.delete({
    where: { id: Number(id) }
    });
};