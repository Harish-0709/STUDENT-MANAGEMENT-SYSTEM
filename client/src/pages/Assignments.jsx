import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { toast } from "../components/Toast";

function Assignments() {
    const role = localStorage.getItem("role") || "Student";
    const [assignments, setAssignments] = useState([]);
    const [title, setTitle]             = useState("");
    const [subject, setSubject]         = useState("");
    const [department, setDepartment]   = useState("");
    const [year, setYear]               = useState("");
    const [dueDate, setDueDate]         = useState("");
    const [description, setDescription] = useState("");
    const [search, setSearch]           = useState("");

    useEffect(() => { fetchAssignments(); }, []);

    const fetchAssignments = async () => {
        try {
            const r = await api.get("/assignments");
            setAssignments(r.data);
        } catch {}
    };

    const saveAssignment = async (e) => {
        e.preventDefault();
        try {
            await api.post("/assignments", { title, subject, department, year, dueDate, description });
            toast.success("Assignment posted successfully");
            setTitle(""); setSubject(""); setDepartment(""); setYear(""); setDueDate(""); setDescription("");
            fetchAssignments();
        } catch {
            toast.error("Unable to save assignment");
        }
    };

    const isOverdue = (date) => {
        if (!date) return false;
        return new Date(date).setHours(23,59,59,999) < new Date().getTime();
    };

    const filtered = assignments.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.subject?.toLowerCase().includes(search.toLowerCase()) ||
        a.department?.toLowerCase().includes(search.toLowerCase())
    );

    const autoGenerateSampleAssignments = async () => {
        const samples = [
            { title: "Sorting Algorithms Benchmark", subject: "Data Structures", dept: "CSE", year: "2", days: 7, desc: "Implement and compare execution time of QuickSort, MergeSort, and HeapSort." },
            { title: "Circuit Analysis Lab Project", subject: "Electric Circuits", dept: "EEE", year: "1", days: 5, desc: "Analyze Kirchhoff Laws using MATLAB simulation scripts." },
            { title: "CAD Component Modeling", subject: "Machine Drawing", dept: "MECH", year: "3", days: 10, desc: "Create a 3D CAD model of a piston cylinder assembly." }
        ];

        if (!window.confirm("Auto-publish 3 sample practice assignments for students?")) return;

        try {
            const today = new Date();
            for (const s of samples) {
                const dueObj = new Date(today);
                dueObj.setDate(today.getDate() + s.days);
                await api.post("/assignments", {
                    title: s.title,
                    subject: s.subject,
                    department: s.dept,
                    year: s.year,
                    dueDate: dueObj.toISOString().split("T")[0],
                    description: s.desc
                });
            }
            toast.success("Successfully published 3 course assignments!");
            fetchAssignments();
        } catch {
            toast.error("Error auto-generating assignments");
        }
    };

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{role === "Student" ? "My Course Assignments" : "Assignments Management"}</h1>
                        <p className="page-subtitle">
                            {role === "Student"
                                ? "Track course tasks, assignment deadlines, and submission briefs"
                                : "Publish assignments, set submission deadlines, and manage course tasks"}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {role !== "Student" && (
                            <button className="btn btn-secondary btn-sm" onClick={autoGenerateSampleAssignments}>⚡ Auto-Publish Assignments</button>
                        )}
                        <span className="badge badge-blue">{assignments.length} Total</span>
                    </div>
                </div>

                {/* Form (Faculty / Admin only) */}
                {role !== "Student" && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header"><span className="card-title">📌 Post New Assignment</span></div>
                        <form onSubmit={saveAssignment}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Assignment Title *</label>
                                    <input className="form-input" placeholder="e.g. Lab Project 1" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Subject *</label>
                                    <input className="form-input" placeholder="e.g. Computer Networks" value={subject} onChange={e => setSubject(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Department *</label>
                                    <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)} required>
                                        <option value="">Select Department</option>
                                        {["CSE","ECE","EEE","MECH","CIVIL"].map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year *</label>
                                    <select className="form-select" value={year} onChange={e => setYear(e.target.value)} required>
                                        <option value="">Select Year</option>
                                        {[1,2,3,4].map(y => <option key={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Due Date *</label>
                                    <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label className="form-label">Task Instructions & Description</label>
                                <textarea className="form-textarea" placeholder="Provide problem statement or assignment instructions..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <button type="submit" className="btn btn-primary">📌 Publish Assignment</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search Bar */}
                <div className="search-bar" style={{ marginBottom: 20 }}>
                    <div className="search-input-wrap">
                        <span>🔍</span>
                        <input
                            placeholder="Search by title, subject or department..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {search && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setSearch("")}>✕ Clear</button>
                    )}
                </div>

                {/* Cards Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                    {filtered.length > 0 ? filtered.map(a => {
                        const overdue = isOverdue(a.dueDate);
                        return (
                            <div key={a.id} className="card" style={{ borderLeft: `4px solid ${overdue ? "#ef4444" : "#3b82f6"}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                    <h3 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{a.title}</h3>
                                    <span className={`badge ${overdue ? "badge-red" : "badge-green"}`}>
                                        {overdue ? "● Past Deadline" : "● Open Task"}
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                                    <span className="badge badge-blue">{a.department}</span>
                                    <span className="badge badge-gray">Year {a.year}</span>
                                    <span className="badge badge-purple">{a.subject}</span>
                                </div>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 12 }}>
                                    {a.description || "No specific instructions provided."}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)", fontSize: "0.78rem" }}>
                                    <span style={{ color: overdue ? "#dc2626" : "var(--text-muted)", fontWeight: 600 }}>
                                        📅 Due: {a.dueDate || "N/A"}
                                    </span>
                                    {role === "Student" && (
                                        <span className="badge badge-blue">Submit in class</span>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="card" style={{ gridColumn: "1 / -1" }}>
                            <div className="empty-state">
                                <div className="empty-state-icon">📌</div>
                                <div className="empty-state-title">No assignments posted yet</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Assignments;