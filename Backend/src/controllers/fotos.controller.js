import * as fotosService from '../services/fotos.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const obtenerImagen = (req, res) => {
    const { nombreArchivo } = req.params;

    const nombreDecodificado = decodeURIComponent(nombreArchivo);
    
    const rutaCompleta = path.join(process.cwd(),'uploads', 'equipos', nombreDecodificado);
    
    
    res.sendFile(rutaCompleta, (err) => {
        if (err) {
            console.error("Archivo no encontrado en:", rutaCompleta);
            res.status(404).send("Imagen no encontrada");
        }
    });
};

export const upload = async (req, res) => {
    const { equipoId } = req.params;


    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron imágenes' });
    }

    try {
        const promesas = req.files.map(file => fotosService.agregarFoto(equipoId, file));
        const resultados = await Promise.all(promesas);
        res.status(201).json(resultados);
    } catch (error) {
        res.status(500).json({ message: "Error al subir las fotos" });
    }
};

export const getByEquipo = async (req, res) => {
    const { equipoId } = req.params;
    const fotos = await fotosService.obtenerFotosPorEquipo(equipoId);
    res.json(fotos);
};

export const eliminar = async (req, res) => {
    try {
        const { fotoId } = req.params;
        await fotosService.eliminarFoto(fotoId);
        res.status(200).json({ message: "Foto eliminada" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};