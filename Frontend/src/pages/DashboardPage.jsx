import { useQuery } from "@tanstack/react-query";
import { Wrench, CheckCircle, Clock, DollarSign, Users, Activity, AlertTriangle, TrendingUp} from "lucide-react";
import { obtenerEstadisticasRequest } from "../api/dashboard.api";
import { StatCard } from "../components/StatCard";

export const DashboardPage = () => {
    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: obtenerEstadisticasRequest
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando panel...</div>;
    if (isError) return <div className="p-8 text-center text-red-500 dark:text-red-400">Error al cargar las estadísticas.</div>;

    const stats = response?.data;

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <Activity className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panel Principal</h1>
            </div>

            {/* Fila 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Ganancias del Mes" 
                    value={`$${stats.finanzas.gananciasMes.toLocaleString('es-AR')}`} 
                    subtitle={`Total histórico: $${stats.finanzas.gananciasTotales.toLocaleString('es-AR')}`}
                    icon={DollarSign} 
                    colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                />
                <StatCard 
                    title="Tasa de Éxito (Mes)" 
                    value={`${stats.tasaExito.delMes}%`} 
                    subtitle={`Histórica: ${stats.tasaExito.historica}%`}
                    icon={TrendingUp} 
                    colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                />    
                <StatCard 
                    title="Equipos Ingresados (Mes)" 
                    value={stats.equipos.delMes} 
                    subtitle={`Total histórico: ${stats.equipos.totales}`}
                    icon={Wrench} 
                    colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                />
                <StatCard 
                    title="Clientes Nuevos (Mes)" 
                    value={stats.clientes.nuevosMes} 
                    subtitle={`Total base de datos: ${stats.clientes.totales}`}
                    icon={Users} 
                    colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
                />
            </div>

            {/* Fila 2 */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white pt-4">Operaciones y Alertas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Reparados este Mes" 
                    value={stats.equipos.reparadosMes} 
                    icon={CheckCircle} 
                    colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                />
                <StatCard 
                    title="Pendientes Actuales" 
                    value={stats.equipos.pendientesTotales}
                    icon={Clock} 
                    colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" 
                />
                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 shadow-sm border border-red-100 dark:border-red-900/30 flex items-start justify-between transition-colors duration-200">
                    <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Equipos Estancados (+30 días)</p>
                        <h4 className="text-3xl font-bold text-red-800 dark:text-red-300">{stats.equipos.estancados}</h4>
                        <p className="text-xs text-red-600 dark:text-red-500 mt-2">Requieren atención inmediata</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Columna 1 */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors duration-200">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Top Marcas Reparadas
                    </h3>
                    <div className="space-y-4">
                        {stats.topMarcas.length > 0 ? (
                            stats.topMarcas.map((marca, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-2">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{i + 1}. {marca.marca || 'S/N'}</span>
                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">{marca.cantidad} rep.</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No hay datos suficientes.</p>
                        )}
                    </div>
                </div>

                {/* Columna 2 */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-200">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                        <h3 className="font-bold text-gray-800 dark:text-white">Últimos 5 Equipos Ingresados</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                    <th className="p-4 font-medium">Fecha</th>
                                    <th className="p-4 font-medium">Cliente</th>
                                    <th className="p-4 font-medium">Equipo</th>
                                    <th className="p-4 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.ultimosEquipos.map(equipo => (
                                    <tr key={equipo.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-gray-600 dark:text-gray-300 text-sm">{new Date(equipo.fecha_ingreso).toLocaleDateString('es-AR')}</td>
                                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200 text-sm">{equipo.cliente?.nombre_completo || 'N/A'}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300 text-sm"><span className="font-semibold dark:text-white">{equipo.marca}</span> {equipo.modelo}</td>
                                        <td className="p-4">
                                            {equipo.estado === 'REPARADO' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Reparado</span>}
                                            {equipo.estado === 'PENDIENTE' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pendiente</span>}
                                            {equipo.estado === 'DEVUELTO' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Devuelto</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};