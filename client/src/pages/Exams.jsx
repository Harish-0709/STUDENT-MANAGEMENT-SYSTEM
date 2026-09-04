import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { toast } from "../components/Toast";

function Exams() {
    const role = localStorage.getItem("role") || "Student";
    const [exams, setExams] = useState([]);
    const [subject, setSubject] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [examDate, setExamDate] = useState("");
    const [examTime, setExamTime] = useState("");
    const [hall, setHall] = useState("");
    const [participants, setParticipants] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => { fetchExams(); }, []);

    const fetchExams = async () => {
        try {
            const r = await api.get("/exams");
            setExams(r.data);
        } catch {
            toast.error("Unable to load exams");
        }
    };

    const addParticipant = () => {
        if (!department || !year) { toast.warning("Select department and year"); return; }
        if (participants.some(p => p.department === department && Number(p.year) === Number(year))) {
            toast.warning("This cohort is already selected");
            return;
        }
        setParticipants([...participants, { department, year: Number(year) }]);
        setDepartment("");
        setYear("");
    };

    const removeParticipant = (i) => setParticipants(participants.filter((_, idx) => idx !== i));

    const saveExam = async (e) => {
        e.preventDefault();
        if (participants.length === 0) { toast.warning("Add at least one participating department cohort"); return; }
        try {
            await api.post("/exams", { subject, examDate, examTime, hall, participants });
            toast.success("Examination scheduled successfully");
            setSubject(""); setExamDate(""); setExamTime(""); setHall(""); setParticipants([]);
            fetchExams();
        } catch (err) {
            toast.error(err.response?.data?.message || "Unable to save exam");
        }
    };

    const autoGenerateExamSchedule = async () => {
        const sampleSubjects = [
            { subject: "Data Structures & Algorithms", dept: "CSE", year: 2, hall: "Hall A101" },
            { subject: "Digital Signal Processing", dept: "ECE", year: 3, hall: "Hall B202" },
            { subject: "Power Electronics", dept: "EEE", year: 3, hall: "Hall C303" },
            { subject: "Thermodynamics", dept: "MECH", year: 2, hall: "Hall D404" },
            { subject: "Structural Analysis", dept: "CIVIL", year: 4, hall: "Hall E505" }
        ];

        if (!window.confirm(`Auto-schedule ${sampleSubjects.length} core subject examinations with conflict-free hall assignments?`)) return;

        try {
            const today = new Date();
            let count = 0;
            for (let i = 0; i < sampleSubjects.length; i++) {
                const item = sampleSubjects[i];
                const examDateObj = new Date(today);
                examDateObj.setDate(today.getDate() + (i + 1) * 2);
                const dateStr = examDateObj.toISOString().split("T")[0];
                const timeStr = i % 2 === 0 ? "09:30" : "14:00";

                await api.post("/exams", {
                    subject: item.subject,
                    examDate: dateStr,
                    examTime: timeStr,
                    hall: item.hall,
                    participants: [{ department: item.dept, year: item.year }]
                });
                count++;
            }
            toast.success(`Successfully auto-scheduled ${count} core examinations!`);
            fetchExams();
        } catch {
            toast.error("Error auto-scheduling examinations");
        }
    };

    const filteredExams = exams.filter(e =>
        e.subject?.toLowerCase().includes(search.toLowerCase()) ||
        e.department?.toLowerCase().includes(search.toLowerCase()) ||
        e.hall?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{role === "Student" ? "My Exam Schedule" : "Exam Management"}</h1>
                        <p className="page-subtitle">
                            {role === "Student"
                                ? "View upcoming semester and mid-term examination timetable"
                                : "Schedule examinations, assign exam halls, and auto-generate timetable"}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {role !== "Student" && (
                            <button className="btn btn-secondary btn-sm" onClick={autoGenerateExamSchedule}>⚡ Auto-Schedule Exams</button>
                        )}
                        <span className="badge badge-purple">{exams.length} Total Exams</span>
                    </div>
                </div>

                {/* Exam Creation Form (Admin & Faculty only) */}
                {role !== "Student" && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header"><span className="card-title">📋 Schedule Examination</span></div>
                        <form onSubmit={saveExam}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
                                <div className="form-group" style={{ gridColumn: "span 2" }}>
                                    <label className="form-label">Subject Course *</label>
                                    <input className="form-input" placeholder="e.g. Operating Systems" value={subject} onChange={e => setSubject(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date *</label>
                                    <input className="form-input" type="date" value={examDate} onChange={e => setExamDate(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Time *</label>
                                    <input className="form-input" type="time" value={examTime} onChange={e => setExamTime(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Exam Hall *</label>
                                    <input className="form-input" placeholder="e.g. Hall A101" value={hall} onChange={e => setHall(e.target.value)} required />
                                </div>
                            </div>

                            {/* Participant Cohort Picker */}
                            <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid var(--border)" }}>
                                <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 10 }}>👥 Add Participating Cohorts *</div>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                                    <select className="form-select" style={{ width: "auto", minWidth: 160 }} value={department} onChange={e => setDepartment(e.target.value)}>
                                        <option value="">Select Department</option>
                                        {["CSE","ECE","EEE","MECH","CIVIL","IT"].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select className="form-select" style={{ width: "auto", minWidth: 140 }} value={year} onChange={e => setYear(e.target.value)}>
                                        <option value="">Select Year</option>
                                        {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                    </select>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={addParticipant}>+ Add Cohort</button>
                                </div>

                                {participants.length > 0 && (
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        {participants.map((p, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#dbeafe", color: "#1d4ed8", padding: "4px 12px", borderRadius: 999, fontSize: "0.8rem", fontWeight: 600 }}>
                                                <span>🎓 {p.department} — Year {p.year}</span>
                                                <button type="button" onClick={() => removeParticipant(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#1d4ed8", fontWeight: 700 }}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <button type="submit" className="btn btn-primary">📋 Create & Schedule Exam</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search Bar */}
                <div className="search-bar" style={{ marginBottom: 20 }}>
                    <div className="search-input-wrap">
                        <span>🔍</span>
                        <input
                            placeholder="Search by subject, department or exam hall..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {search && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setSearch("")}>✕ Clear</button>
                    )}
                </div>

                {/* Exam Cards Grid for Students / Table for Admin */}
                {role === "Student" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                        {filteredExams.length > 0 ? filteredExams.map(e => (
                            <div key={e.id} className="card" style={{ borderLeft: "4px solid var(--primary)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{e.subject}</h3>
                                    <span className="badge badge-purple">{e.hall || "Hall TBA"}</span>
                                </div>
                                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                                    <span className="badge badge-blue">{e.department}</span>
                                    <span className="badge badge-gray">Year {e.year}</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.82rem", color: "var(--text-muted)", background: "var(--surface-2)", padding: "10px 12px", borderRadius: 8 }}>
                                    <div>📅 <strong>Date:</strong> {e.examDate || "TBA"}</div>
                                    <div>⏰ <strong>Time:</strong> {e.examTime || "TBA"}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="card" style={{ gridColumn: "1 / -1" }}>
                                <div className="empty-state">
                                    <div className="empty-state-icon">📋</div>
                                    <div className="empty-state-title">No scheduled exams found</div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Exam Hall</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExams.length > 0 ? filteredExams.map(e => (
                                    <tr key={e.id}>
                                        <td style={{ fontWeight: 600 }}>{e.subject}</td>
                                        <td><span className="badge badge-blue">{e.department}</span></td>
                                        <td><span className="badge badge-gray">Year {e.year}</span></td>
                                        <td style={{ color: "var(--text-muted)" }}>{e.examDate}</td>
                                        <td style={{ color: "var(--text-muted)" }}>{e.examTime}</td>
                                        <td><span className="badge badge-purple">🏫 {e.hall}</span></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="empty-state">
                                                <div className="empty-state-icon">📋</div>
                                                <div className="empty-state-title">No scheduled examinations</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Exams;