import { instance } from './auth.js';

export const obtenerClientesRequest = () => instance.get('/clientes');
export const crearClienteRequest = (cliente) => instance.post('/clientes', cliente);
export const actualizarClienteRequest = (id, cliente) => instance.put(`/clientes/${id}`, cliente);
export const eliminarClienteRequest = (id) => instance.delete(`/clientes/${id}`);