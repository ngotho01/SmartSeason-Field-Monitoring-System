import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, LayoutDashboard, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const { pathname } = useLocation();
    if (!user) return null;

    const initials = (user.fullName || user.username)
        .split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();

    const handleLogout = () => { logout(); nav('/login'); };

    const isActive = (path) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    return (
        <div className="navbar">
            <div className="flex" style={{ flex: 1 }}>
                <div className="brand">
                    <div className="brand-icon"><Sprout size={18} /></div>
                    SmartSeason
                </div>
                <nav>
                    <Link to="/" className={isActive('/') ? 'active' : ''}>
                        <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/fields" className={isActive('/fields') ? 'active' : ''}>
                        <MapPin size={15} /> Fields
                    </Link>
                </nav>
            </div>

            <div className="nav-right">
                <div className="user-chip">
                    <div className="avatar">{initials}</div>
                    <div>
                        <div className="name">{user.fullName}</div>
                        <div className="role">{user.role}</div>
                    </div>
                </div>
                <button className="btn ghost small" onClick={handleLogout} title="Sign out">
                    <LogOut size={14} /> Sign out
                </button>
            </div>
        </div>
    );
}