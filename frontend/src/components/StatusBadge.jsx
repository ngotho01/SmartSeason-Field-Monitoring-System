export default function StatusBadge({ status }) {
    const cls = status === 'AT_RISK' ? 'at-risk' : status === 'COMPLETED' ? 'completed' : 'active';
    const label = status === 'AT_RISK' ? 'At Risk' : status === 'COMPLETED' ? 'Completed' : 'Active';
    return (
        <span className={`badge ${cls}`}>
            <span className="dot" />
            {label}
        </span>
    );
}