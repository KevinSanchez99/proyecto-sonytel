import * as equipoService from '../services/equipo.service.js';

export const getAll = async (req, res) => {
    const equipos = await equipoService.obtenerTodos();
    res.json(equipos);
};

export const getById = async (req, res) => {
    const { id } = req.params;
    const equipo = await equipoService.obtenerPorId(id);

    if (!equipo) {
    return res.status(404).json({ message: 'Equipo no encontrado' });
    }

    res.json(equipo);
};

export const create = async (req, res) => {
    const nuevoEquipo = await equipoService.crear(req.body);
    res.status(201).json(nuevoEquipo);
};

export const update = async (req, res) => {
    const { id } = req.params;
    const equipoActualizado = await equipoService.actualizar(id, req.body);
    res.json(equipoActualizado);
};

export const remove = async (req, res) => {
    const { id } = req.params;
    await equipoService.eliminar(id);
    res.status(204).send();
};