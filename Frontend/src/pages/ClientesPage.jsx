import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { obtenerClientesRequest, eliminarClienteRequest } from "../api/clientes.api.js";
import { ClienteModal } from "../components/ClienteModal.jsx";

const EMPTY_ARRAY = [];

export const ClientesPage = () => {
    const queryClient = useQueryClient();
    const [busqueda, setBusqueda] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clienteAEditar, setClienteAEditar] = useState(null);

    const { data: response, isLoading, isError } = useQuery({ queryKey: ['clientes'], queryFn: obtenerClientesRequest });
    const clientes = response?.data || EMPTY_ARRAY;

    const eliminarMutacion = useMutation({
        mutationFn: eliminarClienteRequest,
        onSuccess: () => {
            queryClient.invalidateQueries(['clientes']);
        },
        onError: (error) => {
            const mensajeError = error.response?.data?.message || "Ocurrió un error al intentar eliminar el cliente.";
            
            window.alert(mensajeError);
        }
    });

    const handleEliminar = (id) => {
        if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
            eliminarMutacion.mutate(id);
        }
    };

    const abrirModalNuevo = () => { setClienteAEditar(null); setIsModalOpen(true); };
    const abrirModalEditar = (cliente) => { setClienteAEditar(cliente); setIsModalOpen(true); };

    const clientesFiltrados = useMemo(() => {
        if (!busqueda) return clientes;
        return clientes.filter(c => c.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) || (c.dni_cuit && c.dni_cuit.includes(busqueda)));
    }, [clientes, busqueda]);

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando clientes...</div>;
    if (isError) return <div className="p-8 text-center text-red-500 dark:text-red-400">Error al cargar los clientes.</div>;

    return (
        <div className="max-w-6xl mx-auto pb-10 px-4 md:px-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Clientes</h1>
                <button onClick={abrirModalNuevo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-colors flex items-center gap-2">
                    <Plus className="w-7 h-7" />
                </button>
            </div>

            {/* Buscador */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mb-4 transition-colors duration-200">
                <div className="p-4 relative">
                    <Search className="absolute left-7 top-7 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Buscar por nombre o DNI..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors" />
                </div>
            </div>

            {/* Tabla — solo desktop */}
            <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden overflow-x-auto transition-colors duration-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-800">
                            <th className="p-4 font-semibold">Nombre Completo</th>
                            <th className="p-4 font-semibold">DNI / CUIT</th>
                            <th className="p-4 font-semibold">Teléfono</th>
                            <th className="p-4 font-semibold">Dirección</th>
                            <th className="p-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesFiltrados.map((cliente) => (
                            <tr key={cliente.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{cliente.nombre_completo}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-400">{cliente.dni_cuit || '-'}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-400">{cliente.telefono || '-'}</td>
                                <td className="p-4 text-gray-600 dark:text-gray-400">{cliente.direccion || '-'}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => abrirModalEditar(cliente)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleEliminar(cliente.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tarjetas — solo mobile */}
            <div className="md:hidden space-y-3">
                {clientesFiltrados.length > 0 ? (
                    clientesFiltrados.map((cliente) => (
                        <div key={cliente.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-200">
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{cliente.nombre_completo}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">DNI/CUIT: {cliente.dni_cuit || '-'}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => abrirModalEditar(cliente)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleEliminar(cliente.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">Teléfono</span>
                                    <p className="text-gray-700 dark:text-gray-300 mt-0.5">{cliente.telefono || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">Dirección</span>
                                    <p className="text-gray-700 dark:text-gray-300 mt-0.5">{cliente.direccion || '-'}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        No se encontraron clientes.
                    </div>
                )}
            </div>

            <ClienteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} clienteEditar={clienteAEditar} />
        </div>
    );
};