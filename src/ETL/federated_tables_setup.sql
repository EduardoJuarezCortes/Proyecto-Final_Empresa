CREATE DATABASE gestion_proyectos;
USE gestion_proyectos;

-- Cambiar 'IP_DE_GESTION' por la IP real de la maquina

-- 1. Traemos la tabla de clientes desde el otro servidor
CREATE TABLE Clientes (
    id_cliente INT PRIMARY KEY,
    nombre VARCHAR(50),
    sector VARCHAR(50),
    importancia_en_sector VARCHAR(20),
    pais VARCHAR(50)
) 
ENGINE=FEDERATED 
CONNECTION='mysql://yuri:1234@IP_DE_GESTION:3306/Gestion_Proyectos/Clientes';

-- 2. Conectamos con la tabla de proyectos
CREATE TABLE Proyectos (
    id_proyecto INT PRIMARY KEY,
    id_cliente INT,
    nombre_proyecto VARCHAR(100),
    fecha_inicio DATE,
    fecha_estimada DATE,
    fecha_final DATE,
    presupuesto DECIMAL(10,2),
    costo_final DECIMAL(10,2),
    tamano_proyecto INT,
    complejidad VARCHAR(20),
    tamano_equipo INT,
    porcentaje_modularizacion DECIMAL(5,2),
    nivel_satisfaccion DECIMAL(3,1)
) 
ENGINE=FEDERATED 
CONNECTION='mysql://yuri:1234@IP_DE_GESTION:3306/Gestion_Proyectos/Proyectos';

-- 3. Jalamos los bugs para ver la calidad
CREATE TABLE Bugs (
    id_bug INT PRIMARY KEY,
    id_proyecto INT,
    descripcion TEXT,
    fecha_deteccion DATE,
    fecha_solucion DATE,
    severidad VARCHAR(20),
    estado VARCHAR(20)
) 
ENGINE=FEDERATED 
CONNECTION='mysql://yuri:1234@IP_DE_GESTION:3306/Gestion_Proyectos/Bugs';

-- 4. Tabla de requerimientos remota
CREATE TABLE Requerimientos (
    id_requerimiento INT PRIMARY KEY,
    id_proyecto INT,
    descripcion TEXT
) 
ENGINE=FEDERATED 
CONNECTION='mysql://yuri:1234@IP_DE_GESTION:3306/Gestion_Proyectos/Requerimientos';

-- 5. Y por ultimo los casos de prueba
CREATE TABLE Casos_Prueba (
    id_caso INT PRIMARY KEY,
    id_requerimiento INT,
    estado BOOLEAN
) 
ENGINE=FEDERATED 
CONNECTION='mysql://yuri:1234@IP_DE_GESTION:3306/Gestion_Proyectos/Casos_Prueba';