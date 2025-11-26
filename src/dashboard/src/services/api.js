import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const RAYLEIGH_API_URL = import.meta.env.VITE_RAYLEIGH_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cuboAPI = {
  // Obtener datos del cubo con filtros
  getDatos: async (filtros = {}) => {
    try {
      const response = await api.get('/api/cubo', { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos del cubo:', error);
      throw error;
    }
  },

  // Obtener KPIs agregados (ahora acepta filtros)
  getKPIs: async (filtros = {}) => {
    try {
      const response = await api.get('/api/kpis', { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Error al obtener KPIs:', error);
      throw error;
    }
  },

  // Obtener datos para OKRs
  getOKRs: async () => {
    try {
      const response = await api.get('/api/okrs');
      return response.data;
    } catch (error) {
      console.error('Error al obtener OKRs:', error);
      throw error;
    }
  },

  // Obtener proyectos por complejidad
  getProyectosPorComplejidad: async () => {
    try {
      const response = await api.get('/api/proyectos-complejidad');
      return response.data;
    } catch (error) {
      console.error('Error al obtener proyectos por complejidad:', error);
      throw error;
    }
  }
};

export const rayleighAPI = {
  // Predecir defectos
  predecirDefectos: async (tamano, duracion) => {
    try {
      const response = await axios.post(`${RAYLEIGH_API_URL}/predict`, {
        tamano: parseFloat(tamano),
        duracion: parseFloat(duracion)
      });
      return response.data;
    } catch (error) {
      console.error('Error al predecir defectos:', error);
      throw error;
    }
  }
};

export default api;