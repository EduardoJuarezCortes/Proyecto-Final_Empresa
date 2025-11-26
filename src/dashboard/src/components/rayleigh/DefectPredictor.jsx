import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { rayleighAPI } from '../../services/api';

const DefectPredictor = () => {
  const [formData, setFormData] = useState({
    tamano: '',
    duracion: ''
  });
  const [prediccion, setPrediccion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await rayleighAPI.predecirDefectos(
        formData.tamano,
        formData.duracion
      );

      if (response.status === 'success') {
        setPrediccion(response.data);
      } else {
        setError('Error al obtener la predicción');
      }
    } catch (err) {
      setError('Error de conexión con la API de Rayleigh. Asegúrate de que esté corriendo en el puerto 5000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para la gráfica
  const chartData = prediccion ? prediccion.meses_proyectados.map((mes, index) => ({
    mes: mes,
    defectos: prediccion.distribucion_tiempo[index]
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Predicción de Defectos</h2>
        <p className="text-red-100">Modelo de Distribución de Rayleigh</p>
        <p className="text-sm text-red-100 mt-2">⚠️ Solo disponible para Responsables de Proyecto</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Datos del Proyecto</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño del Proyecto (KLOC)
                </label>
                <input
                  type="number"
                  name="tamano"
                  value={formData.tamano}
                  onChange={handleInputChange}
                  placeholder="Ej: 80000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Líneas de código estimadas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración Estimada (Meses)
                </label>
                <input
                  type="number"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleInputChange}
                  placeholder="Ej: 12"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Tiempo de desarrollo en meses</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Calculando...' : 'Generar Predicción'}
              </button>
            </form>

            {/* Información del Modelo */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre el Modelo</h4>
              <p className="text-sm text-blue-800">
                La distribución de Rayleigh predice el patrón temporal de aparición de defectos 
                durante el ciclo de vida del desarrollo de software.
              </p>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2">
          {prediccion ? (
            <div className="space-y-6">
              {/* KPIs de Predicción */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Defectos Estimados</p>
                      <p className="text-3xl font-bold text-red-600">{prediccion.total_defectos_estimados}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pico de Defectos (Mes)</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {prediccion.meses_proyectados[
                          prediccion.distribucion_tiempo.indexOf(
                            Math.max(...prediccion.distribucion_tiempo)
                          )
                        ]}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Defectos Máximos/Mes</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {Math.max(...prediccion.distribucion_tiempo).toFixed(2)}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Gráfica de Rayleigh */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Curva de Distribución de Defectos</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="mes" 
                      label={{ value: 'Mes del Proyecto', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Defectos Esperados', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [value.toFixed(2), 'Defectos']}
                      labelFormatter={(label) => `Mes ${label}`}
                    />
                    <Legend />
                    <ReferenceLine 
                      x={parseInt(formData.duracion)} 
                      stroke="red" 
                      strokeDasharray="5 5"
                      label="Fin Estimado"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="defectos" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Defectos Esperados"
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">📊 Interpretación</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• El pico de defectos ocurre aproximadamente al 40% del ciclo de vida</li>
                    <li>• La curva muestra la probabilidad de encontrar bugs en cada mes</li>
                    <li>• Use esta información para planificar recursos de QA</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg shadow-lg text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Introduce los datos del proyecto
              </h3>
              <p className="text-gray-500">
                Completa el formulario para generar la predicción de defectos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefectPredictor;