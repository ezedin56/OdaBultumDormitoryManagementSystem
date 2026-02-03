import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import StudentPortal from './pages/StudentPortal';
import AdminLayout from './components/Layout/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Students from './pages/Admin/Students';
import Dorms from './pages/Admin/Dorms';
import Reports from './pages/Admin/Reports';
import Settings from './pages/Admin/Settings';
import AdminManagement from './pages/Admin/AdminManagement';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];
  const hasPermission = userPermissions.includes('*') || userPermissions.includes(requiredPermission);
  
  if (!hasPermission) {
    return <Navigate to="/admin/redirect" replace />;
  }
  
  return children;
};

// Smart Redirect Component - redirects to first available page
const SmartRedirect = () => {
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];
  const hasPermission = (permission) => userPermissions.includes('*') || userPermissions.includes(permission);
  
  // Check permissions in order and redirect to first available
  if (hasPermission('dashboard.view')) return <Navigate to="/admin/dashboard" replace />;
  if (hasPermission('students.view')) return <Navigate to="/admin/students" replace />;
  if (hasPermission('dorms.view')) return <Navigate to="/admin/dorms" replace />;
  if (hasPermission('reports.view')) return <Navigate to="/admin/reports" replace />;
  if (hasPermission('admins.view')) return <Navigate to="/admin/admin-management" replace />;
  
  // If no permissions, show access denied
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</h1>
      <h2 style={{ marginBottom: '0.5rem' }}>Access Denied</h2>
      <p style={{ color: '#64748b' }}>You don't have permission to access any admin pages.</p>
      <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Please contact your administrator.</p>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StudentPortal />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="redirect" element={<SmartRedirect />} />
            <Route path="dashboard" element={
              <ProtectedRoute requiredPermission="dashboard.view">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="students" element={
              <ProtectedRoute requiredPermission="students.view">
                <Students />
              </ProtectedRoute>
            } />
            <Route path="dorms" element={
              <ProtectedRoute requiredPermission="dorms.view">
                <Dorms />
              </ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute requiredPermission="reports.view">
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute requiredPermission="dashboard.view">
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="admin-management" element={
              <ProtectedRoute requiredPermission="admins.view">
                <AdminManagement />
              </ProtectedRoute>
            } />
            <Route index element={<SmartRedirect />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
