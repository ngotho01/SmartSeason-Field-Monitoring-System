import { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Layers, Activity, AlertTriangle, CheckCircle2, Users, Sprout, Clock } from 'lucide-react';
import api from '../api/axios';
import StageBadge from '../components/StageBadge';
import { SkeletonStat, SkeletonCard, SkeletonTable, SkeletonLine } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

const STATUS_COLORS = { ACTIVE: '#558b2f', AT_RISK: '#d97706', COMPLETED: '#64748b' };
const STAGE_COLORS = { PLANTED: '#0284c7', GROWING: '#558b2f', READY: '#d97706', HARVESTED: '#7c3aed' };

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        api.get('/dashboard/admin')
            .then(r => setData(r.data))
            .catch(() => toast.error('Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="container">
                <div className="page-header">
                    <h1>Admin Dashboard</h1>
                    <p className="subtitle">Overview of all fields across all agents</p>
                </div>
                <div className="grid cols-4 mb-4">
                    {[1, 2, 3, 4].map(i => <SkeletonStat key={i} />)}
                </div>
                <div className="grid cols-2">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
                <div className="mt-4"><SkeletonTable /></div>
            </div>
        );
    }
    if (!data) return null;

    const sb = data.statusBreakdown || {};
    const stg = data.stageBreakdown || {};

    const statusData = [
        { name: 'Active', value: sb.ACTIVE || 0, key: 'ACTIVE' },
        { name: 'At Risk', value: sb.AT_RISK || 0, key: 'AT_RISK' },
        { name: 'Completed', value: sb.COMPLETED || 0, key: 'COMPLETED' },
    ].filter(d => d.value > 0);

    const stageData = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'].map(s => ({
        name: s.charAt(0) + s.slice(1).toLowerCase(),
        count: stg[s] || 0,
        key: s,
    }));

    return (
        <div className="container">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p className="subtitle">Overview of all fields across all agents</p>
            </div>

            {/* Stat cards */}
            <div className="grid cols-4 mb-4">
                <StatCard icon={<Layers size={20} />} tone="brand" label="Total Fields" value={data.totalFields} />
                <StatCard icon={<Activity size={20} />} tone="success" label="Active" value={sb.ACTIVE || 0} />
                <StatCard icon={<AlertTriangle size={20} />} tone="warning" label="At Risk" value={sb.AT_RISK || 0} />
                <StatCard icon={<CheckCircle2 size={20} />} tone="neutral" label="Completed" value={sb.COMPLETED || 0} />
            </div>

            {/* Charts */}
            <div className="grid cols-2 mb-4">
                <div className="card">
                    <div className="card-header">
                        <h2>Status Distribution</h2>
                        <span className="muted">{data.totalFields} fields</span>
                    </div>
                    {statusData.length === 0 ? (
                        <EmptyMini label="No fields yet" />
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
                        <h2>Fields by Stage</h2>
                    </div>
                    <div className="chart-wrap">
                        <ResponsiveContainer>
                            <BarChart data={stageData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {stageData.map(d => <Cell key={d.key} fill={STAGE_COLORS[d.key]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Agents */}
            <div className="card mb-4">
                <div className="card-header">
                    <h2><Users size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Agents ({data.totalAgents})</h2>
                </div>
                {data.agents.length === 0 ? (
                    <EmptyMini label="No agents yet" />
                ) : (
                    <table>
                        <thead><tr><th>Agent</th><th>Fields Assigned</th></tr></thead>
                        <tbody>
                            {data.agents.map(a => (
                                <tr key={a.agentId}>
                                    <td>
                                        <div className="flex gap-2">
                                            <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                                                {a.fullName.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}
                                            </div>
                                            <strong>{a.fullName}</strong>
                                        </div>
                                    </td>
                                    <td>{a.fieldCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Recent updates */}
            <div className="card">
                <div className="card-header">
                    <h2><Clock size={16} style={{ verticalAlign: -3, marginRight: 6 }} /> Recent Updates</h2>
                </div>
                {data.recentUpdates.length === 0 ? (
                    <EmptyState
                        icon={<Sprout size={40} />}
                        title="No updates yet"
                        text="Updates will appear here as agents log observations."
                    />
                ) : (
                    <table>
                        <thead><tr><th>Field</th><th>Agent</th><th>Notes</th><th>Stage</th><th>When</th></tr></thead>
                        <tbody>
                            {data.recentUpdates.map(u => (
                                <tr key={u.id}>
                                    <td><strong>{u.fieldName}</strong></td>
                                    <td>{u.agentName}</td>
                                    <td style={{ maxWidth: 300, color: 'var(--text-muted)' }}>{u.notes}</td>
                                    <td>{u.newStage ? <StageBadge stage={u.newStage} /> : <span className="subtle">—</span>}</td>
                                    <td className="muted">{timeAgo(u.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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

function EmptyState({ icon, title, text }) {
    return (
        <div className="empty-state">
            <div className="empty-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{text}</p>
        </div>
    );
}

function EmptyMini({ label }) {
    return <p className="muted text-center" style={{ padding: '40px 0' }}>{label}</p>;
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
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString();
}