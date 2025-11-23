DELIMITER $$

USE soporte_decision$$

-- Procedimiento para llenar la dimensión de tiempo (calendario)
DROP PROCEDURE IF EXISTS etl_carga_tiempo$$
CREATE PROCEDURE etl_carga_tiempo()
BEGIN
    DECLARE v_fecha_inicio DATE;
    DECLARE v_fecha_fin DATE;
    
    -- Buscamos la fecha más vieja y la más futura de los proyectos.
    -- Usamos GREATEST para asegurar que el calendario llegue hasta el futuro
    -- (incluso si es una fecha estimada o 6 meses adelante), así evitamos errores de llave foránea.
    SELECT 
        MIN(fecha_inicio), 
        GREATEST(MAX(COALESCE(fecha_final, '2000-01-01')), MAX(fecha_estimada), CURDATE() + INTERVAL 6 MONTH)
    INTO v_fecha_inicio, v_fecha_fin 
    FROM gestion_proyectos.Proyectos;
    
    -- Ciclo para insertar día por día
    WHILE v_fecha_inicio <= v_fecha_fin DO
        INSERT IGNORE INTO Dim_Tiempo (id_fecha, fecha, anio, mes, trimestre)
        VALUES (
            DATE_FORMAT(v_fecha_inicio, '%Y%m%d'), -- ID tipo 20250101
            v_fecha_inicio,
            YEAR(v_fecha_inicio),
            MONTH(v_fecha_inicio),
            QUARTER(v_fecha_inicio)
        );
        -- Pasamos al siguiente día
        SET v_fecha_inicio = v_fecha_inicio + INTERVAL 1 DAY;
    END WHILE;
END$$


-- Procedimiento para pasar los clientes tal cual
DROP PROCEDURE IF EXISTS etl_carga_clientes$$
CREATE PROCEDURE etl_carga_clientes()
BEGIN
    -- Desactivamos revisión de llaves para poder limpiar la tabla rápido
    SET FOREIGN_KEY_CHECKS = 0;
    TRUNCATE TABLE Dim_Cliente; -- Borrón y cuenta nueva
    SET FOREIGN_KEY_CHECKS = 1;

    -- Copiamos directo de la base transaccional
    INSERT INTO Dim_Cliente (id_cliente, nombre_empresa, sector, pais, importancia_en_sector)
    SELECT id_cliente, nombre, sector, pais, importancia_en_sector
    FROM gestion_proyectos.Clientes;
END$$


-- Procedimiento principal: Calcula los KPIs y llena la tabla de hechos
DROP PROCEDURE IF EXISTS etl_carga_hechos$$
CREATE PROCEDURE etl_carga_hechos()
BEGIN
    -- Limpiamos las tablas para no duplicar datos al correrlo varias veces
    SET FOREIGN_KEY_CHECKS = 0;
    TRUNCATE TABLE Fact_Proyectos;
    TRUNCATE TABLE Dim_Detalles_Proyecto;
    SET FOREIGN_KEY_CHECKS = 1;

    -- 1. Llenamos detalles del proyecto y clasificamos el equipo
    INSERT INTO Dim_Detalles_Proyecto (id_proyecto, nombre_proyecto, complejidad, tamano_equipo_categoria)
    SELECT id_proyecto, nombre_proyecto, complejidad,
        CASE 
            WHEN tamano_equipo <= 3 THEN 'Pequeño'
            WHEN tamano_equipo <= 9 THEN 'Mediano'
            WHEN tamano_equipo <= 20 THEN 'Grande'
            ELSE 'Extra Grande'
        END
    FROM gestion_proyectos.Proyectos;

    -- 2. Calculamos todo y lo metemos a la tabla de hechos
    INSERT INTO Fact_Proyectos (
        id_fecha_inicio, id_fecha_fin, id_cliente, id_detalles,
        presupuesto, costo_final, rentabilidad,
        dias_estimados, dias_reales, dias_retraso,
        lineas_codigo, tamano_equipo, porcentaje_modularizacion,
        total_bugs, total_bugs_criticos, tiempo_resolucion_bugs_promedio,
        total_requerimientos, porcentaje_cobertura_requerimientos,
        nivel_satisfaccion
    )
    SELECT 
        -- IDs para conectar con las dimensiones
        DATE_FORMAT(p.fecha_inicio, '%Y%m%d'),
        IF(p.fecha_final IS NULL, NULL, DATE_FORMAT(p.fecha_final, '%Y%m%d')), -- Si no ha acabado, queda NULL
        p.id_cliente,
        dd.id_detalles,
        
        -- Finanzas
        p.presupuesto,
        p.costo_final,
        (p.presupuesto - IFNULL(p.costo_final, 0)), -- Si costo es nulo, restamos 0
        
        -- Tiempos
        DATEDIFF(p.fecha_estimada, p.fecha_inicio),
        DATEDIFF(p.fecha_final, p.fecha_inicio),
        -- Usamos GREATEST para que si acabaron antes, el retraso sea 0 y no negativo
        GREATEST(DATEDIFF(p.fecha_final, p.fecha_estimada), 0), 
        
        -- Métricas generales
        p.tamano_proyecto,
        p.tamano_equipo,
        p.porcentaje_modularizacion,
        
        -- Calidad: Contamos los bugs directamente aquí
        (SELECT COUNT(*) FROM gestion_proyectos.Bugs b WHERE b.id_proyecto = p.id_proyecto),
        (SELECT COUNT(*) FROM gestion_proyectos.Bugs b WHERE b.id_proyecto = p.id_proyecto AND b.severidad IN ('Alta', 'Crítica')),
        (SELECT IFNULL(AVG(DATEDIFF(fecha_solucion, fecha_deteccion)), 0) FROM gestion_proyectos.Bugs b WHERE b.id_proyecto = p.id_proyecto AND fecha_solucion IS NOT NULL),
        
        -- Trazabilidad: Contamos requerimientos totales
        (SELECT COUNT(*) FROM gestion_proyectos.Requerimientos r WHERE r.id_proyecto = p.id_proyecto),
        
        -- Cobertura: Sacamos el porcentaje de reqs que sí tienen prueba
        IFNULL((
            SELECT (COUNT(DISTINCT cp.id_requerimiento) / (SELECT COUNT(*) FROM gestion_proyectos.Requerimientos WHERE id_proyecto = p.id_proyecto)) * 100
            FROM gestion_proyectos.Casos_Prueba cp
            INNER JOIN gestion_proyectos.Requerimientos r ON cp.id_requerimiento = r.id_requerimiento
            WHERE r.id_proyecto = p.id_proyecto
        ), 0),
        
        p.nivel_satisfaccion
    FROM gestion_proyectos.Proyectos p
    INNER JOIN Dim_Detalles_Proyecto dd ON p.id_proyecto = dd.id_proyecto;
END$$

DELIMITER ;