import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import StudentPortal from './pages/StudentPortal';
import AdminLayout from './components/Layout/AdminLayout';
import MaintenanceLayout from './components/Layout/MaintenanceLayout';
import ManagerLayout from './components/Layout/ManagerLayout';
import Dashboard from './pages/Admin/Dashboard';
import Students from './pages/Admin/Students';
import Dorms from './pages/Admin/Dorms';
import Maintenance from './pages/Admin/Maintenance';
import Inventory from './pages/Admin/Inventory';
import MaintenanceDashboard from './pages/Maintenance/Dashboard';
import ManagerDashboard from './pages/Manager/Dashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StudentPortal />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="dorms" element={<Dorms />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="inventory" element={<Inventory />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Maintenance Routes */}
          <Route path="/maintenance" element={<MaintenanceLayout />}>
            <Route path="dashboard" element={<MaintenanceDashboard />} />
            <Route index element={<Navigate to="/maintenance/dashboard" replace />} />
          </Route>

          {/* Manager Routes */}
          <Route path="/manager" element={<ManagerLayout />}>
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route index element={<Navigate to="/manager/dashboard" replace />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
