import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import CsvUploadModal from "../components/CsvUploadModal";
import { toast } from "../components/Toast";

function Users() {
    const [users, setUsers] = useState([]);
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Faculty");

    useEffect(() => { fetchUsers(); }, []);
    const fetchUsers = async () => { try { const r = await api.get("/users"); setUsers(r.data); } catch {} };

    const addUser = async (e) => {
        e.preventDefault();
        try {
            await api.post("/users", { username, password, role });
            toast.success("User created successfully");
            setUsername(""); setPassword(""); setRole("Faculty");
            fetchUsers();
        } catch { toast.error("Unable to create user"); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try { await api.delete(`/users/${id}`); toast.success("User deleted"); fetchUsers(); }
        catch { toast.error("Unable to delete user"); }
    };

    const roleBadge = (r) => r === "Admin" ? "badge-purple" : r === "Faculty" ? "badge-blue" : "badge-green";
    const roleIcon = (r) => r === "Admin" ? "👑" : r === "Faculty" ? "🎓" : "📚";

    const autoSyncStudentUsers = async () => {
        try {
            const studentRes = await api.get("/students");
            const studentsList = studentRes.data;
            const existingUsernames = new Set(users.map(u => u.username?.toLowerCase()));
            const missing = studentsList.filter(s => s.studentId && !existingUsernames.has(s.studentId.toLowerCase()));

            if (missing.length === 0) {
                toast.info("All enrolled students already have user accounts!");
                return;
            }

            if (!window.confirm(`Auto-create login accounts for ${missing.length} unlinked enrolled students? Default password: "Student@123"`)) return;

            let count = 0;
            for (const s of missing) {
                await api.post("/users", { username: s.studentId, password: "Student@123", role: "Student" });
                count++;
            }
            toast.success(`Successfully created ${count} student portal accounts!`);
            fetchUsers();
        } catch {
            toast.error("Error auto-syncing student user accounts");
        }
    };

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">User Management</h1>
                        <p className="page-subtitle">{users.length} registered users with auto credential sync</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn btn-secondary" onClick={autoSyncStudentUsers}>⚡ Auto-Sync Enrolled Student Logins</button>
                        <button className="btn btn-secondary" onClick={() => setCsvModalOpen(true)}>⬆️ Import CSV</button>
                    </div>
                </div>

                {/* Form */}
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header"><span className="card-title">👤 Create New User</span></div>
                    <form onSubmit={addUser} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, alignItems: "end" }}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input className="form-input" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                                <option>Admin</option>
                                <option>Faculty</option>
                                <option>Student</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: 42 }}>Create User</button>
                    </form>
                </div>

                {/* Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead><tr><th>User</th><th>Role</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
                        <tbody>
                            {users.length > 0 ? users.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div className="avatar avatar-sm">{u.username?.[0]?.toUpperCase() || "U"}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{u.username}</div>
                                                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>ID: {u.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={`badge ${roleBadge(u.role)}`}>{roleIcon(u.role)} {u.role}</span></td>
                                    <td style={{ textAlign: "right" }}>
                                        <button className="btn btn-sm" style={{ background: "#fee2e2", color: "#dc2626" }} onClick={() => deleteUser(u.id)}>🗑 Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3"><div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-title">No users found</div></div></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <CsvUploadModal isOpen={csvModalOpen} onClose={(ok) => { setCsvModalOpen(false); if (ok) { fetchUsers(); toast.success("Users imported!"); }}} uploadUrl="http://localhost:5000/api/users/import" title="Import Users via CSV" sampleData="username,password,role" />
            </div>
        </div>
    );
}

export default Users;