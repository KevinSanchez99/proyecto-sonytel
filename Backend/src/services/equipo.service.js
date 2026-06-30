import { prisma } from "../models/prisma.js";
import fs from 'fs';
import path from 'path';

const calcularMesesRestantes = (fechaIngreso, mesesGarantia) => {
    if (!mesesGarantia || mesesGarantia <= 0) return 0;
    const expiracion = new Date(fechaIngreso);
    expiracion.setMonth(expiracion.getMonth() + mesesGarantia);

    const ahora = new Date();
    if (ahora >= expiracion) return 0;

    let meses = 0;
    let cursor = new Date(ahora);
    while (cursor < expiracion) {
        cursor.setMonth(cursor.getMonth() + 1);
        meses++;
    }
    return meses;
};

export const obtenerTodos = async () => {
    const equipos = await prisma.equipo.findMany({
        include: { cliente: true, fotos: true },
        orderBy: {
            id: 'desc'
        }
    });
    return equipos.map(e => ({
        ...e,
        meses_garantia_restantes: calcularMesesRestantes(e.fecha_ingreso, e.meses_garantia)
    }));
};

export const obtenerPorId = async (id) => {
    return await prisma.equipo.findUnique({
    where: { id: Number(id) },
    include: {
        cliente: true,
        fotos: true,
    },
    });
};

export const crear = async (data) => {
    return await prisma.equipo.create({
    data,
    });
};

export const actualizar = async (id, data) => {
    const { 
        id: _, 
        cliente, 
        fotos, 
        fecha_ingreso, 
        meses_garantia_restantes,
        cliente_id,
        ...datosLimpios 
    } = data;

    if (datosLimpios.meses_garantia !== undefined && datosLimpios.meses_garantia !== null) {
        datosLimpios.meses_garantia = Number(datosLimpios.meses_garantia);
    }
    
    if (cliente_id) {
        datosLimpios.cliente = {
            connect: { id: Number(cliente_id) }
        };
    }

    return await prisma.equipo.update({
        where: { id: Number(id) },
        data: datosLimpios
    });
};

export const eliminar = async (id) => {
    const fotos = await prisma.fotos.findMany({
        where: { equipo_id: Number(id) }
    });

    for (const foto of fotos) {
        if (fs.existsSync(foto.path)) {
            try {
                fs.unlinkSync(foto.path);
            } catch (err) {
                console.error(`Error al borrar archivo físico: ${foto.path}`, err);
            }
        }
    }

    await prisma.fotos.deleteMany({
        where: { equipo_id: Number(id) }
    });

    return await prisma.equipo.delete({
        where: { id: Number(id) }
    });
};