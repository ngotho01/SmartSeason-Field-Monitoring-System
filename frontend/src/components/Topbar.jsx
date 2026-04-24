export default function Topbar({ title, subtitle, actions }) {
    return (
        <div className="topbar">
            <div>
                <div className="page-title">{title}</div>
                {subtitle && <div className="page-sub">{subtitle}</div>}
            </div>
            {actions && <div className="flex gap-8">{actions}</div>}
        </div>
    );
}