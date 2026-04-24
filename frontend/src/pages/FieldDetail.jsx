import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Calendar, User, Sprout, Clock, Send, UserPlus, MessageSquare
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import StageBadge from '../components/StageBadge';
import { SkeletonCard } from '../components/Skeleton';

const STAGES = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

export default function FieldDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const toast = useToast();

    const [field, setField] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [notes, setNotes] = useState('');
    const [newStage, setNewStage] = useState('');
    const [assignId, setAssignId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        try {
            const [f, u] = await Promise.all([
                api.get(`/fields/${id}`),
                api.get(`/fields/${id}/updates`)
            ]);
            setField(f.data);
            setUpdates(u.data);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load');
        } finally { setLoading(false); }
    };

    useEffect(() => {
        load();
        if (user.role === 'ADMIN') api.get('/users/agents').then(r => setAgents(r.data));
    }, [id, user.role]);

    const submitUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/fields/${id}/updates`, { notes, newStage: newStage || null });
            setNotes(''); setNewStage('');
            toast.success('Update posted');
            load();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to submit update');
        } finally { setSubmitting(false); }
    };

    const assign = async () => {
        if (!assignId) return;
        try {
            await api.put(`/fields/${id}/assign`, { agentId: Number(assignId) });
            toast.success('Agent assigned');
            setAssignId('');
            load();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to assign');
        }
    };

    if (loading) {
        return (
            <div className="container">
                <SkeletonCard />
                <div className="mt-4"><SkeletonCard /></div>
            </div>
        );
    }
    if (!field) return null;

    const canPost = user.role === 'AGENT' && field.agentId === user.id;

    return (
        <div className="container">
            <Link to="/fields" className="btn ghost small mb-4">
                <ArrowLeft size={14} /> Back to Fields
            </Link>

            <div className="page-header flex between">
                <div>
                    <h1>{field.name}</h1>
                    <div className="flex gap-2 mt-2">
                        <StageBadge stage={field.currentStage} />
                        <StatusBadge status={field.status} />
                    </div>
                </div>
            </div>

            <div className="grid cols-2 mb-4">
                {/* Details */}
                <div className="card">
                    <h2>Field Information</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <DetailRow icon={<Sprout size={16} />} label="Crop Type" value={field.cropType} />
                        <DetailRow icon={<Calendar size={16} />} label="Planting Date" value={new Date(field.plantingDate).toLocaleDateString()} />
                        <DetailRow icon={<User size={16} />} label="Assigned Agent"
                            value={field.agentName || <span className="subtle">Unassigned</span>} />
                        <DetailRow icon={<Clock size={16} />} label="Last Update"
                            value={field.lastUpdateAt
                                ? new Date(field.lastUpdateAt).toLocaleString()
                                : <span className="subtle">Never</span>} />
                    </div>

                    {user.role === 'ADMIN' && (
                        <>
                            <div className="divider" />
                            <h3 className="mb-2"><UserPlus size={14} style={{ verticalAlign: -2, marginRight: 6 }} /> Reassign Agent</h3>
                            <div className="flex gap-2">
                                <select value={assignId} onChange={e => setAssignId(e.target.value)} style={{ flex: 1 }}>
                                    <option value="">— Select agent —</option>
                                    {agents.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                                </select>
                                <button className="btn" onClick={assign} disabled={!assignId}>Assign</button>
                            </div>
                        </>
                    )}
                </div>

                {/* Post update */}
                <div className="card">
                    <h2>Post Update</h2>
                    {!canPost ? (
                        <div className="empty-state" style={{ padding: 24 }}>
                            <div className="empty-icon"><MessageSquare size={40} /></div>
                            <h3>
                                {user.role === 'ADMIN'
                                    ? 'Only assigned agents can post updates'
                                    : 'Not assigned to this field'}
                            </h3>
                            <p>
                                {user.role === 'ADMIN'
                                    ? 'Assign an agent to enable field updates.'
                                    : 'Contact your admin for field assignment.'}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={submitUpdate}>
                            <div className="form-row">
                                <label>Notes / Observations</label>
                                <textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)}
                                    placeholder="What did you observe in the field today?" required />
                            </div>
                            <div className="form-row">
                                <label>Change Stage <span className="subtle">(optional)</span></label>
                                <select value={newStage} onChange={e => setNewStage(e.target.value)}>
                                    <option value="">— Keep current stage —</option>
                                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button className="btn" disabled={submitting}>
                                <Send size={14} /> {submitting ? 'Posting…' : 'Post Update'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="card">
                <div className="card-header">
                    <h2>Update History</h2>
                    <span className="muted">{updates.length} {updates.length === 1 ? 'update' : 'updates'}</span>
                </div>
                {updates.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><Clock size={40} /></div>
                        <h3>No updates yet</h3>
                        <p>Field updates will appear here in chronological order.</p>
                    </div>
                ) : (
                    <div className="timeline">
                        {updates.map((u) => (
                            <div key={u.id} className="timeline-item">
                                <div className="timeline-dot" />
                                <div className="timeline-content">
                                    <div className="flex between mb-2">
                                        <div className="flex gap-2">
                                            <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                                                {u.agentName.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}
                                            </div>
                                            <strong style={{ fontSize: 13 }}>{u.agentName}</strong>
                                            {u.newStage && <StageBadge stage={u.newStage} />}
                                        </div>
                                        <span className="subtle">{new Date(u.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.notes}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        .timeline { position: relative; padding-left: 24px; }
        .timeline::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 6px;
          bottom: 6px;
          width: 2px;
          background: var(--border);
        }
        .timeline-item { position: relative; padding-bottom: 18px; }
        .timeline-item:last-child { padding-bottom: 0; }
        .timeline-dot {
          position: absolute;
          left: -21px;
          top: 6px;
          width: 12px;
          height: 12px;
          background: var(--brand);
          border: 2px solid var(--surface);
          border-radius: 50%;
          box-shadow: 0 0 0 2px var(--brand-soft);
        }
        .timeline-content {
          background: var(--surface-2);
          padding: 12px 14px;
          border-radius: 8px;
        }
      `}</style>
        </div>
    );
}

function DetailRow({ icon, label, value }) {
    return (
        <div className="flex gap-2" style={{ alignItems: 'flex-start' }}>
            <div style={{
                width: 32, height: 32,
                background: 'var(--surface-2)', color: 'var(--text-muted)',
                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
            }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>
                    {label}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{value}</div>
            </div>
        </div>
    );
}