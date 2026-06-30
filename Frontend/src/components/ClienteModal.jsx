import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import {crearClienteRequest, actualizarClienteRequest } from "../api/clientes.api.js";

export const ClienteModal = ({ isOpen, onClose, clienteEditar }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ nombre_completo: "", dni_cuit: "", telefono: "", direccion: "" });

    useEffect(() => {
        if (clienteEditar) {
            setFormData(clienteEditar);
        } else {
            setFormData({ nombre_completo: "", dni_cuit: "", telefono: "", direccion: "" });
        }
    }, [clienteEditar, isOpen]);

    const crearMutacion = useMutation({
        mutationFn: crearClienteRequest,
        onSuccess: () => { queryClient.invalidateQueries(['clientes']); onClose(); }
    });

    const editarMutacion = useMutation({
        mutationFn: ({ id, data }) => actualizarClienteRequest(id, data),
        onSuccess: () => { queryClient.invalidateQueries(['clientes']); onClose(); }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (clienteEditar) {
            editarMutacion.mutate({ id: clienteEditar.id, data: formData });
        } else {
            crearMutacion.mutate(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4 transition-colors"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-4 md:p-6 shadow-xl border border-transparent dark:border-gray-800 transition-colors duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{clienteEditar ? "Editar Cliente" : "Nuevo Cliente"}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo *</label>
                        <input required type="text" value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNI / CUIT</label>
                        <input type="text" value={formData.dni_cuit || ""} onChange={e => setFormData({...formData, dni_cuit: e.target.value})} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                        <input type="text" value={formData.telefono || ""} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                        <input type="text" value={formData.direccion || ""} onChange={e => setFormData({...formData, direccion: e.target.value})} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                            {clienteEditar ? "Guardar Cambios" : "Crear Cliente"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
