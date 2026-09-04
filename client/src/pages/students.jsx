import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import CsvUploadModal from "../components/CsvUploadModal";
import { toast } from "../components/Toast";
import exportStudentsPDF from "../utils/exportPDF";
import exportStudentsExcel from "../utils/exportExcel";

const DEPT_COLORS = { CSE: "badge-blue", ECE: "badge-green", EEE: "badge-yellow", MECH: "badge-orange", CIVIL: "badge-gray" };

function Students() {
    const navigate = useNavigate();
    const [students, setStudents]         = useState([]);
    const [search, setSearch]             = useState("");
    const [departmentFilter, setDeptFilter] = useState("");
    const [yearFilter, setYearFilter]     = useState("");
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const [loading, setLoading]           = useState(true);

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get("/students");
            setStudents(response.data);
        } catch {
            toast.error("Unable to load students");
        } finally {
            setLoading(false);
        }
    };

    const deleteStudent = async (id, name) => {
        if (!window.confirm(`Delete student "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/students/${id}`);
            toast.success("Student deleted successfully");
            fetchStudents();
        } catch {
            toast.error("Unable to delete student");
        }
    };

    const filtered = students
        .filter(s =>
            s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.department?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase())
        )
        .filter(s => !departmentFilter || s.department === departmentFilter)
        .filter(s => !yearFilter || s.year?.toString() === yearFilter);

    const deptBadge = (dept) => DEPT_COLORS[dept] || "badge-gray";

    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(s => s.id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedIds.length} selected students?`)) return;
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/students/${id}`)));
            toast.success(`Successfully deleted ${selectedIds.length} students`);
            setSelectedIds([]);
            fetchStudents();
        } catch {
            toast.error("Error deleting selected students");
        }
    };

    const handleBulkExportSelected = () => {
        const selectedList = students.filter(s => selectedIds.includes(s.id));
        exportStudentsPDF(selectedList);
        toast.info(`Exported PDF for ${selectedList.length} selected students`);
    };

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Students</h1>
                        <p className="page-subtitle">{students.length} enrolled students</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => exportStudentsPDF(filtered)}>📄 Export PDF</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => exportStudentsExcel(filtered)}>📊 Export Excel</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setCsvModalOpen(true)}>⬆️ Import CSV</button>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate("/add-student")}>+ Add Student</button>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedIds.length > 0 && (
                    <div style={{
                        background: "var(--surface-2)", border: "1px solid var(--primary)", borderRadius: 10,
                        padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>⚡ {selectedIds.length} Students Selected</span>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button className="btn btn-secondary btn-sm" onClick={handleBulkExportSelected}>📄 Export Selected PDF</button>
                            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>🗑 Delete Selected ({selectedIds.length})</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedIds([])}>✕ Clear Selection</button>
                        </div>
                    </div>
                )}

                {/* Search & Filter */}
                <div className="search-bar">
                    <div className="search-input-wrap">
                        <span>🔍</span>
                        <input
                            placeholder="Search by name, ID, department or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="form-select" style={{ width: "auto" }} value={departmentFilter} onChange={e => setDeptFilter(e.target.value)}>
                        <option value="">All Departments</option>
                        {["CSE","ECE","EEE","MECH","CIVIL"].map(d => <option key={d}>{d}</option>)}
                    </select>
                    <select className="form-select" style={{ width: "auto" }} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                        <option value="">All Years</option>
                        {[1,2,3,4].map(y => <option key={y}>{y}</option>)}
                    </select>
                    {(search || departmentFilter || yearFilter) && (
                        <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(""); setDeptFilter(""); setYearFilter(""); }}>✕ Clear</button>
                    )}
                </div>

                {/* Table */}
                <div className="data-table-container">
                    {loading ? (
                        <div className="empty-state"><div className="animate-spin" style={{ fontSize: "2rem", marginBottom: 8 }}>⏳</div><div>Loading students...</div></div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 40, textAlign: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={filtered.length > 0 && selectedIds.length === filtered.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>Student</th>
                                    <th>Student ID</th>
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Email</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length > 0 ? filtered.map(student => (
                                    <tr key={student.id} style={{ background: selectedIds.includes(student.id) ? "rgba(59,130,246,0.08)" : undefined }}>
                                        <td style={{ textAlign: "center" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(student.id)}
                                                onChange={() => toggleSelectOne(student.id)}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                {student.photo ? (
                                                    <img src={`http://localhost:5000/uploads/${student.photo}`} alt={student.name} className="avatar avatar-sm" />
                                                ) : (
                                                    <div className="avatar avatar-sm">{student.name?.[0] || "S"}</div>
                                                )}
                                                <div style={{ fontWeight: 600 }}>{student.name}</div>
                                            </div>
                                        </td>
                                        <td><code style={{ fontSize: "0.8rem", background: "var(--surface-2)", color: "var(--text)", padding: "2px 7px", borderRadius: 5 }}>{student.studentId}</code></td>
                                        <td><span className={`badge ${deptBadge(student.department)}`}>{student.department}</span></td>
                                        <td><span className="badge badge-gray">Yr {student.year}</span></td>
                                        <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{student.email}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/student-profile/${student.id}`)}>👁 View</button>
                                                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/edit-student/${student.id}`)}>✏️ Edit</button>
                                                <button className="btn btn-sm" style={{ background: "#fee2e2", color: "#dc2626" }} onClick={() => deleteStudent(student.id, student.name)}>🗑</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">🎓</div>
                                            <div className="empty-state-title">No students found</div>
                                            <div className="empty-state-desc">Try adjusting your filters or add a new student</div>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* CSV Modal */}
                <CsvUploadModal
                    isOpen={csvModalOpen}
                    onClose={(success) => { setCsvModalOpen(false); if (success) { fetchStudents(); toast.success("Students imported!"); } }}
                    uploadUrl="http://localhost:5000/api/students/import"
                    title="Import Students via CSV"
                    sampleData="rollnumber,name,department,semester"
                />
            </div>
        </div>
    );
}

export default Students;