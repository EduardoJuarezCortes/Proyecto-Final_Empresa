USE soporte_decision;

-- Vista materializada lógica que representa el Cubo OLAP
-- Unifica Hechos y Dimensiones para facilitar la conexión con Dashboards

CREATE OR REPLACE VIEW Cubo_Proyectos_OLAP AS
SELECT 
    -- 1. DIMENSIÓN TIEMPO
    t.anio AS 'Año',
    t.trimestre AS 'Trimestre',
    t.mes AS 'Mes',
    t.fecha AS 'Fecha_Corte',

    -- 2. DIMENSIÓN CLIENTE
    c.nombre_empresa AS 'Cliente',
    c.sector AS 'Sector_Industrial',
    c.pais AS 'Pais',
    c.importancia_en_sector AS 'Importancia_Cliente',

    -- 3. DIMENSIÓN DETALLES PROYECTO
    d.nombre_proyecto AS 'Proyecto',
    d.complejidad AS 'Complejidad',
    d.tamano_equipo_categoria AS 'Categoria_Equipo',

    -- 4. HECHOS (Métricas calculadas)
    f.presupuesto AS 'Monto_Presupuesto',
    f.costo_final AS 'Costo_Real',
    f.rentabilidad AS 'Rentabilidad',
    
    f.dias_estimados AS 'Tiempo_Estimado_Dias',
    f.dias_reales AS 'Tiempo_Real_Dias',
    f.dias_retraso AS 'Dias_Retraso',
    
    f.total_bugs AS 'Total_Defectos',
    f.total_bugs_criticos AS 'Defectos_Criticos',
    f.tiempo_resolucion_bugs_promedio AS 'Tiempo_Resolucion_Promedio',
    
    f.porcentaje_cobertura_requerimientos AS 'Cobertura_Pruebas_Pct',
    f.nivel_satisfaccion AS 'Satisfaccion_Cliente'

FROM Fact_Proyectos f
JOIN Dim_Tiempo t ON f.id_fecha_inicio = t.id_fecha
JOIN Dim_Cliente c ON f.id_cliente = c.id_cliente
JOIN Dim_Detalles_Proyecto d ON f.id_detalles = d.id_detalles;