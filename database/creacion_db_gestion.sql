-- 1 okr penetración de mercado y alcance
CREATE TABLE Clientes(
	id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50),
    sector VARCHAR(50),
    importancia_en_sector VARCHAR(20), -- alta / media / baja
    pais VARCHAR(50)
);

CREATE TABLE Proyectos(
	id_proyecto INT PRIMARY KEY AUTO_INCREMENT,
	id_cliente INT,
    nombre_proyecto VARCHAR(100),
    
    fecha_inicio DATE,
    fecha_estimada DATE,
	fecha_final DATE,
    
    -- 3 kpi costes
    presupuesto DECIMAL(10,2),
    costo_final DECIMAL(10,2),
    
    -- rayleigh complejidad
    tamano_proyecto INT, -- líneas de codigo 
    complejidad VARCHAR(20), -- bajA / media / alta
    tamano_equipo INT,
    
    -- 3 OKR satisfacción
    nivel_satisfaccion DECIMAL(3,1),
    
    -- FK's
    FOREIGN KEY(id_cliente) REFERENCES Clientes(id_cliente)
 );

-- 4 kpi trazabilidad
CREATE TABLE Requerimientos(
	id_requerimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_proyecto INT,
    descripcion TEXT,
    
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto)
);

CREATE TABLE casos_prueba(
	id_caso INT PRIMARY KEY AUTO_INCREMENT,
    id_requerimiento INT,
    estado TINYINT(0,1), -- PASS (true) o FAIL (false)
    FOREIGN KEY (id_requerimiento) REFERENCES Requerimientos (id_requerimiento)
);

CREATE TABLE Actividades(
	id_actividad INT PRIMARY KEY AUTO_INCREMENT,
    id_proyecto INT,
    
    nombre VARCHAR(50),
    -- 2 kpi eficiencia
    fecha_aprobacion DATE,
    fecha_finalizacion DATE,
    
    -- FK
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto)
);

-- 1 kpi calidad
CREATE TABLE Bugs(
	id_bug INT PRIMARY KEY AUTO_INCREMENT,
    id_proyecto INT,
    descripcion TEXT,
    
    fecha_deteccion DATE,
    fecha_solucion DATE,
    severidad VARCHAR(20), -- alta / media / baja
    estado VARCHAR(20), -- detectado / en revisión / solucionado
    
    -- FK
    FOREIGN KEY(id_proyecto) REFERENCES Proyectos(id_proyecto)
);