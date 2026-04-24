import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin, ArrowRight, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import StageBadge from '../components/StageBadge';
import { SkeletonTable } from '../components/Skeleton';

export default function FieldList() {
    const { user } = useAuth();
    const toast = useToast();
    const [fields, setFields] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [form, setForm] = useState({ name: '', cropType: '', plantingDate: '', agentId: '' });
    const [submitting, setSubmitting] = useState(false);

    const load = () =>
        api.get('/fields')
            .then(r => setFields(r.data))
            .catch(() => toast.error('Failed to load fields'))
            .finally(() => setLoading(false));

    useEffect(() => {
        load();
        if (user.role === 'ADMIN') api.get('/users/agents').then(r => setAgents(r.data));
    }, [user.role]);

    const createField = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/fields', { ...form, agentId: form.agentId || null });
            setForm({ name: '', cropType: '', plantingDate: '', agentId: '' });
            setShowForm(false);
            toast.success('Field created');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create field');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = useMemo(() => {
        return fields.filter(f => {
            if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                return f.name.toLowerCase().includes(q) ||
                    f.cropType.toLowerCase().includes(q) ||
                    (f.agentName && f.agentName.toLowerCase().includes(q));
            }
            return true;
        });
    }, [fields, search, statusFilter]);

    return (
        <div className="container">
            <div className="page-header flex between">
                <div>
                    <h1>Fields</h1>
                    <p className="subtitle">
                        {user.role === 'ADMIN' ? 'Manage all fields and assignments' : 'Your assigned fields'}
                    </p>
                </div>
                {user.role === 'ADMIN' && (
                    <button className="btn" onClick={() => setShowForm(!showForm)}>
                        {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Field</>}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card mb-4">
                    <h2>Create New Field</h2>
                    <form onSubmit={createField}>
                        <div className="grid cols-2">
                            <div className="form-row">
                                <label>Field Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g., North Block A" required />
                            </div>
                            <div className="form-row">
                                <label>Crop Type</label>
                                <input value={form.cropType} onChange={e => setForm({ ...form, cropType: e.target.value })}
                                    placeholder="e.g., Maize" required />
                            </div>
                            <div className="form-row">
                                <label>Planting Date</label>
                                <input type="date" value={form.plantingDate}
                                    onChange={e => setForm({ ...form, plantingDate: e.target.value })} required />
                            </div>
                            <div className="form-row">
                                <label>Assign Agent (optional)</label>
                                <select value={form.agentId} onChange={e => setForm({ ...form, agentId: e.target.value })}>
                                    <option value="">— Unassigned —</option>
                                    {agents.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn" disabled={submitting}>
                                {submitting ? 'Creating…' : 'Create Field'}
                            </button>
                            <button type="button" className="btn secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="card mb-4" style={{ padding: 12 }}>
                <div className="flex gap-2">
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} style={{
                            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-subtle)', pointerEvents: 'none'
                        }} />
                        <input
                            placeholder="Search fields, crops, agents..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: 36 }}
                        />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
                        <option value="ALL">All statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="AT_RISK">At Risk</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <SkeletonTable rows={6} />
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon"><MapPin size={40} /></div>
                        <h3>{fields.length === 0 ? 'No fields yet' : 'No matching fields'}</h3>
                        <p>
                            {fields.length === 0
                                ? (user.role === 'ADMIN' ? 'Create your first field to get started.' : 'No fields assigned to you yet.')
                                : 'Try adjusting your search or filters.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th><th>Crop</th><th>Planted</th>
                                <th>Stage</th><th>Status</th><th>Agent</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(f => (
                                <tr key={f.id}>
                                    <td><strong>{f.name}</strong></td>
                                    <td>{f.cropType}</td>
                                    <td className="muted">{new Date(f.plantingDate).toLocaleDateString()}</td>
                                    <td><StageBadge stage={f.currentStage} /></td>
                                    <td><StatusBadge status={f.status} /></td>
                                    <td>{f.agentName || <span className="subtle">Unassigned</span>}</td>
                                    <td>
                                        <Link to={`/fields/${f.id}`} className="btn ghost small">
                                            Open <ArrowRight size={13} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}