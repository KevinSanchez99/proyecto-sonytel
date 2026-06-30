import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/equipos';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, uploadDir); // Guardar en la carpeta uploads/equipos
    },
    filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

export const uploadFoto = multer({
    storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5 MB por imagen
    fileFilter: (req, file, cb) => {
    // Validar formato
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Formato no válido. Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
});