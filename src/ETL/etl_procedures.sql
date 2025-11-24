DELIMITER $$

USE soporte_decision$$

DROP PROCEDURE IF EXISTS etl_carga_tiempo$$
CREATE PROCEDURE etl_carga_tiempo()
BEGIN
    DECLARE v_fecha_inicio DATE;
    DECLARE v_fecha_fin DATE;
    SELECT MIN(fecha_inicio), GREATEST(MAX(COALESCE(fecha_final, '2000-01-01')), MAX(fecha_estimada), CURDATE() + INTERVAL 6 MONTH)
    INTO v_fecha_inicio, v_fecha_fin FROM gestion_proyectos.Proyectos;
    WHILE v_fecha_inicio <= v_fecha_fin DO
        INSERT IGNORE INTO Dim_Tiempo (id_fecha, fecha, anio, mes, trimestre)
        VALUES (DATE_FORMAT(v_fecha_inicio, '%Y%m%d'), v_fecha_inicio, YEAR(v_fecha_inicio), MONTH(v_fecha_inicio), QUARTER(v_fecha_inicio));
        SET v_fecha_inicio = v_fecha_inicio + INTERVAL 1 DAY;
    END WHILE;
END$$

DROP PROCEDURE IF EXISTS etl_carga_clientes$$
CREATE PROCEDURE etl_carga_clientes()
BEGIN
    SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE Dim_Cliente; SET FOREIGN_KEY_CHECKS = 1;
    INSERT INTO Dim_Cliente (id_cliente, nombre_empresa, sector, pais, importancia_en_sector)
    SELECT id_cliente, nombre, sector, pais, importancia_en_sector FROM gestion_proyectos.Clientes;
END$$

DROP PROCEDURE IF EXISTS etl_carga_hechos$$
CREATE PROCEDURE etl_carga_hechos()
BEGIN
    SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE Fact_Proyectos; TRUNCATE TABLE Dim_Detalles_Proyecto; SET FOREIGN_KEY_CHECKS = 1;
    
    INSERT INTO Dim_Detalles_Proyecto (id_proyecto, nombre_proyecto, complejidad, tamano_equipo_categoria)
    SELECT id_proyecto, nombre_proyecto, complejidad,
        CASE WHEN tamano_equipo <= 3 THEN 'Pequeño' WHEN tamano_equipo <= 9 THEN 'Mediano' WHEN tamano_equipo <= 20 THEN 'Grande' ELSE 'Extra Grande' END
    FROM gestion_proyectos.Proyectos;

    INSERT INTO Fact_Proyectos (id_fecha_inicio, id_fecha_fin, id_cliente, id_detalles, presupuesto, costo_final, rentabilidad, dias_estimados, dias_reales, dias_retraso, lineas_codigo, tamano_equipo, porcentaje_modularizacion, total_bugs, total_bugs_criticos, tiempo_resolucion_bugs_promedio, total_requerimientos, porcentaje_cobertura_requerimientos, nivel_satisfaccion)
    SELECT 
        DATE_FORMAT(p.fecha_inicio, '%Y%m%d'), IF(p.fecha_final IS NULL, NULL, DATE_FORMAT(p.fecha_final, '%Y%m%d')),
        p.id_cliente, dd.id_detalles,
        p.presupuesto, p.costo_final, (p.presupuesto - IFNULL(p.costo_final, 0)),
        DATEDIFF(p.fecha_estimada, p.fecha_inicio), DATEDIFF(p.fecha_final, p.fecha_inicio), GREATEST(DATEDIFF(p.fecha_final, p.fecha_estimada), 0),
        p.tamano_proyecto, p.tamano_equipo, p.porcentaje_modularizacion,
        (SELECT COUNT(*) FROM gestion_proyectos.Bugs b WHERE b.id_proyecto = p.id_proyecto),
        (SELECT COUNT(*) FROM gestion_proyectos.Bugs b WHERE b.id_proyecto = p.id_proyecto AND b.severidad IN ('Alta', 'Crítica')),
        (SELECT IFNULL(AVG(DATEDIFF(fecha_solucion, fecha_deteccion)), 0) FROM gestion_proyectos.Bugs b WHERE b.id_proyecto = p.id_proyecto AND fecha_solucion IS NOT NULL),
        (SELECT COUNT(*) FROM gestion_proyectos.Requerimientos r WHERE r.id_proyecto = p.id_proyecto),
        IFNULL((SELECT (COUNT(DISTINCT cp.id_requerimiento) / (SELECT COUNT(*) FROM gestion_proyectos.Requerimientos WHERE id_proyecto = p.id_proyecto)) * 100 FROM gestion_proyectos.Casos_Prueba cp INNER JOIN gestion_proyectos.Requerimientos r ON cp.id_requerimiento = r.id_requerimiento WHERE r.id_proyecto = p.id_proyecto), 0),
        p.nivel_satisfaccion
    FROM gestion_proyectos.Proyectos p INNER JOIN Dim_Detalles_Proyecto dd ON p.id_proyecto = dd.id_proyecto;
END$$

DELIMITER ;