import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Target, TrendingUp, Users, Lightbulb, Zap, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { cuboAPI } from '../../services/api';

const BalancedScorecard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarOKRs();
  }, []);

  const cargarOKRs = async () => {
    try {
      const response = await cuboAPI.getOKRs();
      setData(response.data);
    } catch (error) {
      console.error('Error al cargar OKRs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const { kpis, graficas } = data;

  // Radar Chart: Normalizamos todo a escala 0-100 para ver el "balance" de la estrategia
  const radarData = [
    { perspectiva: 'Financiera (Valor)', valor: kpis.fin_pct_alto_valor || 0, fullMark: 100 },
    { perspectiva: 'Cliente (Liderazgo)', valor: kpis.cli_liderazgo_vip || 0, fullMark: 100 },
    { perspectiva: 'Procesos (Confiabilidad)', valor: kpis.proc_pct_clean_code || 0, fullMark: 100 },
    { perspectiva: 'Aprendizaje (Innovación)', valor: kpis.apr_innovacion_modular || 0, fullMark: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Header Estratégico */}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Balanced Scorecard</h2>
      </div>

      {/* Radar de Visión - Vista Global */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-center">Índice de Madurez Estratégica</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="perspectiva" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Nivel Actual (%)" dataKey="valor" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.5} />
              <Legend />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tarjetas de Perspectivas (OKRs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. FINANCIERA */}
        <PerspectivaCard 
          titulo="Financiera: Sostenibilidad" 
          objetivo="Impulsar la transformación digital con modelos rentables."
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-emerald-600"
        >
          <MetricaOKR 
            label="% Proyectos de Alto Valor (>20% margen)"
            valor={`${Number(kpis.fin_pct_alto_valor).toFixed(1)}%`}
            subtexto="Meta: > 40% del portafolio"
            progress={kpis.fin_pct_alto_valor}
          />
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Histórico de Rentabilidad (Promedio Anual)</p>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={graficas.rentabilidad}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis 
                        dataKey="Año" 
                        tick={{fontSize: 11}} 
                        axisLine={false}
                        tickLine={false}
                     />
                     <YAxis 
                        tick={{fontSize: 11}} 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `$${val/1000}k`} // Formato corto: $15k
                     />
                     <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, "Rentabilidad"]}
                        contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                     />
                     <Bar dataKey="rentabilidad_promedio" name="Rentabilidad" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </PerspectivaCard>

        {/* 2. CLIENTE */}
        <PerspectivaCard 
          titulo="Cliente: Referente de Mercado" 
          objetivo="Consolidarse como referente en sectores estratégicos."
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-600"
        >
          <MetricaOKR 
            label="Satisfacción en Sectores VIP (Alta Importancia)"
            valor={`${Number(kpis.cli_liderazgo_vip).toFixed(1)} / 100`}
            subtexto="Meta: > 95.0 (Excelencia)"
            progress={kpis.cli_liderazgo_vip}
          />

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Satisfacción por Sector Industrial</p>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={graficas.satisfaccion}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis 
                        dataKey="Sector_Industrial" 
                        tick={{fontSize: 10}} 
                        interval={0} 
                        angle={-15}  
                        textAnchor="end"
                        height={40}
                        axisLine={false}
                        tickLine={false}
                     />
                     <YAxis 
                        domain={[0, 100]} 
                        tick={{fontSize: 11}} 
                        axisLine={false}
                        tickLine={false}
                     />
                     <Tooltip 
                        formatter={(value) => [`${Number(value).toFixed(1)}`, "Satisfacción"]}
                        contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                     />
                     <Bar dataKey="satisfaccion_promedio" name="Satisfacción" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </PerspectivaCard>

        {/* 3. PROCESOS INTERNOS */}
        <PerspectivaCard 
          titulo="Procesos: Soluciones Confiables" 
          objetivo="Excelencia operativa y cero defectos críticos."
          icon={<ShieldCheck className="w-6 h-6" />}
          color="bg-orange-500"
        >
          <MetricaOKR 
            label="Tasa de 'Clean Code' (0 Bugs Críticos)"
            valor={`${Number(kpis.proc_pct_clean_code).toFixed(1)}%`}
            subtexto="Meta: > 80% de los proyectos"
            progress={kpis.proc_pct_clean_code}
          />
          
        </PerspectivaCard>

        {/* 4. APRENDIZAJE */}
        <PerspectivaCard 
          titulo="Aprendizaje: Software Inteligente" 
          objetivo="Productos escalables y gestión del conocimiento."
          icon={<Lightbulb className="w-6 h-6" />}
          color="bg-purple-600"
        >
          <MetricaOKR 
            label="Nivel de Modularización (Escalabilidad)"
            valor={`${Number(kpis.apr_innovacion_modular).toFixed(1)}%`}
            subtexto="Meta: > 75% (Arquitectura Inteligente)"
            progress={kpis.apr_innovacion_modular}
          />
          
        </PerspectivaCard>

      </div>
    </div>
  );
};

// Componentes UI auxiliares
const PerspectivaCard = ({ titulo, objetivo, icon, color, children }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col h-full">
    <div className={`${color} px-4 py-3 flex items-center justify-between text-white`}>
      <div className="flex items-center gap-2 font-bold">
        {icon} <span>{titulo}</span>
      </div>
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <p className="text-xs text-gray-500 italic mb-4">"{objetivo}"</p>
      {children}
    </div>
  </div>
);

const MetricaOKR = ({ label, valor, subtexto, progress }) => (
  <div className="mb-2">
    <div className="flex justify-between items-end mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-xl font-bold text-gray-900">{valor}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
    </div>
    <p className="text-xs text-gray-400 mt-1 text-right">{subtexto}</p>
  </div>
);

const MiniKpi = ({ label, valor, icon }) => (
   <div className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center gap-3">
      <div className="bg-white p-2 rounded-full shadow-sm">
         {icon}
      </div>
      <div>
         <p className="text-xs text-gray-500">{label}</p>
         <p className="text-sm font-bold text-gray-800">{valor}</p>
      </div>
   </div>
);

export default BalancedScorecard;