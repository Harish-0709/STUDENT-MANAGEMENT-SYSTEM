import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { toast } from "../components/Toast";

function Settings() {
    const navigate  = useNavigate();
    const username  = localStorage.getItem("username");
    const role      = localStorage.getItem("role");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword]         = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading]                 = useState(false);

    const roleColor  = { Admin: "#8b5cf6", Faculty: "#3b82f6", Student: "#10b981" }[role] || "#64748b";
    const roleBg     = { Admin: "#ede9fe", Faculty: "#dbeafe", Student: "#dcfce7"  }[role] || "#f1f5f9";
    const initials   = username?.slice(0, 2).toUpperCase() || "U";

    const changePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { toast.error("New passwords do not match"); return; }
        if (newPassword.length < 6)         { toast.error("Password must be at least 6 characters"); return; }
        setLoading(true);
        try {
            const r = await api.put("/change-password", { currentPassword, newPassword });
            toast.success(r.data.message || "Password changed successfully");
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Unable to change password");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        navigate("/");
    };

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Settings</h1>
                        <p className="page-subtitle">Manage your account preferences</p>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
                    {/* Profile Card */}
                    <div>
                        <div className="card" style={{ textAlign: "center" }}>
                            <div style={{
                                width: 80, height: 80,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", fontWeight: 700, fontSize: "1.75rem",
                                margin: "0 auto 16px"
                            }}>{initials}</div>
                            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{username}</div>
                            <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
                                <span className="badge" style={{ background: roleBg, color: roleColor }}>
                                    {role === "Admin" ? "👑" : role === "Faculty" ? "🎓" : "📚"} {role}
                                </span>
                            </div>
                            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "20px 0" }} />
                            <button className="btn btn-danger" style={{ width: "100%" }} onClick={logout}>
                                🚪 Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🔒 Change Password</span>
                        </div>
                        <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input className="form-input" type="password" placeholder="Enter current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input className="form-input" type="password" placeholder="Enter new password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input className="form-input" type="password" placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Saving..." : "🔒 Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;