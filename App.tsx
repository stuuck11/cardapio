
import React from 'react';
/* Updated react-router-dom imports for v6 compatibility */
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        {/* Swapped Switch for Routes in v6 */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/c/:campaignId/home" element={<HomePage />} />
          
          {/* Updated Redirects to Navigate for v6 compatibility */}
          <Route path="/home" element={<Navigate to="/c/1/home" replace />} />
          <Route path="/" element={<Navigate to="/c/1/home" replace />} />
          <Route path="*" element={<Navigate to="/c/1/home" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
