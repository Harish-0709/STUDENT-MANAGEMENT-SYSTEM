import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import { toast } from "../components/Toast";

function EditStudent() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [studentId, setStudentId] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadStudent(); }, []);

    const loadStudent = async () => {
        try {
            const r = await api.get(`/students/${id}`);
            setStudentId(r.data.studentId); setName(r.data.name); setDepartment(r.data.department); setYear(r.data.year); setEmail(r.data.email);
        } catch { toast.error("Unable to load student data"); }
    };

    const updateStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/students/${id}`, { studentId, name, department, year, email });
            toast.success("Student updated successfully");
            navigate("/students");
        } catch { toast.error("Unable to update student"); }
        finally { setLoading(false); }
    };

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Edit Student</h1>
                        <p className="page-subtitle">Update student information</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate("/students")}>← Back to Students</button>
                </div>

                <div style={{ maxWidth: 640, margin: "0 auto" }}>
                    <div className="card">
                        <div className="card-header"><span className="card-title">✏️ Edit Student Details</span></div>

                        {/* Avatar */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: "50%",
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", fontSize: "1.75rem", fontWeight: 700,
                                border: "3px solid var(--border)"
                            }}>{name?.[0]?.toUpperCase() || "S"}</div>
                        </div>

                        <form onSubmit={updateStudent} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Student ID</label>
                                    <input className="form-input" value={studentId} onChange={e => setStudentId(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)} required>
                                        <option value="">Select</option>
                                        {["CSE","ECE","EEE","MECH","CIVIL"].map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year</label>
                                    <select className="form-select" value={year} onChange={e => setYear(e.target.value)} required>
                                        <option value="">Select</option>
                                        {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
                                {loading ? "⏳ Updating..." : "✏️ Update Student"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditStudent;