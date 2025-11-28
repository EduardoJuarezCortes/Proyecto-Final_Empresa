import { useState, useEffect } from 'react';
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Users, Lightbulb } from 'lucide-react';
import { cuboAPI } from '../../services/api';

const BalancedScorecard = () => {
  const [okrsData, setOkrsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarOKRs();
  }, []);

  const cargarOKRs = async () => {
    try {
      const response = await cuboAPI.getOKRs();
      setOkrsData(response.data);
    } catch (error) {
      console.error('Error al cargar OKRs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Datos para el radar chart (normalizados a escala 0-100)
  const radarData = [
    {
      perspectiva: 'Financiera',
      // Normalizar: (valor actual / meta) * 100
      valor: Math.min(((okrsData?.rentabilidad[0]?.rentabilidad_promedio || 0) / 15000) * 100, 100),
      objetivo: 100
    },
    {
      perspectiva: 'Cliente',
      // Convertir satisfacción (0-10) a porcentaje
      valor: ((okrsData?.satisfaccion[0]?.satisfaccion_promedio || 0) / 10) * 100,
      objetivo: 90
    },
    {
      perspectiva: 'Procesos',
      // Invertir defectos: menos defectos = mejor
      valor: Math.max(0, 100 - ((okrsData?.calidad[0]?.defectos_promedio || 0) * 8)),
      objetivo: 90
    },
    {
      perspectiva: 'Aprendizaje',
      valor: 75, // Hardcoded por ahora
      objetivo: 80
    }
  ];

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Balanced Scorecard</h2>
        <p className="text-indigo-100">Visualización de OKRs alineados con la Visión Empresarial</p>
      </div>

      {/* Vista Radar General */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Vista General de Perspectivas</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="perspectiva" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Valor Actual (%)" dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Radar name="Objetivo (%)" dataKey="objetivo" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            <Legend />
            <Tooltip formatter={(value) => `${Math.round(value)}%`} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Las 4 Perspectivas del BSC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Perspectiva Financiera */}
        <PerspectivaCard
          titulo="Perspectiva Financiera"
          descripcion="OKR: Incrementar rentabilidad en un 20% anual"
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-green-500"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={okrsData?.rentabilidad || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Año" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rentabilidad_promedio" fill="#10b981" name="Rentabilidad Promedio" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <MetricaOKR
              label="Meta 2025"
              value="$18,000"
              progress={75}
            />
            <MetricaOKR
              label="Proyectos Rentables"
              value={`${Number(okrsData?.resumen?.pct_proyectos_rentables || 0).toFixed(1)}%`}
              progress={okrsData?.resumen?.pct_proyectos_rentables || 0}
            />
          </div>
        </PerspectivaCard>

        {/* 2. Perspectiva del Cliente */}
        <PerspectivaCard
          titulo="Perspectiva del Cliente"
          descripcion="OKR: Alcanzar 90% de satisfacción en todos los sectores"
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-500"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart 
              data={okrsData?.satisfaccion || []}
              margin={{ top: 10, right: 30, left: 15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Sector_Industrial" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => value.toFixed(1)} />
              <Tooltip />
              <Legend />
              <Bar dataKey="satisfaccion_promedio" fill="#3b82f6" name="Satisfacción Promedio" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <MetricaOKR
              label="Satisfacción Global"
              value={`${Number(okrsData?.resumen?.satisfaccion_global || 0).toFixed(1)}/100`}
              progress={(okrsData?.resumen?.satisfaccion_global || 0)} 
            />
            <MetricaOKR
              label="Clientes Únicos"
              value={okrsData?.resumen?.total_clientes_unicos || 0}
              progress={100} 
            />
          </div>
        </PerspectivaCard>

        {/* 3. Perspectiva de Procesos Internos */}
        <PerspectivaCard
          titulo="Perspectiva de Procesos Internos"
          descripcion="OKR: Reducir defectos críticos en 30%"
          icon={<Target className="w-6 h-6" />}
          color="bg-purple-500"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={okrsData?.calidad || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Complejidad" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="defectos_promedio" fill="#8b5cf6" name="Defectos Promedio" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <MetricaOKR
              label="Reducción de Bugs"
              value="25%"
              progress={83}
            />
            <MetricaOKR
              label="Tiempo Resolución"
              value="3.2 días"
              progress={78}
            />
          </div>
        </PerspectivaCard>

        {/* 4. Perspectiva de Aprendizaje y Crecimiento */}
        <PerspectivaCard
          titulo="Perspectiva de Aprendizaje y Crecimiento"
          descripcion="OKR: Implementar modularización en 80% de proyectos"
          icon={<Lightbulb className="w-6 h-6" />}
          color="bg-yellow-500"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Key Results</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>✓ Modularización implementada</span>
                  <span className="font-bold text-green-600">75%</span>
                </li>
                <li className="flex justify-between">
                  <span>✓ Capacitaciones completadas</span>
                  <span className="font-bold text-green-600">12/15</span>
                </li>
                <li className="flex justify-between">
                  <span>⏳ Certificaciones del equipo</span>
                  <span className="font-bold text-yellow-600">8/12</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <MetricaOKR
                label="Innovación (Cobertura)"
                value={`${Number(okrsData?.resumen?.innovacion_metric || 0).toFixed(1)}%`}
                progress={okrsData?.resumen?.innovacion_metric || 0}
              />
              <MetricaOKR
                label="Retención Talento"
                value="92%"
                progress={92}
              />
            </div>
          </div>
        </PerspectivaCard>
      </div>
    </div>
  );
};

const PerspectivaCard = ({ titulo, descripcion, icon, color, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className={`${color} text-white p-4 flex items-center gap-3`}>
        {icon}
        <div>
          <h3 className="text-lg font-bold">{titulo}</h3>
          <p className="text-sm opacity-90">{descripcion}</p>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

const MetricaOKR = ({ label, value, progress }) => {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-800 mb-2">{value}</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default BalancedScorecard;