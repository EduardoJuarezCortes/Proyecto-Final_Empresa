/**
 * Servicio de autenticación
 * Maneja el almacenamiento y validación de sesiones de usuario
 */

const AUTH_STORAGE_KEY = 'dss_user_session';

export const authService = {
  /**
   * Guarda la sesión del usuario en localStorage
   * @param {Object} userData - Datos del usuario autenticado
   */
  saveSession: (userData) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      return false;
    }
  },

  /**
   * Obtiene la sesión actual del usuario
   * @returns {Object|null} Datos del usuario o null si no hay sesión
   */
  getSession: () => {
    try {
      const session = localStorage.getItem(AUTH_STORAGE_KEY);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  },

  /**
   * Elimina la sesión del usuario
   */
  clearSession: () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error al limpiar sesión:', error);
      return false;
    }
  },

  /**
   * Verifica si hay una sesión activa
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const session = authService.getSession();
    return session !== null && session.username && session.role;
  },

  /**
   * Verifica si el usuario actual es responsable
   * @returns {boolean}
   */
  isResponsable: () => {
    const session = authService.getSession();
    return session?.role === 'responsable';
  },

  /**
   * Obtiene el rol del usuario actual
   * @returns {string|null}
   */
  getUserRole: () => {
    const session = authService.getSession();
    return session?.role || null;
  },

  /**
   * Obtiene el nombre del usuario actual
   * @returns {string|null}
   */
  getUserName: () => {
    const session = authService.getSession();
    return session?.nombre || null;
  },

  /**
   * Valida las credenciales del usuario
   * En producción, esto debería llamar a un endpoint del backend
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Object|null} Datos del usuario si es válido, null si no
   */
  validateCredentials: (username, password) => {
    // Base de datos simulada de usuarios
    const users = [
      {
        id: 1,
        username: 'responsable',
        password: 'admin123',
        role: 'responsable',
        nombre: 'Juan Pérez',
        email: 'juan.perez@empresa.com'
      },
      {
        id: 2,
        username: 'miembro',
        password: 'user123',
        role: 'miembro',
        nombre: 'María García',
        email: 'maria.garcia@empresa.com'
      }
    ];

    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      // No devolvemos la contraseña
      const { password, ...userData } = user;
      return userData;
    }

    return null;
  }
};

export default authService;