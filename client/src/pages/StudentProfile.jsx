import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function StudentProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const role = localStorage.getItem("role") || "Student";
    const username = localStorage.getItem("username") || "";

    const [student, setStudent]       = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [marks, setMarks]           = useState([]);
    const [fees, setFees]             = useState([]);
    const [loading, setLoading]       = useState(true);

    useEffect(() => {
        loadProfileData();
    }, [id]);

    const loadProfileData = async () => {
        setLoading(true);
        try {
            const [sListRes, aRes, mRes, fRes] = await Promise.all([
                api.get("/students"),
                api.get("/attendance"),
                api.get("/marks"),
                api.get("/fees"),
            ]);

            const allStudents = sListRes.data;
            let targetStudent = null;

            if (id) {
                targetStudent = allStudents.find(s => String(s.id) === String(id));
                if (!targetStudent) {
                    try {
                        const singleRes = await api.get(`/students/${id}`);
                        targetStudent = singleRes.data;
                    } catch {}
                }
            } else {
                // Find matching student by username or first student as fallback
                targetStudent = allStudents.find(s =>
                    s.studentId?.toLowerCase() === username.toLowerCase() ||
                    s.name?.toLowerCase().includes(username.toLowerCase()) ||
                    s.email?.toLowerCase().includes(username.toLowerCase())
                ) || allStudents[0];
            }

            if (targetStudent) {
                setStudent(targetStudent);
                const sId = targetStudent.id;
                setAttendance(aRes.data.filter(a => String(a.studentId) === String(sId) || a.name === targetStudent.name));
                setMarks(mRes.data.filter(m => String(m.studentId) === String(sId) || m.name === targetStudent.name));
                setFees(fRes.data.filter(f => String(f.studentId) === String(sId) || f.name === targetStudent.name));
            }
        } catch (err) {
            console.error("Profile load error:", err);
        } finally {
            setLoading(false);
        }
    };

    const presentCount   = attendance.filter(a => a.status === "Present").length;
    const totalSessions  = attendance.length;
    const attendancePct  = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : 0;
    const averageMarks   = marks.length > 0 ? (marks.reduce((s, m) => s + Number(m.marks), 0) / marks.length).toFixed(1) : 0;
    const totalFeesDue   = fees.reduce((s, f) => s + Number(f.balance || 0), 0);

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{role === "Student" ? "Student Dashboard" : "Student Profile"}</h1>
                        <p className="page-subtitle">Academic trajectory, attendance performance, and enrollment records</p>
                    </div>
                    {role !== "Student" && (
                        <button className="btn btn-secondary" onClick={() => navigate("/students")}>
                            ← Back to Directory
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="empty-state" style={{ padding: "80px 0" }}>
                        <div className="animate-spin" style={{ fontSize: "2.5rem", marginBottom: 12 }}>⏳</div>
                        <div className="empty-state-title">Loading Academic Records...</div>
                    </div>
                ) : student ? (
                    <>
                        {/* Profile Hero Header Card */}
                        <div className="card" style={{ marginBottom: 24, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
                            <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                                {student.photo ? (
                                    <img
                                        src={`http://localhost:5000/uploads/${student.photo}`}
                                        alt={student.name}
                                        style={{ width: 104, height: 104, borderRadius: "50%", objectFit: "cover", border: "4px solid #3b82f6", boxShadow: "0 4px 14px rgba(59,130,246,0.2)" }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 104, height: 104, borderRadius: "50%",
                                        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "white", fontSize: "2.8rem", fontWeight: 800,
                                        boxShadow: "0 4px 14px rgba(59,130,246,0.3)", flexShrink: 0
                                    }}>
                                        {student.name?.[0]?.toUpperCase() || "S"}
                                    </div>
                                )}

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                                        <h2 style={{ fontWeight: 800, fontSize: "1.6rem", letterSpacing: "-0.02em" }}>{student.name}</h2>
                                        <span className="badge badge-blue">{student.department} Department</span>
                                        <span className="badge badge-gray">Year {student.year} (Semester {(student.year * 2) - 1})</span>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 12 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
                                            <span>🆔</span>
                                            <span style={{ color: "var(--text-muted)" }}>Roll No:</span>
                                            <code style={{ fontWeight: 700, background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>{student.studentId}</code>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
                                            <span>📧</span>
                                            <span style={{ color: "var(--text-muted)" }}>Email:</span>
                                            <span style={{ fontWeight: 600 }}>{student.email || "N/A"}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
                                            <span>🎓</span>
                                            <span style={{ color: "var(--text-muted)" }}>Status:</span>
                                            <span className="badge badge-green">● Enrolled Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* KPI Metrics */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                            {[
                                {
                                    label: "Attendance Rate",
                                    value: `${attendancePct}%`,
                                    icon: "📅",
                                    color: Number(attendancePct) >= 75 ? "#10b981" : "#ef4444",
                                    bg: Number(attendancePct) >= 75 ? "#d1fae5" : "#fee2e2",
                                    sub: `${presentCount} of ${totalSessions} sessions attended`
                                },
                                {
                                    label: "Cumulative Average",
                                    value: `${averageMarks}%`,
                                    icon: "📝",
                                    color: Number(averageMarks) >= 60 ? "#8b5cf6" : "#f59e0b",
                                    bg: Number(averageMarks) >= 60 ? "#ede9fe" : "#fef3c7",
                                    sub: `Across ${marks.length} evaluated subjects`
                                },
                                {
                                    label: "Tuition Balance",
                                    value: `₹${totalFeesDue.toLocaleString()}`,
                                    icon: "💳",
                                    color: totalFeesDue === 0 ? "#10b981" : "#ef4444",
                                    bg: totalFeesDue === 0 ? "#d1fae5" : "#fee2e2",
                                    sub: totalFeesDue === 0 ? "All dues fully cleared" : "Outstanding balance due"
                                },
                            ].map(c => (
                                <div key={c.label} className="stat-card">
                                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color, borderRadius: "var(--radius) var(--radius) 0 0" }} />
                                    <div className="stat-card-icon" style={{ background: c.bg }}>{c.icon}</div>
                                    <div>
                                        <div className="stat-card-value">{c.value}</div>
                                        <div className="stat-card-label">{c.label}</div>
                                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>{c.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Marks & Attendance Side-by-Side Tables */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
                            {/* Academic Grades Table */}
                            <div className="card">
                                <div className="card-header">
                                    <span className="card-title">📝 Subject Assessment Results</span>
                                    <span className="badge badge-purple">{marks.length} Records</span>
                                </div>
                                <div className="data-table-container" style={{ boxShadow: "none", border: "1px solid var(--border)" }}>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Course Subject</th>
                                                <th>Score</th>
                                                <th>Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marks.length > 0 ? marks.map(m => {
                                                const score = Number(m.marks);
                                                const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : score >= 50 ? "D" : "F";
                                                const badgeClass = score >= 80 ? "badge-green" : score >= 60 ? "badge-blue" : score >= 50 ? "badge-yellow" : "badge-red";
                                                return (
                                                    <tr key={m.id}>
                                                        <td style={{ fontWeight: 600 }}>{m.subject}</td>
                                                        <td>
                                                            <span style={{ fontWeight: 700, color: score >= 60 ? "#16a34a" : "#dc2626" }}>{m.marks}</span> / 100
                                                        </td>
                                                        <td><span className={`badge ${badgeClass}`}>{grade}</span></td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr><td colSpan="3"><div className="empty-state"><div className="empty-state-icon">📝</div><div className="empty-state-title">No grades published</div></div></td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Attendance History */}
                            <div className="card">
                                <div className="card-header">
                                    <span className="card-title">📅 Class Attendance Log</span>
                                    <span className="badge badge-green">{presentCount} Present</span>
                                </div>
                                <div className="data-table-container" style={{ boxShadow: "none", border: "1px solid var(--border)" }}>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Log Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendance.length > 0 ? attendance.map(a => (
                                                <tr key={a.id}>
                                                    <td style={{ color: "var(--text-muted)" }}>{a.date}</td>
                                                    <td>
                                                        <span className={`badge ${a.status === "Present" ? "badge-green" : "badge-red"}`}>
                                                            {a.status === "Present" ? "● Present" : "● Absent"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="2"><div className="empty-state"><div className="empty-state-icon">📅</div><div className="empty-state-title">No attendance recorded</div></div></td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">🎓</div>
                            <div className="empty-state-title">No Student Profile Linked</div>
                            <div className="empty-state-desc">Your user account is not directly linked to an enrolled student record yet.</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentProfile;