import jsPDF from 'jspdf';
import { instance } from '../api/auth.js';

// ─── Helpers  ────────────────────────────────────────────────────────

const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

const fetchImagenBase64 = async (filename) => {
    try {
        const { data } = await instance.get(
            `/fotos/ver/${encodeURIComponent(filename)}`,
            { responseType: 'blob' }
        );
        return await blobToBase64(data);
    } catch {
        return null;
    }
};

// ─── Generador principal ──────────────────────────────────────────────────────

export const generarPdfEquipo = async (equipo, fotos) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PW = 210;         // Ancho de página
    const PH = 297;         // Alto de página
    const ML = 15;          // Margen izquierdo/derecho
    const CW = PW - ML * 2; // Ancho de contenido = 180mm
    let y = ML;

    const now = new Date();
    const printDate = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const printTime = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const idStr = `ID #${String(equipo.id).padStart(4, '0')}`;

    // ── Guardia de página ──────────────────────────────────────────────────────
    const guard = (needed) => {
        if (y + needed > PH - 12) {
            doc.addPage();
            y = ML;
        }
    };

    // ── Separador horizontal ───────────────────────────────────────────────────
    const divider = () => {
        guard(8);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(ML, y, ML + CW, y);
        y += 5;
    };

    // ── Encabezado de sección (barra azul) ────────────────────────────────────
    const section = (label) => {
        guard(14);
        doc.setFillColor(37, 99, 235);
        doc.roundedRect(ML, y, CW, 7.5, 1.2, 1.2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(label, ML + 4, y + 5.2);
        doc.setTextColor(20, 20, 30);
        y += 11;
    };

    // ── Campo individual: etiqueta (gris pequeña) + valor debajo ──────────────
    // Devuelve la altura consumida sin avanzar y
    const drawField = (label, value, x, width) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text(label.toUpperCase(), x, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(20, 20, 30);
        const lines = doc.splitTextToSize(String(value ?? '-'), width);
        doc.text(lines, x, y + 4.5);

        return 4.5 + lines.length * 4.5;
    };

    // ── Fila de dos campos lado a lado ────────────────────────────────────────
    const fieldRow = (l1, v1, l2 = null, v2 = null, split = 0.5) => {
        const w1 = l2 ? CW * split - 4 : CW;
        const w2 = CW * (1 - split) - 4;
        const x2 = ML + CW * split + 4;

        guard(16);

        const h1 = drawField(l1, v1, ML, w1);
        const h2 = l2 ? drawField(l2, v2, x2, w2) : 0;

        y += Math.max(h1, h2) + 5;
    };

    // ── Bloque de texto largo con caja de fondo ────────────────────────────────
    const textBox = (label, value) => {
        const text = String(value ?? 'Sin datos');
        const lines = doc.splitTextToSize(text, CW - 8);
        const boxH = lines.length * 4.5 + 7;

        guard(boxH + 14);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text(label.toUpperCase(), ML, y);
        y += 4;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.roundedRect(ML, y, CW, boxH, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 30, 30);
        doc.text(lines, ML + 4, y + 5);

        y += boxH + 5;
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // ENCABEZADO
    // ═══════════════════════════════════════════════════════════════════════════

    // Barra azul superior
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, PW, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('ORDEN DE SERVICIO TECNICO', ML, 14);

    // Pastilla de ID (fondo blanco, texto azul)
    doc.setFontSize(9.5);
    const idW = doc.getTextWidth(idStr);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(PW - ML - idW - 10, 8, idW + 10, 9, 2.5, 2.5, 'F');
    doc.setTextColor(37, 99, 235);
    doc.text(idStr, PW - ML - idW - 5, 14.2);

    y = 27;

    // Fila de meta-info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Impreso: ${printDate} - ${printTime}`, ML, y);
    const ingressStr = `Ingreso: ${new Date(equipo.fecha_ingreso).toLocaleDateString('es-AR')}`;
    doc.text(ingressStr, PW - ML - doc.getTextWidth(ingressStr), y);
    y += 6;

    divider();

    // ═══════════════════════════════════════════════════════════════════════════
    // DATOS DEL CLIENTE
    // ═══════════════════════════════════════════════════════════════════════════

    section('DATOS DEL CLIENTE');
    fieldRow('Nombre Completo', equipo.cliente?.nombre_completo, 'DNI / CUIT', equipo.cliente?.dni_cuit);
    fieldRow('Telefono', equipo.cliente?.telefono, 'Direccion', equipo.cliente?.direccion);

    divider();

    // ═══════════════════════════════════════════════════════════════════════════
    // DATOS DEL EQUIPO
    // ═══════════════════════════════════════════════════════════════════════════

    section('DATOS DEL EQUIPO');
    fieldRow('Marca', equipo.marca, 'Modelo', equipo.modelo);

    const estadoLabels = {
        REPARADO: 'Reparado',
        PENDIENTE: 'En revision',
        DEVUELTO: 'Devuelto sin arreglo'
    };
    fieldRow('N. Serie', equipo.nro_serie, 'Estado', estadoLabels[equipo.estado] || equipo.estado);
    fieldRow('N. Condensador', equipo.nro_condensador, 'N. Evaporador', equipo.nro_evaporador);

    const gtiaStr = equipo.meses_garantia > 0
        ? `${equipo.meses_garantia} meses`
        : 'Sin garantia';
    fieldRow('Garantia', gtiaStr);

    divider();

    // ═══════════════════════════════════════════════════════════════════════════
    // DETALLES TÉCNICOS
    // ═══════════════════════════════════════════════════════════════════════════

    section('DETALLES TECNICOS');
    textBox('Diagnostico Inicial', equipo.diagnostico);
    textBox('Operacion Realizada', equipo.reparacion);

    // Costo — caja verde destacada
    guard(16);
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(134, 239, 172);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y, CW, 13, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(21, 128, 61);
    doc.text('COSTO TOTAL', ML + 5, y + 8.5);

    const costoStr = `$${equipo.costo ? Number(equipo.costo).toLocaleString('es-AR') : '0'}`;
    doc.setFontSize(14);
    doc.text(costoStr, PW - ML - doc.getTextWidth(costoStr) - 5, y + 9);

    y += 18;

    // ═══════════════════════════════════════════════════════════════════════════
    // FOTOS DEL EQUIPO
    // ═══════════════════════════════════════════════════════════════════════════

    if (fotos?.length > 0) {
        divider();
        section('FOTOS DEL EQUIPO');

        // Fetch todas las fotos en paralelo usando el instance autenticado
        const b64List = await Promise.all(
            fotos.map(foto => fetchImagenBase64(foto.path.split(/[\\/]/).pop()))
        );
        const validImages = b64List.filter(Boolean);

        if (validImages.length > 0) {
            const IMG_W = (CW - 5) / 2;   // ~87.5mm por columna
            const IMG_H = IMG_W * 0.72;   // ~63mm (ratio 4:3 aprox.)

            for (let i = 0; i < validImages.length; i++) {
                const col = i % 2;

                // Solo verificamos espacio al inicio de una nueva fila
                if (col === 0) {
                    guard(IMG_H + 6);
                }

                const x = ML + col * (IMG_W + 5);
                const fmt = validImages[i].startsWith('data:image/png') ? 'PNG' : 'JPEG';

                try {
                    doc.addImage(validImages[i], fmt, x, y, IMG_W, IMG_H, undefined, 'MEDIUM');
                } catch {
                    // Si la imagen falla, mostrar un placeholder
                    doc.setFillColor(241, 245, 249);
                    doc.setDrawColor(203, 213, 225);
                    doc.setLineWidth(0.3);
                    doc.roundedRect(x, y, IMG_W, IMG_H, 2, 2, 'FD');
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        'Imagen no disponible',
                        x + IMG_W / 2,
                        y + IMG_H / 2,
                        { align: 'center' }
                    );
                }

                // Avanzar y solo al completar la fila (col=1) o en la última foto
                if (col === 1 || i === validImages.length - 1) {
                    y += IMG_H + 5;
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PIE DE PÁGINA en todas las páginas
    // ═══════════════════════════════════════════════════════════════════════════

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        const fy = PH - 9;

        doc.setFillColor(248, 250, 252);
        doc.rect(0, fy - 3, PW, 15, 'F');

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(ML, fy - 3, PW - ML, fy - 3);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);

        doc.text(`Pagina ${p} de ${totalPages}`, ML, fy + 2);

        const centerText = idStr;
        doc.text(centerText, PW / 2 - doc.getTextWidth(centerText) / 2, fy + 2);

        doc.text(printDate, PW - ML - doc.getTextWidth(printDate), fy + 2);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GUARDAR
    // ═══════════════════════════════════════════════════════════════════════════

    const filename = `OS_${equipo.id}_${equipo.marca}_${equipo.modelo}`
        .replace(/\s+/g, '_')
        .replace(/[^\w_-]/g, '') + '.pdf';

    doc.save(filename);
};
