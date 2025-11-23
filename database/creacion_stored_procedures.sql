
-- para que no haya error con los ; dentro del procedimiento 
--
-- ╰（‵□′）╯
--

DELIMITER $$


-- Insert Client
CREATE PROCEDURE insertar_cliente(
    IN arg_nombre VARCHAR(50),
    IN arg_sector VARCHAR(50),
    IN arg_importancia VARCHAR(20),
    IN arg_pais VARCHAR(50),
    OUT arg_id_generado INT -- rerturn id
)
BEGIN
    INSERT INTO Clientes (nombre, sector, importancia_en_sector, pais)
    VALUES (arg_nombre, arg_sector, arg_importancia, arg_pais);
    
    SET arg_id_generado = LAST_INSERT_ID(); -- Guardamos el ID nuevo
END$$

-- Insert Project
CREATE PROCEDURE insertar_proyecto(
    IN arg_id_cliente INT,
    IN arg_nombre VARCHAR(100),
    IN arg_inicio DATE,
    IN arg_estimada DATE,
    IN arg_final DATE,
    IN arg_presupuesto DECIMAL(10,2),
    IN arg_costo DECIMAL(10,2),
    IN arg_tamano_proyecto INT,
    IN arg_complejidad VARCHAR(20),
    IN arg_equipo INT,
    IN arg_modularizacion DECIMAL(5,2),
    IN arg_satisfaccion DECIMAL(3,1),
    OUT arg_id_generado INT
)
BEGIN
    INSERT INTO Proyectos 
    (id_cliente, nombre_proyecto, fecha_inicio, fecha_estimada, fecha_final, 
    presupuesto, costo_final, tamano_proyecto, complejidad, tamano_equipo, 
    porcentaje_modularizacion, nivel_satisfaccion)
    VALUES 
    (arg_id_cliente, arg_nombre, arg_inicio, arg_estimada, arg_final, 
    arg_presupuesto, arg_costo, arg_tamano_proyecto, arg_complejidad, arg_equipo, 
    arg_modularizacion, arg_satisfaccion);
    
    SET arg_id_generado = LAST_INSERT_ID();
END$$

-- Insert Actividad
CREATE PROCEDURE insertar_actividad(
    IN arg_id_proyecto INT,
    IN arg_nombre VARCHAR(50),
    IN arg_aprobacion DATE,
    IN arg_fin DATE,
    OUT arg_id_generado INT
)
BEGIN
    INSERT INTO Actividades (id_proyecto, nombre, fecha_aprobacion, fecha_finalizacion)
    VALUES (arg_id_proyecto, arg_nombre, arg_aprobacion, arg_fin);
    SET arg_id_generado = LAST_INSERT_ID();
END$$

-- insert bug
CREATE PROCEDURE insertar_bug(
    IN arg_id_proyecto INT,
    IN arg_descripcion TEXT,
    IN arg_deteccion DATE,
    IN arg_solucion DATE,
    IN arg_severidad VARCHAR(20),
    IN arg_estado VARCHAR(20),
    OUT arg_id_generado INT
)
BEGIN
    INSERT INTO Bugs (id_proyecto, descripcion, fecha_deteccion, fecha_solucion, severidad, estado)
    VALUES (arg_id_proyecto, arg_descripcion, arg_deteccion, arg_solucion, arg_severidad, arg_estado);
    SET arg_id_generado = LAST_INSERT_ID();
END$$

-- insert Requerimiento
CREATE PROCEDURE insertar_requerimiento(
    IN arg_id_proyecto INT,
    IN arg_descripcion TEXT,
    OUT arg_id_generado INT
)
BEGIN
    INSERT INTO Requerimientos (id_proyecto, descripcion)
    VALUES (arg_id_proyecto, arg_descripcion);
    SET arg_id_generado = LAST_INSERT_ID();
END$$

-- insert prueba
CREATE PROCEDURE insertar_caso_prueba(
    IN arg_id_requerimiento INT,
    IN arg_estado BOOLEAN,
    OUT arg_id_generado INT
)
BEGIN
    INSERT INTO Casos_Prueba (id_requerimiento, estado)
    VALUES (arg_id_requerimiento, arg_estado);
    SET arg_id_generado = LAST_INSERT_ID();
END$$

DELIMITER ; 

