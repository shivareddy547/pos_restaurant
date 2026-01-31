import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import POSCashierLayout from './components/Layout/POSCashierLayout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import MenuManagement from './pages/MenuManagement';
import FloorManagement from './pages/FloorManagement';
import OrderManagement from './pages/OrderManagement';
import StaffManagement from './pages/StaffManagement';
import Reports from './pages/Reports';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected App */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <POSCashierLayout>
                  <Routes>
                    <Route path="/" element={<MenuManagement />} />
                    <Route path="/floor" element={<FloorManagement />} />
                    <Route path="/orders" element={<OrderManagement />} />
                    <Route path="/staff" element={<StaffManagement />} />
                    <Route path="/reports" element={<Reports />} />
                  </Routes>
                </POSCashierLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
