# Proyecto Sonytel

Sistema de gestión para taller de reparaciones.

## 📂 Estructura del proyecto
- `/Backend`: API construida con Node.js, Express y Prisma.
- `/Frontend`: Interfaz construida con React, Vite y TanStack Query.

---

## 🚀 Cómo ejecutar el proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/KevinSanchez99/proyecto-sonytel
cd Proyecto-Sonytel
```
### 2. Configurar el Backend
```bash
cd Backend
pnpm install
```
Crea un archivo .env en la carpeta Backend con:
```bash
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/sonytel_db"
SECRET_JWT_KEY=
SALT_ROUND=
```
Luego, genera el cliente de Prisma e inicia:
```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm run dev
```
### 3. Configurar el Frontend
```bash
cd Frontend
pnpm install
pnpm run dev
```
