import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import { toast } from "../components/Toast";

function AddStudent() {
    const navigate = useNavigate();
    const [studentId, setStudentId] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [email, setEmail] = useState("");
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        if (file) { setPreview(URL.createObjectURL(file)); }
    };

    const saveStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("studentId", studentId);
            formData.append("name", name);
            formData.append("department", department);
            formData.append("year", year);
            formData.append("email", email);
            if (photo) formData.append("photo", photo);
            await api.post("/students", formData, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("Student added successfully");
            navigate("/students");
        } catch { toast.error("Unable to save student"); }
        finally { setLoading(false); }
    };

    const generateAutoId = () => {
        const deptPrefix = department || "CSE";
        const yrSuffix = year || "1";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const autoGen = `${deptPrefix}2026${yrSuffix}${randomNum}`;
        setStudentId(autoGen);
        toast.info(`Generated Student ID: ${autoGen}`);
    };

    const autoFillSampleData = () => {
        const sampleNames = ["Alex Rivers", "Sophia Chen", "Marcus Vance", "Elena Rostova", "Devon Park"];
        const sampleDepts = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
        const randomDept = sampleDepts[Math.floor(Math.random() * sampleDepts.length)];
        const randomYear = String(Math.floor(1 + Math.random() * 4));
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const cleanName = randomName.toLowerCase().replace(" ", ".");
        const autoGenId = `${randomDept}2026${randomYear}${Math.floor(100 + Math.random() * 900)}`;

        setName(randomName);
        setDepartment(randomDept);
        setYear(randomYear);
        setStudentId(autoGenId);
        setEmail(`${cleanName}@campus.edu`);
        toast.success("Sample student data auto-filled!");
    };

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Add Student</h1>
                        <p className="page-subtitle">Register a new student with automated ID formatting</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn btn-secondary" onClick={autoFillSampleData}>⚡ Auto-Fill Sample</button>
                        <button className="btn btn-secondary" onClick={() => navigate("/students")}>← Back to Students</button>
                    </div>
                </div>

                <div style={{ maxWidth: 640, margin: "0 auto" }}>
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🎓 Student Information</span>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={generateAutoId}>⚡ Generate Auto ID</button>
                        </div>

                        {/* Photo Preview */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                            <div style={{
                                width: 100, height: 100, borderRadius: "50%",
                                background: preview ? `url(${preview}) center/cover no-repeat` : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", fontSize: "2rem", fontWeight: 700,
                                border: "3px solid var(--border)"
                            }}>
                                {!preview && (name?.[0]?.toUpperCase() || "S")}
                            </div>
                        </div>

                        <form onSubmit={saveStudent} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div className="form-group">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <label className="form-label">Student ID *</label>
                                        <button type="button" onClick={generateAutoId} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>⚡ Auto</button>
                                    </div>
                                    <input className="form-input" placeholder="e.g. CS2024001" value={studentId} onChange={e => setStudentId(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input className="form-input" placeholder="Student name" value={name} onChange={e => setName(e.target.value)} required />
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
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input className="form-input" type="email" placeholder="student@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Photo</label>
                                <div style={{
                                    border: "2px dashed var(--border)", borderRadius: 10, padding: 20,
                                    textAlign: "center", cursor: "pointer", background: "#fafbfc",
                                    transition: "border-color 0.2s"
                                }} onClick={() => document.getElementById("photo-input").click()}>
                                    <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
                                    <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>📷</div>
                                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{photo ? photo.name : "Click to upload student photo"}</div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
                                {loading ? "⏳ Saving..." : "🎓 Save Student"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddStudent;