export default function EmptyState({ icon, title, message, action }) {
    return (
        <div className="empty-state">
            {icon && <div className="icon">{icon}</div>}
            <h3 style={{ color: 'var(--gray-700)', marginBottom: 4 }}>{title}</h3>
            {message && <p className="muted">{message}</p>}
            {action && <div className="mt-16">{action}</div>}
        </div>
    );
}