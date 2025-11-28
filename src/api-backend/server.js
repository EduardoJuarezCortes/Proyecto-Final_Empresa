const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'soporte_decision',
  port: 3306,
  
  connectionLimit: 3,      // Límite estricto: Solo usará 3 conexiones simultáneas
  waitForConnections: true, // Si las 3 están ocupadas, la 4ta espera (hace fila) en vez de dar error
  queueLimit: 0             // La fila de espera puede ser infinita
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Endpoint: Obtener datos del Cubo OLAP
app.get('/api/cubo', async (req, res) => {
  try {
    const { anio, trimestre, sector, complejidad } = req.query;
    
    let query = 'SELECT * FROM Cubo_Proyectos_OLAP WHERE 1=1';
    const params = [];

    if (anio) {
      query += ' AND Año = ?';
      params.push(anio);
    }
    if (trimestre) {
      query += ' AND Trimestre = ?';
      params.push(trimestre);
    }
    if (sector) {
      query += ' AND Sector_Industrial = ?';
      params.push(sector);
    }
    if (complejidad) {
      query += ' AND Complejidad = ?';
      params.push(complejidad);
    }

    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en /api/cubo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: KPIs Operativos
app.get('/api/kpis', async (req, res) => {
  try {
    const { anio, trimestre, sector, complejidad } = req.query;
    
    // Construcción dinámica de filtros
    let whereConditions = [];
    const params = [];

    if (anio) { whereConditions.push('Año = ?'); params.push(anio); }
    if (trimestre) { whereConditions.push('Trimestre = ?'); params.push(trimestre); }
    if (sector) { whereConditions.push('Sector_Industrial = ?'); params.push(sector); }
    if (complejidad) { whereConditions.push('Complejidad = ?'); params.push(complejidad); }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const query = `
      SELECT 
        -- KPI 1: Volumen Operativo
        COUNT(*) as total_proyectos,
        
        -- KPI 2: Eficiencia Financiera (Suma real, no promedio)
        COALESCE(SUM(Rentabilidad), 0) as rentabilidad_total,
        
        -- KPI 3: Eficiencia de Tiempo (Promedio de retraso)
        COALESCE(AVG(Dias_Retraso), 0) as promedio_retraso,
        
        -- KPI 4: Calidad Operativa (Tasa de defectos)
        COALESCE(SUM(Total_Defectos) / NULLIF(COUNT(*),0), 0) as tasa_defectos_proyecto,
        
        -- KPI 5: Trazabilidad (Promedio Cobertura)
        COALESCE(AVG(Cobertura_Pruebas_Pct), 0) as cobertura_promedio,
        
        -- KPI 6: Satisfacción General
        COALESCE(AVG(Satisfaccion_Cliente), 0) as satisfaccion_general
      FROM Cubo_Proyectos_OLAP
      ${whereClause}
    `;
    
    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error en /api/kpis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: OKRs Estratégicos (Alineados a la VISIÓN - Liderazgo y Excelencia)
app.get('/api/okrs', async (req, res) => {
  try {
    // Queries para las gráficas de contexto (Barras)
    const queriesGraficas = {
      rentabilidad: `SELECT Año, AVG(Rentabilidad) as rentabilidad_promedio FROM Cubo_Proyectos_OLAP GROUP BY Año ORDER BY Año`,
      satisfaccion: `SELECT Sector_Industrial, AVG(Satisfaccion_Cliente) as satisfaccion_promedio FROM Cubo_Proyectos_OLAP GROUP BY Sector_Industrial`,
      calidad: `SELECT Complejidad, AVG(Total_Defectos) as defectos_promedio FROM Cubo_Proyectos_OLAP GROUP BY Complejidad`
    };

    // Query para los Key Results (Métricas de Excelencia)
    // Aquí calculamos PORCENTAJES DE ÉXITO, no promedios simples
    const queryKpisEstrategicos = `
      SELECT 
        -- Perspectiva Financiera: % de Proyectos de Alto Valor (Rentabilidad > 20% del costo)
        (SUM(CASE WHEN Rentabilidad > (Costo_Real * 0.20) THEN 1 ELSE 0 END) / COUNT(*)) * 100 as fin_pct_alto_valor,
        
        -- Perspectiva Cliente: Liderazgo en Clientes Importantes (Satisfacción en Sector 'Alta')
        (SELECT COALESCE(AVG(Satisfaccion_Cliente), 0) FROM Cubo_Proyectos_OLAP WHERE Importancia_Cliente = 'Alta') as cli_liderazgo_vip,
        
        -- Perspectiva Procesos: Soluciones Confiables (% Proyectos con 0 Bugs Críticos)
        (SUM(CASE WHEN Defectos_Criticos = 0 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as proc_pct_clean_code,
        
        -- Perspectiva Aprendizaje: Innovación y Escalabilidad (Nivel de Modularización)
        -- Este dato viene directo del ETL y representa la "Inteligencia" del software
        (SELECT AVG(porcentaje_modularizacion) FROM Fact_Proyectos) as apr_innovacion_modular
      FROM Cubo_Proyectos_OLAP
    `;

    const [rentabilidad] = await pool.execute(queriesGraficas.rentabilidad);
    const [satisfaccion] = await pool.execute(queriesGraficas.satisfaccion);
    const [calidad] = await pool.execute(queriesGraficas.calidad);
    const [kpis] = await pool.execute(queryKpisEstrategicos);

    res.json({
      success: true,
      data: {
        graficas: { rentabilidad, satisfaccion, calidad },
        kpis: kpis[0]
      }
    });
  } catch (error) {
    console.error('Error en /api/okrs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Proyectos por complejidad
app.get('/api/proyectos-complejidad', async (req, res) => {
  try {
    const query = `
      SELECT 
        Complejidad,
        COUNT(*) as cantidad,
        AVG(Rentabilidad) as rentabilidad_avg
      FROM Cubo_Proyectos_OLAP
      GROUP BY Complejidad
    `;
    
    const [rows] = await pool.execute(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});