import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await login(username, password);
            nav('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally { setLoading(false); }
    };

    return (
        <div className="login-wrap">
            <div className="login-card">
                <div className="brand-logo"><Sprout size={24} /></div>
                <h1>Welcome back</h1>
                <p className="tagline">Sign in to SmartSeason Field Monitoring</p>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={submit}>
                    <div className="form-row">
                        <label>Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your.username"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-row">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button className="btn large full" disabled={loading}>
                        {loading ? <><Loader2 size={16} className="spin" /> Signing in…</> : 'Sign in'}
                    </button>
                </form>

                <div className="demo-creds">
                    <strong>Demo accounts</strong><br />
                    Admin: <code>admin</code> / <code>admin123</code><br />
                    Agent: <code>agent1</code> / <code>agent123</code>
                </div>
            </div>

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}