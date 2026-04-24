import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Sprout, LogOut, Leaf, Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();

    if (!user) return null;

    const initials = user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const handleLogout = () => { logout(); nav('/login'); };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="logo"><Leaf size={18} /></div>
                <span>SmartSeason</span>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-label">Main</div>
                <NavLink to="/" end>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/fields">
                    <Sprout size={18} />
                    <span>Fields</span>
                </NavLink>
                {user.role === 'ADMIN' && (
                    <>
                        <div className="nav-label">Admin</div>
                        <NavLink to="/agents">
                            <Users size={18} />
                            <span>Agents</span>
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="avatar">{initials}</div>
                <div className="user-info">
                    <div className="name">{user.fullName}</div>
                    <div className="role">{user.role}</div>
                </div>
                <button className="icon-btn" title="Logout" onClick={handleLogout}>
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
}