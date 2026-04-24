import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Layers, Activity, AlertTriangle, CheckCircle2, Clock, Sprout } from 'lucide-react';
import api from '../api/axios';
import StageBadge from '../components/StageBadge';
import { SkeletonStat, SkeletonCard, SkeletonTable, SkeletonLine } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

const STATUS_COLORS = { ACTIVE: '#558b2f', AT_RISK: '#d97706', COMPLETED: '#64748b' };

export default function AgentDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        api.get('/dashboard/agent')
            .then(r => setData(r.data))
            .catch(() => toast.error('Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="container">
                <div className="page-header">
                    <h1>My Dashboard</h1>
                    <p className="subtitle">Overview of your assigned fields</p>
                </div>
                <div className="grid cols-4 mb-4">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
                <SkeletonCard />
            </div>
        );
    }
    if (!data) return null;

    const sb = data.statusBreakdown || {};
    const statusData = [
        { name: 'Active', value: sb.ACTIVE || 0, key: 'ACTIVE' },
        { name: 'At Risk', value: sb.AT_RISK || 0, key: 'AT_RISK' },
        { name: 'Completed', value: sb.COMPLETED || 0, key: 'COMPLETED' },
    ].filter(d => d.value > 0);

    return (
        <div className="container">
            <div className="page-header">
                <h1>My Dashboard</h1>
                <p className="subtitle">Overview of your assigned fields</p>
            </div>

            <div className="grid cols-4 mb-4">
                <StatCard icon={<Layers size={20} />} tone="brand" label="Assigned" value={data.assignedFields} />
                <StatCard icon={<Activity size={20} />} tone="success" label="Active" value={sb.ACTIVE || 0} />
                <StatCard icon={<AlertTriangle size={20} />} tone="warning" label="At Risk" value={sb.AT_RISK || 0} />
                <StatCard icon={<CheckCircle2 size={20} />} tone="neutral" label="Completed" value={sb.COMPLETED || 0} />
            </div>

            <div className="grid cols-2">
                <div className="card">
                    <div className="card-header"><h2>Status Distribution</h2></div>
                    {statusData.length === 0 ? (
                        <p className="muted text-center" style={{ padding: '60px 0' }}>No fields assigned.</p>
                    ) : (
                        <div className="chart-wrap">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={statusData} dataKey="value" nameKey="name"
                                        cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                                        {statusData.map((d) => (
                                            <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2><Clock size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Recent Updates</h2>
                    </div>
                    {data.recentUpdates.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><Sprout size={40} /></div>
                            <h3>No updates yet</h3>
                            <p>Post an observation from a field to see it here.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.recentUpdates.map(u => (
                                <div key={u.id} style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 8 }}>
                                    <div className="flex between mb-2">
                                        <strong style={{ fontSize: 13 }}>{u.fieldName}</strong>
                                        <span className="subtle">{timeAgo(u.createdAt)}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: u.newStage ? 8 : 0 }}>
                                        {u.notes}
                                    </p>
                                    {u.newStage && <StageBadge stage={u.newStage} />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, tone, label, value }) {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${tone}`}>{icon}</div>
            <div className="stat-body">
                <div className="label">{label}</div>
                <div className="value">{value}</div>
            </div>
        </div>
    );
}

const tooltipStyle = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 12,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)'
};

function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(iso).toLocaleDateString();
}