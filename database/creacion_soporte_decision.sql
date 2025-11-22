CREATE DATABASE soporte_decision;
USE soporte_decision;

CREATE TABLE Dim_Tiempo (
    id_fecha INT PRIMARY KEY, -- Ej: 20251121
    fecha DATE,
    anio INT,
    mes INT,
    trimestre INT
);

-- para OKR de penetración de mercado y alcance
CREATE TABLE Dim_Cliente (
    id_cliente INT PRIMARY KEY, 
    nombre_empresa VARCHAR(100),
    sector VARCHAR(50),
    pais VARCHAR(50),
    importancia_en_sector VARCHAR(20) -- alta / media / baja
);

CREATE TABLE Dim_Detalles_Proyecto (
    id_detalles INT PRIMARY KEY AUTO_INCREMENT,
    id_proyecto INT,
    nombre_proyecto VARCHAR(100),
    
    complejidad VARCHAR(20),      -- Filtro: Ver solo proyectos complejos
    tamano_equipo_categoria VARCHAR(20) -- Pequeño 1-3
    									-- Mediano 4-9
    									-- Grande 10-20
    									-- Extra Grande +20
);

CREATE TABLE Fact_Proyectos (
    id_hecho INT PRIMARY KEY AUTO_INCREMENT,
    
    id_fecha_inicio INT,
    id_fecha_fin INT,
    id_cliente INT,
    id_detalles INT,
    
    -- KPI financiero
    presupuesto DECIMAL(10,2),
    costo_final DECIMAL(10,2),
    rentabilidad DECIMAL(10,2), -- (Presupuesto - Costo)
    
    -- TIeMPOS (Calculado en ETL)
    dias_estimados INT,
    dias_reales INT,
    dias_retraso INT,
    
    -- Dimensionamiento de proyecto (desde gestor)
	lineas_codigo INT, 
    tamano_equipo INT, 
    
    porcentaje_modularizacion DECIMAL(5,2), -- de gestor (OKR inteligencia en soluciones)

    -- KPI de calidad (CALCULADO EN ETL) 
    total_bugs INT,
    total_bugs_criticos INT,
    tiempo_resolucion_bugs_promedio DECIMAL(5,2),
	
    -- KPI de trazabilidad de requerimientos (Calculado en ETL)
    total_requerimientos INT, 
    porcentaje_cobertura_requerimientos DECIMAL(5,2),
    
    -- desde gestor (OKR de excelencia)
    nivel_satisfaccion DECIMAL(3,1),
    
    -- Relaciones
    FOREIGN KEY (id_fecha_inicio) REFERENCES Dim_Tiempo(id_fecha),
    FOREIGN KEY (id_fecha_fin) REFERENCES Dim_Tiempo(id_fecha),
    FOREIGN KEY (id_cliente) REFERENCES Dim_Cliente(id_cliente),
    FOREIGN KEY (id_detalles) REFERENCES Dim_Detalles_Proyecto(id_detalles)
);