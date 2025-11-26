import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Target, AlertTriangle, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isResponsable } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8" />
            <span className="text-xl font-bold">DSS - Gestión Software</span>
          </div>

          {/* Links de navegación */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/dashboard')
                  ? 'bg-indigo-700'
                  : 'hover:bg-indigo-500'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard KPIs</span>
            </Link>

            <Link
              to="/scorecard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/scorecard')
                  ? 'bg-indigo-700'
                  : 'hover:bg-indigo-500'
              }`}
            >
              <Target className="w-5 h-5" />
              <span>Balanced Scorecard</span>
            </Link>

            {isResponsable() && (
              <Link
                to="/prediccion"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  isActive('/prediccion')
                    ? 'bg-indigo-700'
                    : 'hover:bg-indigo-500'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Predicción Rayleigh</span>
              </Link>
            )}

            {/* Usuario */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-indigo-500">
              <div className="text-right">
                <p className="text-sm font-semibold">{user?.nombre}</p>
                <p className="text-xs text-indigo-200">{user?.role}</p>
              </div>
              <User className="w-8 h-8 p-1.5 bg-indigo-500 rounded-full" />
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;