import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit, Trash2, Eye, FileDown, Loader2, ChevronDown } from "lucide-react";
import { obtenerEquiposRequest, eliminarEquipoRequest } from "../api/equipos.api.js";
import { obtenerFotosRequest } from "../api/fotos.api.js";
import { generarPdfEquipo } from "../utils/generarPdfEquipo.js";
import { EquipoModal } from "../components/EquipoModal";
import { EquipoDetallePanel } from "../components/EquipoDetallePanel";

const EMPTY_ARRAY = [];

export const EquiposPage = () => {
    const queryClient = useQueryClient();
    
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos"); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [equipoAEditar, setEquipoAEditar] = useState(null);
    const [equipoViendo, setEquipoViendo] = useState(null);
    const [generandoPdfId, setGenerandoPdfId] = useState(null);

    const { data: response, isLoading, isError } = useQuery({ 
        queryKey: ['equipos'], 
        queryFn: obtenerEquiposRequest 
    });
    
    const equipos = response?.data || EMPTY_ARRAY;

    const eliminarMutacion = useMutation({
        mutationFn: eliminarEquipoRequest,
        onSuccess: () => queryClient.invalidateQueries(['equipos'])
    });

    const handleEliminar = (id) => {
        if (window.confirm("¿Estás seguro de eliminar este equipo? Se borrarán sus fotos asociadas.")) {
            eliminarMutacion.mutate(id);
        }
    };

    const abrirModalNuevo = () => { setEquipoAEditar(null); setIsModalOpen(true); };
    const abrirModalEditar = (equipo) => { setEquipoAEditar(equipo); setIsModalOpen(true); };
    const abrirPanelDetalle = (equipo) => { setEquipoViendo(equipo); };

    const handleDescargarPdf = async (equipo) => {
        if (generandoPdfId) return; 
        setGenerandoPdfId(equipo.id);
        try {
            const responseFotos = await obtenerFotosRequest(equipo.id);
            const fotos = responseFotos?.data || [];
            await generarPdfEquipo(equipo, fotos);
        } catch (error) {
            alert("Error al generar el PDF. Intentá de nuevo: ", error);
        } finally {
            setGenerandoPdfId(null);
        }
    };

    const equiposFiltrados = useMemo(() => {
        let filtrados = equipos;
        if (filtroEstado !== "todos") {
            filtrados = filtrados.filter(e => e.estado === filtroEstado.toUpperCase());
        }
        if (busqueda) {
            const b = busqueda.toLowerCase();
            filtrados = filtrados.filter(e => 
                e.marca?.toLowerCase().includes(b) || 
                e.modelo?.toLowerCase().includes(b) ||
                e.cliente?.nombre_completo?.toLowerCase().includes(b) ||
                e.cliente?.dni_cuit?.includes(b) 
            );
        }
        return filtrados;
    }, [equipos, busqueda, filtroEstado]);

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando equipos...</div>;
    if (isError) return <div className="p-8 text-center text-red-500 dark:text-red-400">Error al cargar los equipos.</div>;

    return (
        <div className="max-w-7xl mx-auto pb-10 px-4 md:px-0 relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Equipos</h1>
                <button onClick={abrirModalNuevo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-colors flex items-center gap-2">
                    <Plus className="w-7 h-7" />
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative transition-colors duration-200">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente, DNI, marca o modelo..." 
                        value={busqueda} 
                        onChange={(e) => setBusqueda(e.target.value)} 
                        className="w-full bg-transparent text-gray-900 dark:text-white pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none" 
                    />
                </div>
                
                <div className="md:w-64 relative">
                    <select 
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 pl-4 pr-10 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium transition-colors duration-200"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="pendiente">Solo Pendientes</option>
                        <option value="reparado">Solo Reparados</option>
                        <option value="devuelto">Solo Devueltos</option>
                    </select>
                    
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 dark:text-gray-400">
                        <ChevronDown className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden overflow-x-auto transition-colors duration-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-800">
                            <th className="p-4 font-semibold">Fecha Ingreso</th>
                            <th className="p-4 font-semibold">Cliente</th>
                            <th className="p-4 font-semibold">Marca y Modelo</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold">Costo</th>
                            <th className="p-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equiposFiltrados.length > 0 ? (
                            equiposFiltrados.map((equipo) => (
                                <tr key={equipo.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 text-gray-600 dark:text-gray-400">
                                        {new Date(equipo.fecha_ingreso).toLocaleDateString('es-AR')}
                                    </td>
                                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                                        {equipo.cliente?.nombre_completo || 'Sin cliente'}
                                        <div className="text-xs text-gray-500 dark:text-gray-500 font-normal">DNI: {equipo.cliente?.dni_cuit || 'S/N'}</div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold dark:text-white">{equipo.marca}</span> {equipo.modelo}
                                    </td>
                                    <td className="p-4">
                                        {equipo.estado === 'REPARADO' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Reparado</span>}
                                        {equipo.estado === 'PENDIENTE' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pendiente</span>}
                                        {equipo.estado === 'DEVUELTO' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Devuelto</span>}
                                    </td>
                                    <td className="p-4 text-green-600 dark:text-green-400 font-semibold">
                                        ${equipo.costo ? Number(equipo.costo).toLocaleString('es-AR') : '0'}
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => abrirPanelDetalle(equipo)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Ver detalles"><Eye className="w-4 h-4" /></button>
                                        <button onClick={() => abrirModalEditar(equipo)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                                        <button 
                                            onClick={() => handleDescargarPdf(equipo)} 
                                            disabled={!!generandoPdfId}
                                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-40" 
                                            title="Descargar PDF"
                                        >
                                            {generandoPdfId === equipo.id 
                                                ? <Loader2 className="w-4 h-4 animate-spin" /> 
                                                : <FileDown className="w-4 h-4" />
                                            }
                                        </button>
                                        <button onClick={() => handleEliminar(equipo.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">No se encontraron equipos que coincidan con la búsqueda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Tarjetas — solo mobile */}
            <div className="md:hidden space-y-3">
                {equiposFiltrados.length > 0 ? (
                    equiposFiltrados.map((equipo) => (
                        <div key={equipo.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-200">
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-800 dark:text-gray-200">
                                        <span className="dark:text-white">{equipo.marca}</span> {equipo.modelo}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                                        {equipo.cliente?.nombre_completo || 'Sin cliente'}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">DNI: {equipo.cliente?.dni_cuit || 'S/N'}</p>
                                </div>
                                <div className="shrink-0">
                                    {equipo.estado === 'REPARADO' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Reparado</span>}
                                    {equipo.estado === 'PENDIENTE' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pendiente</span>}
                                    {equipo.estado === 'DEVUELTO' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Devuelto</span>}
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide block">Ingreso</span>
                                        <span className="text-gray-600 dark:text-gray-300">{new Date(equipo.fecha_ingreso).toLocaleDateString('es-AR')}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide block">Costo</span>
                                        <span className="text-green-600 dark:text-green-400 font-semibold">${equipo.costo ? Number(equipo.costo).toLocaleString('es-AR') : '0'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => abrirPanelDetalle(equipo)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Ver detalles"><Eye className="w-4 h-4" /></button>
                                    <button onClick={() => abrirModalEditar(equipo)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                                    <button 
                                        onClick={() => handleDescargarPdf(equipo)} 
                                        disabled={!!generandoPdfId}
                                        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-40" 
                                        title="Descargar PDF"
                                    >
                                        {generandoPdfId === equipo.id 
                                            ? <Loader2 className="w-4 h-4 animate-spin" /> 
                                            : <FileDown className="w-4 h-4" />
                                        }
                                    </button>
                                    <button onClick={() => handleEliminar(equipo.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron equipos que coincidan con la búsqueda.
                    </div>
                )}
            </div>

            <EquipoModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                equipoEditar={equipoAEditar} 
            />
            
            <EquipoDetallePanel 
                equipo={equipoViendo} 
                onClose={() => setEquipoViendo(null)} 
            />
        </div>
    );
};