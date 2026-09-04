import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import CsvUploadModal from "../components/CsvUploadModal";
import { toast } from "../components/Toast";

function Fees() {
    const role = localStorage.getItem("role") || "Student";
    const username = localStorage.getItem("username") || "";

    const [students, setStudents]     = useState([]);
    const [fees, setFees]             = useState([]);
    const [studentId, setStudentId]   = useState("");
    const [semester, setSemester]     = useState("1");
    const [totalFee, setTotalFee]     = useState("");
    const [paidAmount, setPaidAmount] = useState("");
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const [search, setSearch]         = useState("");

    useEffect(() => {
        fetchStudents();
        fetchFees();
    }, []);

    const fetchStudents = async () => {
        try {
            const r = await api.get("/students");
            setStudents(r.data);
            if (r.data.length > 0 && !studentId) setStudentId(r.data[0].id);
        } catch {}
    };

    const fetchFees = async () => {
        try {
            const r = await api.get("/fees");
            setFees(r.data);
        } catch {}
    };

    const saveFee = async (e) => {
        e.preventDefault();
        try {
            await api.post("/fees", { studentId, semester, totalFee, paidAmount });
            toast.success("Fee record saved successfully");
            setTotalFee("");
            setPaidAmount("");
            fetchFees();
        } catch {
            toast.error("Unable to save fee record");
        }
    };

    const displayedFees = (role === "Student")
        ? fees.filter(f => f.name?.toLowerCase().includes(username.toLowerCase()) || f.studentId?.toString() === username)
        : fees.filter(f =>
            f.name?.toLowerCase().includes(search.toLowerCase()) ||
            f.semester?.toString().includes(search) ||
            f.status?.toLowerCase().includes(search.toLowerCase())
        );

    const totalCollected = displayedFees.reduce((s, f) => s + Number(f.paidAmount || 0), 0);
    const totalDue       = displayedFees.reduce((s, f) => s + Number(f.balance || 0), 0);
    const paidCount      = displayedFees.filter(f => f.status === "Paid").length;

    const batchGenerateInvoices = async () => {
        if (!totalFee || Number(totalFee) <= 0) { toast.warning("Please enter a total fee amount first"); return; }
        if (students.length === 0) { toast.warning("No students registered"); return; }
        if (!window.confirm(`Generate standard tuition fee invoice (₹${Number(totalFee).toLocaleString()}) for Semester ${semester} across all ${students.length} students?`)) return;

        try {
            await Promise.all(
                students.map(s => api.post("/fees", {
                    studentId: s.id,
                    semester,
                    totalFee: Number(totalFee),
                    paidAmount: Number(paidAmount || 0)
                }))
            );
            toast.success(`Successfully generated Semester ${semester} fee invoices for ${students.length} students!`);
            fetchFees();
        } catch {
            toast.error("Error generating batch fee invoices");
        }
    };

    const calculatedBalance = (Number(totalFee || 0) - Number(paidAmount || 0));

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{role === "Student" ? "My Fee Invoices" : "Fees Management"}</h1>
                        <p className="page-subtitle">
                            {role === "Student"
                                ? "View semester tuition, payment receipts, and balance status"
                                : "Manage tuition dues, track collection invoices, and auto-generate batch billing"}
                        </p>
                    </div>
                    {role === "Admin" && (
                        <div style={{ display: "flex", gap: 10 }}>
                            <button className="btn btn-secondary" onClick={() => setCsvModalOpen(true)}>⬆️ Import CSV</button>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                    {[
                        { label: role === "Student" ? "Amount Paid" : "Total Collected", value: `₹${totalCollected.toLocaleString()}`, icon: "💰", color: "#10b981", bg: "#d1fae5" },
                        { label: role === "Student" ? "Outstanding Due" : "Total Pending Dues", value: `₹${totalDue.toLocaleString()}`, icon: "⏳", color: totalDue > 0 ? "#ef4444" : "#10b981", bg: totalDue > 0 ? "#fee2e2" : "#d1fae5" },
                        { label: role === "Student" ? "Paid Semesters" : "Fully Cleared Students", value: paidCount, icon: "✅", color: "#3b82f6", bg: "#dbeafe" },
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

                {/* Add Fee Form (Admin only) */}
                {role === "Admin" && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">💳 Tuition Fee Billing & Invoicing</span>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={batchGenerateInvoices}>⚡ Batch Generate Invoices for Cohort</button>
                        </div>
                        <form onSubmit={saveFee} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, alignItems: "end" }}>
                            <div className="form-group">
                                <label className="form-label">Student *</label>
                                <select className="form-select" value={studentId} onChange={e => setStudentId(e.target.value)} required>
                                    <option value="">Select Student</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.studentId || `ID ${s.id}`})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Semester *</label>
                                <select className="form-select" value={semester} onChange={e => setSemester(e.target.value)} required>
                                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Total Fee (₹) *</label>
                                <input className="form-input" type="number" min="0" placeholder="e.g. 50000" value={totalFee} onChange={e => setTotalFee(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <label className="form-label">Paid Amount (₹) *</label>
                                    {totalFee && (
                                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: calculatedBalance > 0 ? "#ef4444" : "#10b981" }}>
                                            Due: ₹{calculatedBalance.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <input className="form-input" type="number" min="0" placeholder="e.g. 25000" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ height: 42 }}>Save Invoice</button>
                        </form>
                    </div>
                )}

                {/* Search Bar for Admin/Faculty */}
                {role !== "Student" && (
                    <div className="search-bar" style={{ marginBottom: 16 }}>
                        <div className="search-input-wrap">
                            <span>🔍</span>
                            <input
                                placeholder="Search by student name, semester or status..."
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
                                <th>Semester</th>
                                <th>Total Fee</th>
                                <th>Amount Paid</th>
                                <th>Outstanding Balance</th>
                                <th>Payment Progress</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedFees.length > 0 ? displayedFees.map(item => {
                                const total = Number(item.totalFee || 0);
                                const paid  = Number(item.paidAmount || 0);
                                const pct   = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
                                return (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>{item.name || "Student"}</td>
                                        <td><span className="badge badge-purple">Semester {item.semester}</span></td>
                                        <td style={{ fontWeight: 600 }}>₹{total.toLocaleString()}</td>
                                        <td style={{ color: "#16a34a", fontWeight: 600 }}>₹{paid.toLocaleString()}</td>
                                        <td style={{ color: item.balance > 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                                            ₹{Number(item.balance || 0).toLocaleString()}
                                        </td>
                                        <td style={{ minWidth: 140 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div className="progress-wrap" style={{ flex: 1 }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${pct}%`,
                                                            background: pct === 100 ? "#10b981" : pct > 50 ? "#3b82f6" : "#f59e0b"
                                                        }}
                                                    />
                                                </div>
                                                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", width: 34 }}>
                                                    {pct}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${item.status === "Paid" ? "badge-green" : "badge-yellow"}`}>
                                                {item.status === "Paid" ? "● Fully Paid" : "● Pending Due"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">💳</div>
                                            <div className="empty-state-title">No fee invoices recorded</div>
                                            <div className="empty-state-desc">
                                                {role === "Student" ? "No fee invoices generated for your account yet" : "Create new invoice records above"}
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
                    onClose={(ok) => { setCsvModalOpen(false); if (ok) { fetchFees(); toast.success("Fees imported!"); }}}
                    uploadUrl="http://localhost:5000/api/fees/import"
                    title="Import Fees via CSV"
                    sampleData="studentId,semester,totalFee,paidAmount"
                />
            </div>
        </div>
    );
}

export default Fees;