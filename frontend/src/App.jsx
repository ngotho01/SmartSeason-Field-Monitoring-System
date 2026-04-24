import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import FieldList from './pages/FieldList';
import FieldDetail from './pages/FieldDetail';
import AgentsPage from './pages/AgentsPage';

function HomeRedirect() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return user.role === 'ADMIN' ? <AdminDashboard /> : <AgentDashboard />;
}

export default function App() {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    if (isLogin) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
            </Routes>
        );
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
                <Route path="/fields" element={<ProtectedRoute><FieldList /></ProtectedRoute>} />
                <Route path="/fields/:id" element={<ProtectedRoute><FieldDetail /></ProtectedRoute>} />
                <Route path="/agents" element={<ProtectedRoute roles={['ADMIN']}><AgentsPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}