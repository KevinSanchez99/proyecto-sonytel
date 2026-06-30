import cron from 'node-cron';
import fs from 'fs';
import { prisma } from '../models/prisma.js';

export const iniciarLimpiezaAutomatica = () => {

    // eliminar equipos con más de 3 años
    // Se ejecuta todos los días a las 12pm
    cron.schedule('0 0 * * *', async () => {
        console.log('--- [Limpieza] Iniciando eliminación de registros antiguos ---');

        try {
            const fechaLimite = new Date();
            fechaLimite.setFullYear(fechaLimite.getFullYear() - 3);

            const equiposAntiguos = await prisma.equipo.findMany({
                where: { fecha_ingreso: { lt: fechaLimite } },
                select: {
                    id: true,
                    fotos: { select: { path: true } } 
                }
            });

            if (equiposAntiguos.length === 0) {
                console.log('[Limpieza] No hay equipos para limpiar.');
                return;
            }

            const equipoIds   = equiposAntiguos.map(e => e.id);
            const rutasArchivos = equiposAntiguos.flatMap(e => e.fotos.map(f => f.path));

            await prisma.$transaction(async (tx) => {
                await tx.fotos.deleteMany({
                    where: { equipo_id: { in: equipoIds } }
                });

                await tx.equipo.deleteMany({
                    where: { id: { in: equipoIds } }
                });

                await tx.cliente.deleteMany({
                    where: { equipos: { none: {} } }
                });
            });

            console.log(`[Limpieza] DB: ${equiposAntiguos.length} equipo(s) y registros asociados eliminados.`);

            let eliminados = 0;
            let errores = 0;

            for (const ruta of rutasArchivos) {
                try {
                    if (fs.existsSync(ruta)) {
                        fs.unlinkSync(ruta);
                        eliminados++;
                    }
                } catch (err) {
                    errores++;
                    console.error(`[Limpieza] Error al borrar archivo: ${ruta}`, err);
                }
            }

            console.log(`[Limpieza] Archivos físicos: ${eliminados} eliminados, ${errores} errores.`);
            console.log('--- [Limpieza] Tarea finalizada ---');

        } catch (error) {
            console.error('[Limpieza] Error durante la ejecución:', error);
        }
    });

};
