function DashboardCards({ title, value, icon, bg, accent }) {
    return (
        <div className="stat-card" style={{ "--accent-color": accent }}>
            <div style={{ "::before": { background: accent } }} />
            <div
                className="stat-card-icon"
                style={{ background: bg || "#eff6ff" }}
            >
                {icon}
            </div>
            <div>
                <div className="stat-card-value">{value}</div>
                <div className="stat-card-label">{title}</div>
            </div>
            {/* Top accent bar */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: accent || "var(--primary)",
                borderRadius: "var(--radius) var(--radius) 0 0"
            }} />
        </div>
    );
}

export default DashboardCards;