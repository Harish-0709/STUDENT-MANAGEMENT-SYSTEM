import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import CsvUploadModal from "../components/CsvUploadModal";
import { toast } from "../components/Toast";

function Marks() {
    const role = localStorage.getItem("role") || "Student";
    const username = localStorage.getItem("username") || "";

    const [students, setStudents] = useState([]);
    const [marksList, setMarksList] = useState([]);
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [subject, setSubject] = useState("");
    const [marks, setMarks] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchStudents();
        fetchMarks();
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

    const fetchMarks = async () => {
        try {
            const r = await api.get("/marks");
            setMarksList(r.data);
        } catch {}
    };

    const saveMarks = async (e) => {
        e.preventDefault();
        try {
            await api.post("/marks", { studentId, subject, marks });
            toast.success("Marks saved successfully");
            setSubject("");
            setMarks("");
            fetchMarks();
        } catch {
            toast.error("Unable to save marks");
        }
    };

    const displayedMarks = (role === "Student")
        ? marksList.filter(m => m.name?.toLowerCase().includes(username.toLowerCase()) || m.studentId?.toString() === username)
        : marksList.filter(m =>
            m.name?.toLowerCase().includes(search.toLowerCase()) ||
            m.subject?.toLowerCase().includes(search.toLowerCase())
        );

    const avg = displayedMarks.length > 0
        ? (displayedMarks.reduce((s, m) => s + Number(m.marks), 0) / displayedMarks.length).toFixed(1)
        : 0;
    const highest = displayedMarks.length > 0
        ? Math.max(...displayedMarks.map(m => Number(m.marks)))
        : 0;
    const passedCount = displayedMarks.filter(m => Number(m.marks) >= 50).length;

    const getPredictedGrade = (val) => {
        if (!val && val !== 0) return null;
        const num = Number(val);
        if (num >= 90) return { label: "A+ (Outstanding)", color: "badge-green" };
        if (num >= 80) return { label: "A (Excellent)", color: "badge-green" };
        if (num >= 70) return { label: "B (Good)", color: "badge-blue" };
        if (num >= 60) return { label: "C (Average)", color: "badge-blue" };
        if (num >= 50) return { label: "D (Pass)", color: "badge-yellow" };
        return { label: "F (Fail)", color: "badge-red" };
    };

    const autoBatchGradeClass = async () => {
        if (!subject) { toast.warning("Please enter a subject name first"); return; }
        if (students.length === 0) { toast.warning("No students available"); return; }
        if (!window.confirm(`Auto-generate random evaluation marks (60-98) for subject "${subject}" across all ${students.length} students?`)) return;

        try {
            await Promise.all(
                students.map(s => {
                    const randomScore = Math.floor(60 + Math.random() * 39);
                    return api.post("/marks", { studentId: s.id, subject, marks: randomScore });
                })
            );
            toast.success(`Auto-generated marks for ${students.length} students in "${subject}"!`);
            fetchMarks();
        } catch {
            toast.error("Error auto-generating marks");
        }
    };

    const predicted = getPredictedGrade(marks);

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{role === "Student" ? "My Academic Grades" : "Marks Management"}</h1>
                        <p className="page-subtitle">
                            {role === "Student"
                                ? "View your subject grades, percentage scores, and evaluation results"
                                : "Record scores, auto-calculate performance grades, and import assessment marks"}
                        </p>
                    </div>
                    {role !== "Student" && (
                        <div style={{ display: "flex", gap: 10 }}>
                            <button className="btn btn-secondary" onClick={() => setCsvModalOpen(true)}>⬆️ Import CSV</button>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                    {[
                        { label: "Total Subjects", value: displayedMarks.length, icon: "📚", color: "#3b82f6", bg: "#dbeafe" },
                        { label: "Average Score", value: `${avg}%`, icon: "📊", color: "#8b5cf6", bg: "#ede9fe" },
                        { label: "Highest Score", value: highest, icon: "🏆", color: "#f59e0b", bg: "#fef9c3" },
                        { label: "Pass Rate", value: displayedMarks.length > 0 ? `${Math.round((passedCount/displayedMarks.length)*100)}%` : "0%", icon: "✅", color: "#10b981", bg: "#d1fae5" },
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

                {/* Form (Faculty / Admin only) */}
                {role !== "Student" && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">📝 Record Student Marks</span>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={autoBatchGradeClass}>⚡ Auto-Grade Class Roster</button>
                        </div>
                        <form onSubmit={saveMarks} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, alignItems: "end" }}>
                            <div className="form-group">
                                <label className="form-label">Student *</label>
                                <select className="form-select" value={studentId} onChange={e => setStudentId(e.target.value)} required>
                                    <option value="">Select Student</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.studentId || `ID ${s.id}`})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject *</label>
                                <input className="form-input" placeholder="e.g. Data Structures" value={subject} onChange={e => setSubject(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <label className="form-label">Marks (0-100) *</label>
                                    {predicted && (
                                        <span className={`badge ${predicted.color}`} style={{ fontSize: "0.7rem" }}>
                                            Auto: {predicted.label}
                                        </span>
                                    )}
                                </div>
                                <input className="form-input" type="number" min="0" max="100" placeholder="e.g. 85" value={marks} onChange={e => setMarks(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ height: 42 }}>Save Marks</button>
                        </form>
                    </div>
                )}

                {/* Search Bar for Faculty/Admin */}
                {role !== "Student" && (
                    <div className="search-bar" style={{ marginBottom: 16 }}>
                        <div className="search-input-wrap">
                            <span>🔍</span>
                            <input
                                placeholder="Search by student name or subject..."
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
                                <th>Subject</th>
                                <th>Marks Obtained</th>
                                <th>Performance Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedMarks.length > 0 ? displayedMarks.map(m => {
                                const score = Number(m.marks);
                                const grade = score >= 90 ? "A+ (Outstanding)" : score >= 80 ? "A (Excellent)" : score >= 70 ? "B (Good)" : score >= 60 ? "C (Average)" : score >= 50 ? "D (Pass)" : "F (Fail)";
                                const gradeBadge = score >= 80 ? "badge-green" : score >= 60 ? "badge-blue" : score >= 50 ? "badge-yellow" : "badge-red";
                                return (
                                    <tr key={m.id}>
                                        <td style={{ fontWeight: 600 }}>{m.name || "Student"}</td>
                                        <td style={{ color: "var(--text)" }}>{m.subject}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontWeight: 700, fontSize: "1rem", color: score >= 60 ? "#16a34a" : "#dc2626" }}>{m.marks}</span>
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/ 100</span>
                                            </div>
                                        </td>
                                        <td><span className={`badge ${gradeBadge}`}>{grade}</span></td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="4">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📝</div>
                                            <div className="empty-state-title">No marks recorded</div>
                                            <div className="empty-state-desc">
                                                {role === "Student" ? "No examination scores published yet" : "Enter student marks above or import CSV"}
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
                    onClose={(ok) => { setCsvModalOpen(false); if (ok) { fetchMarks(); toast.success("Marks imported!"); }}}
                    uploadUrl="http://localhost:5000/api/marks/import"
                    title="Import Marks via CSV"
                    sampleData="studentId,subject,marks"
                />
            </div>
        </div>
    );
}

export default Marks;