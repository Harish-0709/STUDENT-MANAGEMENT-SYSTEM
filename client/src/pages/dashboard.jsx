import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import DashboardCards from "../dashboard/DashboardCards";
import DepartmentChart from "../dashboard/DepartmentChart";
import AttendanceChart from "../dashboard/AttendanceChart";

function Dashboard() {
    const navigate = useNavigate();
    const role     = localStorage.getItem("role") || "Faculty";
    const username = localStorage.getItem("username") || "User";

    const [students, setStudents]           = useState([]);
    const [attendance, setAttendance]       = useState([]);
    const [marks, setMarks]                 = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [dashboard, setDashboard]         = useState({ totalStudents: 0, totalAttendance: 0, totalMarks: 0, pendingLeaves: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sRes, aRes, mRes, dRes, anRes] = await Promise.all([
                api.get("/students"),
                api.get("/attendance"),
                api.get("/marks"),
                api.get("/dashboard"),
                api.get("/announcements"),
            ]);
            setStudents(sRes.data);
            setAttendance(aRes.data);
            setMarks(mRes.data);
            setDashboard(dRes.data);
            setAnnouncements(anRes.data);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        }
    };

    const avgMarks = marks.length === 0 ? 0 : (marks.reduce((s, i) => s + Number(i.marks), 0) / marks.length).toFixed(1);

    const statCards = [
        { title: "Enrolled Students",  value: dashboard.totalStudents,    icon: "🎓", color: "#3b82f6", bg: "#dbeafe",  accent: "#3b82f6" },
        { title: "Attendance Logs",   value: dashboard.totalAttendance,  icon: "📅", color: "#10b981", bg: "#dcfce7",  accent: "#10b981" },
        { title: "Evaluated Marks",   value: dashboard.totalMarks,       icon: "📝", color: "#8b5cf6", bg: "#ede9fe",  accent: "#8b5cf6" },
        { title: "Campus GPA Avg",    value: `${avgMarks}%`,             icon: "⭐", color: "#f59e0b", bg: "#fef9c3",  accent: "#f59e0b" },
        { title: "Pending Leaves",    value: dashboard.pendingLeaves,    icon: "🌴", color: "#ef4444", bg: "#fee2e2",  accent: "#ef4444" },
    ];

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                {/* Header with Quick Actions */}
                <div className="page-header">
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <h1 className="page-title">
                                {role === "Admin" ? "Administrative Dashboard" : "Faculty Teaching Portal"}
                            </h1>
                            <span className="badge badge-purple">{role} Level Access</span>
                        </div>
                        <p className="page-subtitle">Welcome back, <strong>{username}</strong> 👋 Here is your campus overview today.</p>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {role === "Admin" ? (
                            <>
                                <button className="btn btn-primary btn-sm" onClick={() => navigate("/add-student")}>+ Enroll Student</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate("/allocation")}>⚡ Seating Plan</button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-primary btn-sm" onClick={() => navigate("/attendance")}>📅 Mark Attendance</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate("/assignments")}>📌 Post Assignment</button>
                            </>
                        )}
                    </div>
                </div>

                {/* KPI Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
                    {statCards.map(card => (
                        <DashboardCards key={card.title} {...card} />
                    ))}
                </div>

                {/* Charts */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20, marginBottom: 28 }}>
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">📊 Department Enrollment</span>
                            <span className="badge badge-blue">{students.length} Total</span>
                        </div>
                        <DepartmentChart students={students} />
                    </div>
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">📅 Campus Attendance Trend</span>
                            <span className="badge badge-green">{attendance.length} Sessions</span>
                        </div>
                        <AttendanceChart attendance={attendance} />
                    </div>
                </div>

                {/* Recent Students & Announcements Feed */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
                    {/* Recent Students */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🎓 Recently Enrolled Students</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/students")}>View All →</button>
                        </div>
                        <div className="data-table-container" style={{ boxShadow: "none", border: "1px solid var(--border)" }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Department</th>
                                        <th>Year</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.slice(-5).reverse().map(s => (
                                        <tr key={s.id}>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div className="avatar avatar-sm">{s.name?.[0] || "S"}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{s.name}</div>
                                                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{s.studentId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-blue">{s.department}</span></td>
                                            <td><span className="badge badge-gray">Year {s.year}</span></td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr><td colSpan="3"><div className="empty-state"><div className="empty-state-title">No students enrolled</div></div></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Announcements Activity Feed */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">📢 Campus Bulletins & Notices</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/announcements")}>All Notices →</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {announcements.length > 0 ? announcements.slice(0, 4).map(item => (
                                <div key={item.id} style={{ padding: "14px", background: "var(--surface-2)", borderRadius: 10, borderLeft: "4px solid var(--primary)" }}>
                                    <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{item.title}</div>
                                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{item.message}</div>
                                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 6, fontWeight: 600 }}>📅 {item.createdAt}</div>
                                </div>
                            )) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📢</div>
                                    <div className="empty-state-title">No notices published</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;