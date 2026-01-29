import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import POSCashierLayout from './components/Layout/POSCashierLayout';
import Home from './pages/Home';
import MenuManagement from './pages/MenuManagement';
import FloorManagement from './pages/FloorManagement';
import OrderManagement from './pages/OrderManagement';
import StaffManagement from './pages/StaffManagement';
import Reports from './pages/Reports';

const App: React.FC = () => {
  return (
    <Router>
      <POSCashierLayout>
        <Routes>
          <Route path="/" element={<MenuManagement />} />
          <Route path="/floor" element={<FloorManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </POSCashierLayout>
    </Router>
  );
};

export default App;
