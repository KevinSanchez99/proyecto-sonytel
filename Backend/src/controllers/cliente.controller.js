import * as clienteService from '../services/cliente.service.js';
import { Prisma } from '@prisma/client';

export const getAll = async (req, res) => {
    const clientes = await clienteService.obtenerTodos();
    res.json(clientes);
};

export const getById = async (req, res) => {
    const { id } = req.params;
    const cliente = await clienteService.obtenerPorId(id);

    if (!cliente) {
    return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(cliente);
};

export const create = async (req, res) => {
    const nuevoCliente = await clienteService.crear(req.body);
    res.status(201).json(nuevoCliente);
};

export const update = async (req, res) => {
    const { id } = req.params;
    const clienteActualizado = await clienteService.actualizar(id, req.body);
    res.json(clienteActualizado);
};

export const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await clienteService.eliminar(id);
        res.status(204).send(); 
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return res.status(409).json({ 
                    message: "No se puede eliminar el cliente porque tiene equipos asociados." 
                });
            }
        }
        
        next(error);
    }
};