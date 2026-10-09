import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import AIAnalytics from './pages/AIAnalytics';
import BrandAnalytics from './pages/BrandAnalytics';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

// Route Guard for Manager & Admin views
const ManagerRoute = ({ children }) => {
  const { isManager, loading, isAuthenticated } = useAuth();
  
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isManager) return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Core Console Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="pos" element={<POS />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Manager & Admin Only Routes */}
              <Route
                path="products"
                element={
                  <ManagerRoute>
                    <Products />
                  </ManagerRoute>
                }
              />
              <Route
                path="inventory"
                element={
                  <ManagerRoute>
                    <Inventory />
                  </ManagerRoute>
                }
              />
              <Route
                path="suppliers"
                element={
                  <ManagerRoute>
                    <Suppliers />
                  </ManagerRoute>
                }
              />
              <Route
                path="ai-analytics"
                element={
                  <ManagerRoute>
                    <AIAnalytics />
                  </ManagerRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ManagerRoute>
                    <Reports />
                  </ManagerRoute>
                }
              />
              <Route
                path="brand-analytics"
                element={
                  <ManagerRoute>
                    <BrandAnalytics />
                  </ManagerRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
