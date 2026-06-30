import { instance } from './auth.js';

export const obtenerFotosRequest = (equipoId) => instance.get(`/fotos/equipo/${equipoId}`);

export const subirFotoRequest = (equipoId, formData) => {
    return instance.post(`/fotos/equipo/${equipoId}`, formData);
};

export const eliminarFotoRequest = (fotoId) => instance.delete(`/fotos/${fotoId}`);