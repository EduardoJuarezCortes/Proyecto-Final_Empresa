import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import KPIDashboard from './components/dashboard/KPIDashboard';
import BalancedScorecard from './components/dashboard/BalancedScorecard';
import DefectPredictor from './components/rayleigh/DefectPredictor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-100">
                  <Navbar />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <KPIDashboard />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/scorecard"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-100">
                  <Navbar />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <BalancedScorecard />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/prediccion"
            element={
              <ProtectedRoute requireResponsable={true}>
                <div className="min-h-screen bg-gray-100">
                  <Navbar />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <DefectPredictor />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Redirecciones */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;