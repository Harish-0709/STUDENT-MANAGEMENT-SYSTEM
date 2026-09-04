import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { toast } from "../components/Toast";

function Leave() {
    const role = localStorage.getItem("role") || "Student";
    const username = localStorage.getItem("username") || "";

    const [students, setStudents]   = useState([]);
    const [leaves, setLeaves]       = useState([]);
    const [studentId, setStudentId] = useState("");
    const [fromDate, setFromDate]   = useState("");
    const [toDate, setToDate]       = useState("");
    const [reason, setReason]       = useState("");
    const [search, setSearch]       = useState("");

    useEffect(() => {
        fetchStudents();
        fetchLeaves();
    }, []);

    const fetchStudents = async () => {
        try {
            const r = await api.get("/students");
            setStudents(r.data);
            if (r.data.length > 0 && !studentId) {
                // If logged in as student, select their ID automatically
                const myStudent = r.data.find(s => s.studentId === username || s.name?.toLowerCase().includes(username.toLowerCase()));
                if (myStudent) {
                    setStudentId(myStudent.id);
                } else {
                    setStudentId(r.data[0].id);
                }
            }
        } catch {}
    };

    const fetchLeaves = async () => {
        try {
            const r = await api.get("/leave");
            setLeaves(r.data);
        } catch {}
    };

    const submitLeave = async (e) => {
        e.preventDefault();
        try {
            await api.post("/leave", { studentId, fromDate, toDate, reason });
            toast.success("Leave application submitted successfully");
            setFromDate("");
            setToDate("");
            setReason("");
            fetchLeaves();
        } catch {
            toast.error("Unable to submit leave request");
        }
    };

    const approveLeave = async (id) => {
        try {
            await api.put(`/leave/${id}`);
            toast.success("Leave request approved");
            fetchLeaves();
        } catch {
            toast.error("Failed to approve leave request");
        }
    };

    const rejectLeave = async (id) => {
        try {
            await api.put(`/leave/reject/${id}`);
            toast.warning("Leave request rejected");
            fetchLeaves();
        } catch {
            toast.error("Failed to reject leave request");
        }
    };

    const displayedLeaves = (role === "Student")
        ? leaves.filter(l => l.name?.toLowerCase().includes(username.toLowerCase()) || l.studentId?.toString() === username)
        : leaves.filter(l =>
            l.name?.toLowerCase().includes(search.toLowerCase()) ||
            l.reason?.toLowerCase().includes(search.toLowerCase()) ||
            l.status?.toLowerCase().includes(search.toLowerCase())
        );

    const pending  = displayedLeaves.filter(l => l.status === "Pending").length;
    const approved = displayedLeaves.filter(l => l.status === "Approved").length;
    const rejected = displayedLeaves.filter(l => l.status === "Rejected").length;

    const statusBadge = (s) =>
        s === "Approved" ? "badge-green" : s === "Rejected" ? "badge-red" : "badge-yellow";

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{role === "Student" ? "My Leave Requests" : "Leave Approvals Management"}</h1>
                        <p className="page-subtitle">
                            {role === "Student"
                                ? "Apply for leave and track your application status"
                                : "Review, batch approve, and manage student leave requests"}
                        </p>
                    </div>
                    {role !== "Student" && pending > 0 && (
                        <button className="btn btn-success btn-sm" onClick={handleBatchApprovePending}>⚡ Batch Approve Pending ({pending})</button>
                    )}
                    <span className="badge badge-purple">{displayedLeaves.length} Total Requests</span>
                </div>

                {/* Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                    {[
                        { label: "Pending Review", value: pending, icon: "⏳", color: "#f59e0b", bg: "#fef3c7" },
                        { label: "Approved Leaves", value: approved, icon: "✅", color: "#10b981", bg: "#d1fae5" },
                        { label: "Rejected Requests", value: rejected, icon: "❌", color: "#ef4444", bg: "#fee2e2" },
                    ].map(c => (
                        <div key={c.label} className="stat-card">
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color, borderRadius: "var(--radius) var(--radius) 0 0" }} />
                            <div className="stat-card-icon" style={{ background: c.bg }}>{c.icon}</div>
                            <div>
                                <div className="stat-card-value">{c.value}</div>
                                <div className="stat-card-label">{c.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Form (Accessible by all roles, especially students) */}
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header"><span className="card-title">🌴 Apply for Leave of Absence</span></div>
                    <form onSubmit={submitLeave} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, alignItems: "end" }}>
                        <div className="form-group">
                            <label className="form-label">Student *</label>
                            <select className="form-select" value={studentId} onChange={e => setStudentId(e.target.value)} required>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.studentId || `ID ${s.id}`})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">From Date *</label>
                            <input className="form-input" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">To Date *</label>
                            <input className="form-input" type="date" value={toDate} onChange={e => setToDate(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                            <label className="form-label">Reason for Absence *</label>
                            <input className="form-input" placeholder="e.g. Medical emergency, family function..." value={reason} onChange={e => setReason(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: 42 }}>Submit Request</button>
                    </form>
                </div>

                {/* Search Bar for Admin/Faculty */}
                {role !== "Student" && (
                    <div className="search-bar" style={{ marginBottom: 16 }}>
                        <div className="search-input-wrap">
                            <span>🔍</span>
                            <input
                                placeholder="Search by student name, reason or status..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        {search && (
                            <button className="btn btn-secondary btn-sm" onClick={() => setSearch("")}>✕ Clear</button>
                        )}
                    </div>
                )}

                {/* Leaves Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>From Date</th>
                                <th>To Date</th>
                                <th>Reason</th>
                                <th>Status</th>
                                {role !== "Student" && <th style={{ textAlign: "right" }}>Review Decision</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {displayedLeaves.length > 0 ? displayedLeaves.map(leave => (
                                <tr key={leave.id}>
                                    <td style={{ fontWeight: 600 }}>{leave.name || "Student"}</td>
                                    <td style={{ color: "var(--text-muted)" }}>{leave.fromDate}</td>
                                    <td style={{ color: "var(--text-muted)" }}>{leave.toDate}</td>
                                    <td style={{ maxWidth: 220, color: "var(--text)" }}>{leave.reason}</td>
                                    <td>
                                        <span className={`badge ${statusBadge(leave.status)}`}>
                                            ● {leave.status}
                                        </span>
                                    </td>
                                    {role !== "Student" && (
                                        <td>
                                            {leave.status === "Pending" ? (
                                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                    <button className="btn btn-sm btn-primary" style={{ background: "#10b981", borderColor: "#10b981" }} onClick={() => approveLeave(leave.id)}>
                                                        ✓ Approve
                                                    </button>
                                                    <button className="btn btn-sm" style={{ background: "#fee2e2", color: "#dc2626" }} onClick={() => rejectLeave(leave.id)}>
                                                        ✕ Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: "right", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                                    Reviewed
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={role !== "Student" ? 6 : 5}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">🌴</div>
                                            <div className="empty-state-title">No leave requests found</div>
                                            <div className="empty-state-desc">
                                                {role === "Student" ? "You haven't submitted any leave applications yet" : "No pending applications to review"}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Leave;