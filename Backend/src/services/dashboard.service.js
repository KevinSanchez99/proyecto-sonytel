import { prisma } from '../models/prisma.js';

export const obtenerEstadisticas = async () => {
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    // --- CLIENTES ---
    const clientesTotales = await prisma.cliente.count();
    const clientesNuevosMes = await prisma.cliente.count({
        where: { fecha_creacion: { gte: inicioMes } }
    });

    // --- EQUIPOS Y ESTADOS ---
    const equiposTotales = await prisma.equipo.count();
    const equiposMes = await prisma.equipo.count({ where: { fecha_ingreso: { gte: inicioMes } } });

    const reparadosTotales = await prisma.equipo.count({ where: { estado: 'REPARADO' } });
    const devueltosTotales = await prisma.equipo.count({ where: { estado: 'DEVUELTO' } });
    const pendientesTotales = await prisma.equipo.count({ where: { estado: 'PENDIENTE' } });

    const reparadosMes = await prisma.equipo.count({ where: { estado: 'REPARADO', fecha_ingreso: { gte: inicioMes } } });
    const pendientesMes = await prisma.equipo.count({ where: { estado: 'PENDIENTE', fecha_ingreso: { gte: inicioMes } } });
    const devueltosMes = await prisma.equipo.count({ where: { estado: 'DEVUELTO', fecha_ingreso: { gte: inicioMes } } });

    // --- ESTANCADOS  ---
    const equiposEstancados = await prisma.equipo.count({
        where: { estado: 'PENDIENTE', fecha_ingreso: { lt: hace30Dias } }
    });

    // --- TASA DE ÉXITO ---
    //  Histórica
    const salidosTotales = reparadosTotales + devueltosTotales;
    const tasaExitoHistorica = salidosTotales > 0 ? Math.round((reparadosTotales / salidosTotales) * 100) : 0;
    
    //  Del Mes
    const salidosMes = reparadosMes + devueltosMes;
    const tasaExitoMes = salidosMes > 0 ? Math.round((reparadosMes / salidosMes) * 100) : 0;

    // --- TOP MARCAS REPARADAS ---
    const topMarcas = await prisma.equipo.groupBy({
        by: ['marca'],
        where: { estado: 'REPARADO', marca: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 3
    });

    // --- FINANZAS ---
    const gananciasAgrupadasTotales = await prisma.equipo.aggregate({ _sum: { costo: true } });
    const gananciasAgrupadasMes = await prisma.equipo.aggregate({ _sum: { costo: true }, where: { fecha_ingreso: { gte: inicioMes } } });

    const gananciasTotales = Number(gananciasAgrupadasTotales._sum.costo || 0);
    const gananciasMes = Number(gananciasAgrupadasMes._sum.costo || 0);

    // --- ÚLTIMOS INGRESOS ---
    const ultimosEquipos = await prisma.equipo.findMany({
        take: 5,
        orderBy: { fecha_ingreso: 'desc' },
        include: { cliente: true }
    });

    return {
        clientes: { totales: clientesTotales, nuevosMes: clientesNuevosMes },
        equipos: { 
            totales: equiposTotales, 
            delMes: equiposMes, 
            reparadosTotales, 
            pendientesTotales, 
            devueltosTotales, 
            reparadosMes, 
            pendientesMes, 
            devueltosMes, 
            estancados: equiposEstancados 
        },
        tasaExito: {
            historica: tasaExitoHistorica,
            delMes: tasaExitoMes
        },
        topMarcas: topMarcas.map(m => ({ marca: m.marca, cantidad: m._count.id })),
        finanzas: { gananciasTotales, gananciasMes },
        ultimosEquipos
    };
};