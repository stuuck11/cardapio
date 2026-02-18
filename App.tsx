
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/c/:campaignId/home" element={<HomePage />} />
          {/* Rotas de fallback sem Hash */}
          <Route path="/home" element={<Navigate to="/c/1/home" replace />} />
          <Route path="/" element={<Navigate to="/c/1/home" replace />} />
          <Route path="*" element={<Navigate to="/c/1/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
