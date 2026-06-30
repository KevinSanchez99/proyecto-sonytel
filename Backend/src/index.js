import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clienteRoutes from './routes/cliente.routes.js';
import equipoRoutes from './routes/equipo.routes.js';
import { iniciarLimpiezaAutomatica } from './jobs/limpieza.job.js'
import fotosRoutes from './routes/fotos.routes.js';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {usuarioRoutes} from './routes/usuario.routes.js';
import { verifyToken } from './middlewares/verifyToken.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dashboardRoutes from './routes/dashboard.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir Postman o requests sin Origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares globales

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Rutas Públicas (Auth)
app.use('/api/auth', usuarioRoutes);

// Rutas Protegidas
app.use('/api/clientes', verifyToken, clienteRoutes);
app.use('/api/equipos', verifyToken, equipoRoutes);
app.use('/api/fotos', verifyToken, fotosRoutes);
app.use('/api/dashboard',verifyToken, dashboardRoutes)

// Middleware de Manejo de Errores Global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor', 
    error: err.message 
  });
});

iniciarLimpiezaAutomatica();

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
});