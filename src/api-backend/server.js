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
  database: process.env.DB_NAME || 'soporte_decision'
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

// Endpoint: KPIs agregados CON FILTROS
app.get('/api/kpis', async (req, res) => {
  try {
    const { anio, trimestre, sector, complejidad } = req.query;
    
    // Construir query con filtros dinámicos
    let whereConditions = [];
    const params = [];

    if (anio) {
      whereConditions.push('Año = ?');
      params.push(anio);
    }
    if (trimestre) {
      whereConditions.push('Trimestre = ?');
      params.push(trimestre);
    }
    if (sector) {
      whereConditions.push('Sector_Industrial = ?');
      params.push(sector);
    }
    if (complejidad) {
      whereConditions.push('Complejidad = ?');
      params.push(complejidad);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    const query = `
      SELECT 
        COUNT(*) as total_proyectos,
        COALESCE(AVG(Rentabilidad), 0) as rentabilidad_promedio,
        COALESCE(AVG(Satisfaccion_Cliente), 0) as satisfaccion_promedio,
        COALESCE(SUM(Total_Defectos), 0) as defectos_totales,
        COALESCE(AVG(Tiempo_Resolucion_Promedio), 0) as tiempo_resolucion_avg,
        COALESCE(AVG(Cobertura_Pruebas_Pct), 0) as cobertura_pruebas_avg
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

// Endpoint: Datos para BSC (OKRs)
app.get('/api/okrs', async (req, res) => {
  try {
    const queries = {
      // Perspectiva Financiera
      rentabilidad: `
        SELECT 
          Año, 
          AVG(Rentabilidad) as rentabilidad_promedio,
          COUNT(*) as num_proyectos
        FROM Cubo_Proyectos_OLAP 
        GROUP BY Año 
        ORDER BY Año
      `,
      // Perspectiva del Cliente
      satisfaccion: `
        SELECT 
          Sector_Industrial, 
          AVG(Satisfaccion_Cliente) as satisfaccion_promedio, 
          COUNT(DISTINCT Cliente) as clientes_unicos
        FROM Cubo_Proyectos_OLAP 
        GROUP BY Sector_Industrial
      `,
      // Perspectiva Interna
      calidad: `
        SELECT 
          Complejidad, 
          AVG(Total_Defectos) as defectos_promedio, 
          AVG(Tiempo_Resolucion_Promedio) as tiempo_resolucion_avg
        FROM Cubo_Proyectos_OLAP 
        GROUP BY Complejidad
      `,
      
      // KPIs Globales para las tarjetas (KPIs sueltos)
      resumen: `
        SELECT 
          AVG(Satisfaccion_Cliente) as satisfaccion_global,
          COUNT(DISTINCT Cliente) as total_clientes_unicos,
          
          -- Calcula % de proyectos que generaron ganancia (Rentabilidad > 0)
          (SUM(CASE WHEN Rentabilidad > 0 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as pct_proyectos_rentables,
          
          -- Usamos la cobertura de pruebas como métrica de innovación/calidad
          AVG(Cobertura_Pruebas_Pct) as innovacion_metric
        FROM Cubo_Proyectos_OLAP
      `
    };

    const [rentabilidad] = await pool.execute(queries.rentabilidad);
    const [satisfaccion] = await pool.execute(queries.satisfaccion);
    const [calidad] = await pool.execute(queries.calidad);
    const [resumen] = await pool.execute(queries.resumen);

    res.json({
      success: true,
      data: {
        rentabilidad,
        satisfaccion,
        calidad,
        resumen: resumen[0]
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
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});