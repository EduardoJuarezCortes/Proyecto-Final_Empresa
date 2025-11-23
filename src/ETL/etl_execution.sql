USE soporte_decision;

-- 1. Primero corremos el calendario
-- Es vital hacerlo antes para que existan todas las fechas (incluso las futuras)
CALL etl_carga_tiempo();

-- 2. Luego nos traemos a los clientes
-- Copia la lista de clientes tal cual de la otra base
CALL etl_carga_clientes();

-- 3. Al final, lo más importante: Tabla de Hechos
-- Aquí es donde se hacen los cálculos matemáticos, KPIs y se llena el Data Warehouse
CALL etl_carga_hechos();

-- SOLO PARA COMPROBAR
-- Un mensaje simple para saber que el script llegó al final sin errores
SELECT 'Proceso ETL Terminado' AS Estatus;

-- Mostramos las primeras 10 filas para ver que ya hay datos reales y calculados
SELECT * FROM Fact_Proyectos LIMIT 10;