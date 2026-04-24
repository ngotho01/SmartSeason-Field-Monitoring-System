export function SkeletonLine({ width = '100%' }) {
    return <div className="skeleton skeleton-line" style={{ width }} />;
}

export function SkeletonStat() {
    return (
        <div className="stat-card">
            <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-line short" style={{ height: 12 }} />
                <div className="skeleton skeleton-line medium" style={{ height: 24, marginTop: 8 }} />
            </div>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
        </div>
    );
}

export function SkeletonCard({ lines = 4 }) {
    return (
        <div className="card">
            <div className="card-body">
                {[...Array(lines)].map((_, i) => (
                    <div
                        key={i}
                        className="skeleton skeleton-line"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
    return (
        <div className="card">
            <div className="card-body">
                {[...Array(rows)].map((_, r) => (
                    <div key={r} className="flex gap-16" style={{ marginBottom: 12 }}>
                        {[...Array(cols)].map((_, c) => (
                            <div key={c} className="skeleton skeleton-line" style={{ flex: 1, height: 16 }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}