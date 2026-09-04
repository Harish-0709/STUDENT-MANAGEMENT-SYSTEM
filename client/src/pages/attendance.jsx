import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import CsvUploadModal from "../components/CsvUploadModal";
import { toast } from "../components/Toast";

function Attendance() {
    const role = localStorage.getItem("role") || "Student";
    const username = localStorage.getItem("username") || "";

    const [students, setStudents]     = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [studentId, setStudentId]   = useState("");
    const [date, setDate]             = useState(new Date().toISOString().split("T")[0]);
    const [status, setStatus]         = useState("Present");
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const [search, setSearch]         = useState("");

    useEffect(() => {
        fetchStudents();
        fetchAttendance();
    }, []);

    const fetchStudents = async () => {
        try {
            const r = await api.get("/students");
            setStudents(r.data);
            if (r.data.length > 0 && !studentId) {
                setStudentId(r.data[0].id);
            }
        } catch {}
    };

    const fetchAttendance = async () => {
        try {
            const r = await api.get("/attendance");
            setAttendance(r.data);
        } catch {}
    };

    const saveAttendance = async (e) => {
        e.preventDefault();
        try {
            await api.post("/attendance", { studentId, date, status });
            toast.success("Attendance saved successfully");
            fetchAttendance();
        } catch {
            toast.error("Unable to save attendance");
        }
    };

    // Filter attendance for student role
    const displayedAttendance = (role === "Student")
        ? attendance.filter(a => a.name?.toLowerCase().includes(username.toLowerCase()) || a.studentId?.toString() === username)
        : attendance.filter(a =>
            a.name?.toLowerCase().includes(search.toLowerCase()) ||
            a.date?.includes(search) ||
            a.status?.toLowerCase().includes(search.toLowerCase())
        );

    const presentCount = displayedAttendance.filter(a => a.status === "Present").length;
    const absentCount  = displayedAttendance.filter(a => a.status === "Absent").length;
    const totalCount   = displayedAttendance.length;
    const percentage   = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

    const markBatchAll = async (targetStatus) => {
        if (!date) { toast.warning("Please select a date"); return; }
        if (students.length === 0) { toast.warning("No students available to mark"); return; }
        if (!window.confirm(`Mark ALL ${students.length} students as ${targetStatus} for date ${date}?`)) return;

        try {
            await Promise.all(
                students.map(s => api.post("/attendance", { studentId: s.id, date, status: targetStatus }))
            );
            toast.success(`Successfully marked all ${students.length} students as ${targetStatus}!`);
            fetchAttendance();
        } catch {
            toast.error("Error marking batch attendance");
        }
    };

    const lowAttendanceWarning = role === "Student" && Number(percentage) < 75 && totalCount > 0;

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{role === "Student" ? "My Attendance" : "Attendance Management"}</h1>
                        <p className="page-subtitle">
                            {role === "Student"
                                ? "View your personal class attendance history and percentage"
                                : "Track, batch mark, and export student attendance across departments"}
                        </p>
                    </div>
                    {role !== "Student" && (
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button className="btn btn-success btn-sm" onClick={() => markBatchAll("Present")}>⚡ Mark All Present</button>
                            <button className="btn btn-danger btn-sm" onClick={() => markBatchAll("Absent")}>⚡ Mark All Absent</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setCsvModalOpen(true)}>⬆️ Import CSV</button>
                        </div>
                    )}
                </div>

                {lowAttendanceWarning && (
                    <div style={{
                        background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
                        padding: "14px 18px", marginBottom: 20, color: "#dc2626", display: "flex", alignItems: "center", gap: 12
                    }}>
                        <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                        <div>
                            <div style={{ fontWeight: 700 }}>Attendance Shortage Warning</div>
                            <div style={{ fontSize: "0.85rem" }}>Your overall attendance rate is {percentage}%, which is below the required 75% threshold. Please meet your academic coordinator.</div>
                        </div>
                    </div>
                )}

                {/* Summary cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                    {[
                        { label: "Total Sessions", value: totalCount, color: "#3b82f6", bg: "#dbeafe", icon: "📋" },
                        { label: "Present Days",   value: presentCount, color: "#22c55e", bg: "#dcfce7", icon: "✅" },
                        { label: "Absent Days",    value: absentCount, color: "#ef4444", bg: "#fee2e2", icon: "❌" },
                        { label: "Attendance Rate", value: `${percentage}%`, color: Number(percentage) >= 75 ? "#10b981" : "#f59e0b", bg: Number(percentage) >= 75 ? "#d1fae5" : "#fef3c7", icon: "📊" },
                    ].map(card => (
                        <div key={card.label} className="stat-card">
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: card.color, borderRadius: "var(--radius) var(--radius) 0 0" }} />
                            <div className="stat-card-icon" style={{ background: card.bg }}>{card.icon}</div>
                            <div>
                                <div className="stat-card-value">{card.value}</div>
                                <div className="stat-card-label">{card.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form (Faculty / Admin only) */}
                {role !== "Student" && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">📅 Mark Individual Attendance</span>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => markBatchAll("Present")}>⚡ Quick Mark All Present</button>
                            </div>
                        </div>
                        <form onSubmit={saveAttendance} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, alignItems: "end" }}>
                            <div className="form-group">
                                <label className="form-label">Student *</label>
                                <select className="form-select" value={studentId} onChange={e => setStudentId(e.target.value)} required>
                                    <option value="">Select Student</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.studentId || `ID ${s.id}`})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status *</label>
                                <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                                    <option value="Present">✅ Present</option>
                                    <option value="Absent">❌ Absent</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ height: 42 }}>Save Attendance</button>
                        </form>
                    </div>
                )}

                {/* Search Bar for Faculty/Admin */}
                {role !== "Student" && (
                    <div className="search-bar" style={{ marginBottom: 16 }}>
                        <div className="search-input-wrap">
                            <span>🔍</span>
                            <input
                                placeholder="Search by student name, date or status..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        {search && (
                            <button className="btn btn-secondary btn-sm" onClick={() => setSearch("")}>✕ Clear</button>
                        )}
                    </div>
                )}

                {/* Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedAttendance.length > 0 ? displayedAttendance.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 600 }}>{r.name || "Student"}</td>
                                    <td style={{ color: "var(--text-muted)" }}>{r.date}</td>
                                    <td>
                                        <span className={`badge ${r.status === "Present" ? "badge-green" : "badge-red"}`}>
                                            {r.status === "Present" ? "● Present" : "● Absent"}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📅</div>
                                            <div className="empty-state-title">No attendance records found</div>
                                            <div className="empty-state-desc">
                                                {role === "Student"
                                                    ? "No attendance records recorded for your account yet"
                                                    : "Mark attendance above or import a CSV file"}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <CsvUploadModal
                    isOpen={csvModalOpen}
                    onClose={(ok) => { setCsvModalOpen(false); if (ok) { fetchAttendance(); toast.success("Attendance imported!"); }}}
                    uploadUrl="http://localhost:5000/api/attendance/import"
                    title="Import Attendance via CSV"
                    sampleData="studentId,date,status"
                />
            </div>
        </div>
    );
}

export default Attendance;