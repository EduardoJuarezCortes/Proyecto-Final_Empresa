import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Bug, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cuboAPI } from '../../services/api';

// Funciones auxiliares para formateo seguro
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = parseFloat(value);
  return isNaN(num) ? '0' : num.toFixed(decimals);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '$0.00';
  const num = parseFloat(value);
  return isNaN(num) ? '$0.00' : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || value === '') return '0.0%';
  const num = parseFloat(value);
  return isNaN(num) ? '0.0%' : `${num.toFixed(decimals)}%`;
};

const KPIDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [proyectosData, setProyectosData] = useState([]);
  const [filtros, setFiltros] = useState({
    anio: '',
    trimestre: '',
    sector: '',
    complejidad: ''
  });
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    setLoading(true);
    setNoData(false);
    try {
      // Llamamos a la API con los filtros actuales
      const [kpisRes, proyectosRes] = await Promise.all([
        cuboAPI.getKPIs(filtros),
        cuboAPI.getDatos(filtros)
      ]);

      setKpis(kpisRes.data);
      setProyectosData(proyectosRes.data);

      if (proyectosRes.data.length === 0) {
        setNoData(true);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      anio: '',
      trimestre: '',
      sector: '',
      complejidad: ''
    });
  };

  if (loading && !kpis) { // Mostrar spinner solo si no hay datos previos
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* --- SECCIÓN DE FILTROS (Restaurada) --- */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filtros Operativos</h3>
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
          >
            Limpiar Filtros
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <select
              name="anio"
              value={filtros.anio}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre</label>
            <select
              name="trimestre"
              value={filtros.trimestre}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select
              name="sector"
              value={filtros.sector}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="Salud">Salud</option>
              <option value="Educación">Educación</option>
              <option value="Finanzas">Finanzas</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Comercio">Comercio</option>
              <option value="Manufactura">Manufactura</option>
              <option value="Transporte">Transporte</option>
              <option value="Energía">Energía</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complejidad</label>
            <select
              name="complejidad"
              value={filtros.complejidad}
              onChange={handleFiltroChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Todas</option>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensaje cuando no hay datos */}
      {noData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800">No se encontraron datos</p>
            <p className="text-sm text-yellow-700">
              No hay proyectos que cumplan con los filtros seleccionados.
            </p>
          </div>
        </div>
      )}

      {/* --- KPI CARDS (Actualizadas con métricas de la Misión) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Proyectos Activos"
          value={kpis?.total_proyectos || 0}
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <KPICard
          title="Rentabilidad Total"
          value={formatCurrency(kpis?.rentabilidad_total)} // Ahora muestra el Total (Suma)
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-green-500"
        />
        <KPICard
          title="Satisfacción General"
          value={`${formatNumber(kpis?.satisfaccion_general, 1)}/100`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <KPICard
          title="Tasa Defectos/Proy"
          value={formatNumber(kpis?.tasa_defectos_proyecto, 1)}
          icon={<Bug className="w-6 h-6" />}
          color="bg-red-500"
        />
        <KPICard
          title="Retraso Promedio"
          value={`${formatNumber(kpis?.promedio_retraso, 1)} días`}
          icon={<Clock className="w-6 h-6" />}
          color="bg-yellow-500"
        />
        <KPICard
          title="Trazabilidad (Cobertura)"
          value={formatPercentage(kpis?.cobertura_promedio, 1)}
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-indigo-500"
        />
      </div>

      {/* --- GRÁFICAS DE APOYO --- */}
      {!noData && proyectosData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rentabilidad por Proyecto */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Rentabilidad por Proyecto</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={proyectosData.slice(0, 10)}
                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Proyecto" 
                  angle={-45} 
                  textAnchor="end" 
                  height={150}
                  interval={0}
                  tick={{fontSize: 12}}
                />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                <Bar dataKey="Rentabilidad" fill="#3b82f6" name="Rentabilidad ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Satisfacción del Cliente */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Tendencia de Satisfacción</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart 
                data={proyectosData.slice(0, 10)}
                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Proyecto" 
                  angle={-45} 
                  textAnchor="end" 
                  height={150}
                  interval={0}
                  tick={{fontSize: 12}}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="Satisfaccion_Cliente" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Satisfacción (%)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const KPICard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPIDashboard;