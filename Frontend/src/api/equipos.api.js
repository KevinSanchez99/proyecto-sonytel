import { instance } from './auth.js';

export const obtenerEquiposRequest = () => instance.get('/equipos');
export const crearEquipoRequest = (equipo) => instance.post('/equipos', equipo);
export const actualizarEquipoRequest = (id, equipo) => instance.put(`/equipos/${id}`, equipo);
export const eliminarEquipoRequest = (id) => instance.delete(`/equipos/${id}`);