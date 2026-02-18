
import React from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
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
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/orders" component={OrdersPage} />
          <Route path="/c/:campaignId/home" component={HomePage} />
          {/* Fallback routes using Redirect instead of Navigate for v5 compatibility */}
          <Redirect from="/home" to="/c/1/home" />
          <Redirect from="/" to="/c/1/home" exact />
          <Redirect to="/c/1/home" />
        </Switch>
      </Router>
    </AppProvider>
  );
};

export default App;
