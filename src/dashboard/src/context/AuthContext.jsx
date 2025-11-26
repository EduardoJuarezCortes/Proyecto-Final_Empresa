import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Usuarios hardcodeados para demo
    const users = [
      { 
        id: 1, 
        username: 'responsable', 
        password: 'admin123', 
        role: 'responsable',
        nombre: 'Juan Pérez'
      },
      { 
        id: 2, 
        username: 'miembro', 
        password: 'user123', 
        role: 'miembro',
        nombre: 'María García'
      }
    ];

    const foundUser = users.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const userData = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        nombre: foundUser.nombre
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isResponsable = () => {
    return user?.role === 'responsable';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isResponsable, loading }}>
      {children}
    </AuthContext.Provider>
  );
};