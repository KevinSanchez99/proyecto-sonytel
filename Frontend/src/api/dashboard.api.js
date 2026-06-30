import { instance } from './auth.js';

export const obtenerEstadisticasRequest = () => instance.get('/dashboard');