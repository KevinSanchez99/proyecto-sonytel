import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Search } from "lucide-react";
import { crearEquipoRequest, actualizarEquipoRequest } from "../api/equipos.api.js";
import { obtenerClientesRequest } from "../api/clientes.api.js";

const INITIAL_STATE = {
    cliente_id: "",
    marca: "",
    modelo: "",
    nro_serie: "",
    nro_condensador: "",
    nro_evaporador: "",
    diagnostico: "",
    reparacion: "",
    costo: "",
    meses_garantia: "",
    estado: "PENDIENTE",
};

const EMPTY_ARRAY = [];

export const EquipoModal = ({ isOpen, onClose, equipoEditar }) => {
    const queryClient = useQueryClient();
    
    const { data: responseClientes } = useQuery({ queryKey: ['clientes'], queryFn: obtenerClientesRequest });
    const clientes = responseClientes?.data || EMPTY_ARRAY;


    const [formData, setFormData] = useState(INITIAL_STATE);
    const [busquedaCliente, setBusquedaCliente] = useState("");
    const [mostrarDropdown, setMostrarDropdown] = useState(false);

    useEffect(() => {
        if (equipoEditar) {
            setFormData({
                ...equipoEditar,
                cliente_id: equipoEditar.cliente_id || "",
                costo: equipoEditar.costo ? Number(equipoEditar.costo) : "",
                meses_garantia: equipoEditar.meses_garantia ?? "",
                estado: equipoEditar.estado || "PENDIENTE",
            });

            const cliente = clientes.find(
                (c) => c.id === equipoEditar.cliente_id
            );

            if (cliente) {
                setBusquedaCliente(
                    `${cliente.nombre_completo} (DNI: ${
                        cliente.dni_cuit || "S/N"
                    })`
                );
            }
        } else {
            setFormData(INITIAL_STATE);
            setBusquedaCliente("");
            setMostrarDropdown(false);
        }
    }, [equipoEditar, isOpen, clientes]);
    const crearMutacion = useMutation({
        mutationFn: crearEquipoRequest,
        onSuccess: () => { queryClient.invalidateQueries(['equipos']); onClose(); }
    });

    const editarMutacion = useMutation({
        mutationFn: ({ id, data }) => actualizarEquipoRequest(id, data),
        onSuccess: () => { queryClient.invalidateQueries(['equipos']); onClose(); }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.cliente_id) {
            alert("Por favor, seleccione un cliente de la lista desplegable.");
            return;
        }

        const payload = { 
            ...formData, 
            cliente_id: Number(formData.cliente_id),
            costo: formData.costo ? Number(formData.costo) : 0,
            meses_garantia: formData.meses_garantia !== "" ? Number(formData.meses_garantia) : 0
        };

        if (equipoEditar) {
            editarMutacion.mutate({ id: equipoEditar.id, data: payload });
        } else {
            crearMutacion.mutate(payload);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const clientesFiltrados = clientes.filter(c => 
        c.nombre_completo.toLowerCase().includes(busquedaCliente.toLowerCase()) || 
        (c.dni_cuit && c.dni_cuit.includes(busquedaCliente))
    );

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4 overflow-y-auto transition-colors"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-4 md:p-6 shadow-xl border border-transparent dark:border-gray-800 transition-colors duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10 transition-colors">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{equipoEditar ? "Editar Equipo" : "Nuevo Equipo"}</h3>
                    <button onClick={onClose} type="button" className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2 relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente Dueño *</label>
                            <div className="relative">
                                {!equipoEditar && <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />}
                                <input 
                                    type="text"
                                    placeholder="Buscar por nombre o DNI..."
                                    value={busquedaCliente}
                                    onChange={(e) => {
                                        setBusquedaCliente(e.target.value);
                                        setMostrarDropdown(true);
                                        if (formData.cliente_id) setFormData({...formData, cliente_id: ""});
                                    }}
                                    onFocus={() => setMostrarDropdown(true)}
                                    onBlur={() => setTimeout(() => setMostrarDropdown(false), 200)} 
                                    disabled={!!equipoEditar}
                                    className={`w-full border rounded-xl py-2 pr-4 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors
                                        ${!equipoEditar ? 'pl-10' : 'pl-4'}
                                        ${!equipoEditar 
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700' 
                                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white cursor-not-allowed'}
                                    `}
                                />
                            </div>
                            
                            {mostrarDropdown && !equipoEditar && (
                                <ul className="absolute z-20 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-xl">
                                    {clientesFiltrados.length > 0 ? (
                                        clientesFiltrados.map(c => (
                                            <li 
                                                key={c.id} 
                                                onMouseDown={() => {
                                                    setFormData({...formData, cliente_id: c.id});
                                                    setBusquedaCliente(`${c.nombre_completo} (DNI: ${c.dni_cuit || 'S/N'})`);
                                                    setMostrarDropdown(false);
                                                }}
                                                className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer text-gray-800 dark:text-gray-200 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                                            >
                                                <span className="font-semibold">{c.nombre_completo}</span> 
                                                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({c.dni_cuit || 'Sin DNI'})</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm text-center">No se encontraron clientes.</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="flex flex-col justify-end pb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                            <select 
                                name="estado" 
                                value={formData.estado} 
                                onChange={handleChange}
                                className={`w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold transition-colors
                                    ${formData.estado === 'PENDIENTE' ? 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-500' : ''}
                                    ${formData.estado === 'REPARADO' ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-500' : ''}
                                    ${formData.estado === 'DEVUELTO' ? 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-500' : ''}
                                `}
                            >
                                <option value="PENDIENTE" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Pendiente / Revisión</option>
                                <option value="REPARADO" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Reparado Exitosamente</option>
                                <option value="DEVUELTO" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Devuelto Sin Arreglo</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca *</label>
                            <input required type="text" name="marca" value={formData.marca || ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo *</label>
                            <input required type="text" name="modelo" value={formData.modelo || ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nº Serie</label>
                            <input type="text" name="nro_serie" value={formData.nro_serie || ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nº Condensador</label>
                            <input type="text" name="nro_condensador" value={formData.nro_condensador || ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nº Evaporador</label>
                            <input type="text" name="nro_evaporador" value={formData.nro_evaporador || ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnóstico Inicial</label>
                            <textarea rows="2" name="diagnostico" value={formData.diagnostico || ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reparación Realizada</label>
                            <textarea rows="2" name="reparacion" value={formData.reparacion || ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors"></textarea>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Costo ($)</label>
                                <input type="number" step="0.01" name="costo" value={formData.costo || ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 font-bold border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block  text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meses de Garantía</label>
                                <input type="number" name="meses_garantia" min="0" placeholder="Ej: 6" value={formData.meses_garantia || ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button type="submit" disabled={crearMutacion.isPending || editarMutacion.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                            {equipoEditar ? "Guardar Cambios" : "Crear Equipo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};