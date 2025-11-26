import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Bug, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cuboAPI } from '../../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Funciones auxiliares para formateo seguro de números
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = parseFloat(value);
  return isNaN(num) ? '0' : num.toFixed(decimals);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '$0.00';
  const num = parseFloat(value);
  return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filtros Dinámicos</h3>
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
              No hay proyectos que cumplan con los filtros seleccionados. Intenta con una combinación diferente o limpia los filtros.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Proyectos Totales"
          value={kpis?.total_proyectos || 0}
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <KPICard
          title="Rentabilidad Promedio"
          value={formatCurrency(kpis?.rentabilidad_promedio)}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-green-500"
        />
        <KPICard
          title="Satisfacción Cliente"
          value={`${formatNumber(kpis?.satisfaccion_promedio, 1)}/10`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <KPICard
          title="Defectos Totales"
          value={kpis?.defectos_totales || 0}
          icon={<Bug className="w-6 h-6" />}
          color="bg-red-500"
        />
        <KPICard
          title="Tiempo Resolución Avg"
          value={`${formatNumber(kpis?.tiempo_resolucion_avg, 1)} días`}
          icon={<Clock className="w-6 h-6" />}
          color="bg-yellow-500"
        />
        <KPICard
          title="Cobertura de Pruebas"
          value={formatPercentage(kpis?.cobertura_pruebas_avg, 1)}
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-indigo-500"
        />
      </div>

      {/* Gráficas */}
{/* Gráficas */}
      {!noData && proyectosData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rentabilidad por Proyecto */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Rentabilidad por Proyecto</h3>
            <ResponsiveContainer width="100%" height={400}> {/* Aumenté un poco la altura total aquí también */}
              <BarChart 
                data={proyectosData.slice(0, 10)}
                margin={{ top: 5, right: 30, left: 20, bottom: 20 }} // Margen extra abajo
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Proyecto" 
                  angle={-45} 
                  textAnchor="end" 
                  height={150}      // <--- CAMBIO CLAVE: Aumentado de 100 a 150
                  interval={0}      // <--- CAMBIO CLAVE: Fuerza a mostrar todos
                  tick={{fontSize: 12}} // Letra un poco más chica
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
            <h3 className="text-lg font-semibold mb-4">Satisfacción del Cliente</h3>
            <ResponsiveContainer width="100%" height={400}> {/* Aumenté un poco la altura total */}
              <LineChart 
                data={proyectosData.slice(0, 10)}
                margin={{ top: 5, right: 30, left: 20, bottom: 20 }} // Margen extra abajo
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Proyecto" 
                  angle={-45} 
                  textAnchor="end" 
                  height={150}      // <--- CAMBIO CLAVE
                  interval={0}      // <--- CAMBIO CLAVE
                  tick={{fontSize: 12}}
                />
                <YAxis domain={[0, 100]} /> {/* Opcional: Fija la escala de 0 a 100 para satisfacción */}
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPIDashboard;