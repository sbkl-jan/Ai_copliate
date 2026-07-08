import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Leads from './pages/Leads';
import Appointments from './pages/Appointments';

// Private Route Guard Wrapper
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen flex text-slate-100 bg-[#06060a]">
        {/* Background Ambient Orbs */}
        <div className="ambient-bg">
          <div className="ambient-orb w-[600px] h-[600px] bg-brand-500/10 top-[-10%] right-[-10%]" />
          <div className="ambient-orb w-[500px] h-[500px] bg-purple-500/5 bottom-[-10%] left-[-10%]" />
        </div>

        {/* Sidebar displays only for authenticated workspace pages */}
        {isAuthenticated && <Sidebar />}

        <Routes>
          {/* Public Auth Gateway */}
          <Route path="/login" element={<Login />} />

          {/* Secure Workspace Directory Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <PrivateRoute>
                <Customers />
              </PrivateRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <PrivateRoute>
                <Leads />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            }
          />

          {/* Direct fallback to Command Center */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
