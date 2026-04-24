export default function StatCard({ label, value, icon, iconColor = 'green', trend }) {
    return (
        <div className="stat-card">
            <div>
                <div className="label">{label}</div>
                <div className="value">{value}</div>
                {trend && <div className="trend">{trend}</div>}
            </div>
            <div className={`stat-icon ${iconColor}`}>{icon}</div>
        </div>
    );
}