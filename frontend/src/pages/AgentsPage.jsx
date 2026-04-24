import { useEffect, useState } from 'react';
import { Plus, Trash2, User as UserIcon, Users, KeyRound } from 'lucide-react';
import api from '../api/axios';
import Topbar from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

export default function AgentsPage() {
    const toast = useToast();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ username: '', fullName: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const load = () => {
        setLoading(true);
        api.get('/users/agents/detailed')
            .then(r => setAgents(r.data))
            .catch(() => toast.error('Load failed', 'Could not fetch agents'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

    const createAgent = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error('Invalid password', 'Must be at least 6 characters');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/users/agents', form);
            toast.success('Agent created', `${form.fullName} can now sign in`);
            setForm({ username: '', fullName: '', password: '' });
            setShowForm(false);
            load();
        } catch (err) {
            toast.error('Failed to create', err.response?.data?.message || 'Unknown error');
        } finally { setSubmitting(false); }
    };

    const deleteAgent = async (agent) => {
        if (!confirm(`Delete agent "${agent.fullName}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/users/agents/${agent.id}`);
            toast.success('Agent deleted');
            load();
        } catch (err) {
            toast.error('Failed to delete', err.response?.data?.message || 'Unknown error');
        }
    };

    const actions = (
        <button className="btn" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> {showForm ? 'Cancel' : 'New Agent'}
        </button>
    );

    return (
        <>
            <Topbar title="Agents" subtitle="Manage field agents" actions={actions} />
            <div className="page">
                {showForm && (
                    <div className="card mb-20">
                        <div className="card-header"><h2>Create a new agent</h2></div>
                        <div className="card-body">
                            <form onSubmit={createAgent}>
                                <div className="grid cols-3">
                                    <div className="form-row">
                                        <label>Full name</label>
                                        <input
                                            value={form.fullName}
                                            onChange={e => setForm({ ...form, fullName: e.target.value })}
                                            required
                                            placeholder="e.g. Mary Wanjiku"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Username</label>
                                        <input
                                            value={form.username}
                                            onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().trim() })}
                                            required
                                            minLength={3}
                                            placeholder="e.g. mary"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label>Temporary password</label>
                                        <input
                                            type="text"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            required
                                            minLength={6}
                                            placeholder="min 6 characters"
                                        />
                                    </div>
                                </div>
                                <p className="muted" style={{ fontSize: 12, marginBottom: 14 }}>
                                    <KeyRound size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    Share the temporary password securely. The agent should change it after first login.
                                </p>
                                <div className="flex gap-8">
                                    <button className="btn" disabled={submitting}>
                                        {submitting ? 'Creating…' : 'Create Agent'}
                                    </button>
                                    <button type="button" className="btn secondary" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="card">
                    <div className="card-header">
                        <h2>All Agents</h2>
                        <span className="muted" style={{ fontSize: 12 }}>
                            <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            {agents.length} total
                        </span>
                    </div>

                    {loading ? (
                        <SkeletonTable rows={4} cols={4} />
                    ) : agents.length === 0 ? (
                        <EmptyState
                            icon={<UserIcon size={22} />}
                            title="No agents yet"
                            message="Add your first field agent to start assigning fields."
                        />
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Agent</th>
                                        <th>Username</th>
                                        <th style={{ textAlign: 'right' }}>Assigned Fields</th>
                                        <th style={{ width: 60 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agents.map(a => (
                                        <tr key={a.id}>
                                            <td>
                                                <div className="flex gap-8">
                                                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                                                        {a.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                                    </div>
                                                    <strong>{a.fullName}</strong>
                                                </div>
                                            </td>
                                            <td className="muted">@{a.username}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{a.fieldCount}</td>
                                            <td>
                                                <button
                                                    className="btn ghost sm"
                                                    title={a.fieldCount > 0 ? 'Reassign fields first' : 'Delete agent'}
                                                    onClick={() => deleteAgent(a)}
                                                    disabled={a.fieldCount > 0}
                                                    style={{ color: a.fieldCount > 0 ? 'var(--gray-300)' : 'var(--danger)' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}