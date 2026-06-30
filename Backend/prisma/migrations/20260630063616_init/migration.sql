-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "dni_cuit" VARCHAR(255),
    "direccion" VARCHAR(255),
    "nombre_completo" VARCHAR(255),
    "telefono" VARCHAR(255),
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipo" (
    "id" SERIAL NOT NULL,
    "diagnostico" VARCHAR(255),
    "fecha_ingreso" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "marca" VARCHAR(255),
    "modelo" VARCHAR(255),
    "nro_serie" VARCHAR(255),
    "costo" DECIMAL(10,2),
    "reparacion" TEXT,
    "nro_condensador" VARCHAR(255),
    "nro_evaporador" VARCHAR(255),
    "meses_garantia" INTEGER,
    "estado" VARCHAR(50) DEFAULT 'PENDIENTE',
    "cliente_id" INTEGER,

    CONSTRAINT "equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos" (
    "id" SERIAL NOT NULL,
    "content_type" VARCHAR(255),
    "original_name" VARCHAR(255),
    "path" VARCHAR(500),
    "equipo_id" INTEGER,

    CONSTRAINT "fotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "refreshToken" TEXT,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_username_key" ON "usuario"("username");

-- AddForeignKey
ALTER TABLE "equipo" ADD CONSTRAINT "equipo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
