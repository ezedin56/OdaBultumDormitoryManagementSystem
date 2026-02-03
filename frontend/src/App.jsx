import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import StudentPortal from './pages/StudentPortal';
import AdminLayout from './components/Layout/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Students from './pages/Admin/Students';
import Dorms from './pages/Admin/Dorms';
import Inventory from './pages/Admin/Inventory';
import Reports from './pages/Admin/Reports';
import Settings from './pages/Admin/Settings';
import AdminManagement from './pages/Admin/AdminManagement';
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
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="admin-management" element={<AdminManagement />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
