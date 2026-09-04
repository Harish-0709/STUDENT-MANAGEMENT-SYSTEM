import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { toast } from "../components/Toast";

function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle]   = useState("");
    const [message, setMessage] = useState("");
    const role = localStorage.getItem("role");

    useEffect(() => { fetchAnnouncements(); }, []);

    const fetchAnnouncements = async () => {
        try { const r = await api.get("/announcements"); setAnnouncements(r.data); }
        catch { console.log("Failed to fetch announcements"); }
    };

    const addAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post("/announcements", { title, message });
            toast.success("Announcement posted");
            setTitle(""); setMessage("");
            fetchAnnouncements();
        } catch {
            toast.error("Unable to post announcement");
        }
    };

    const deleteAnnouncement = async (id) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            await api.delete(`/announcements/${id}`);
            toast.success("Announcement deleted");
            fetchAnnouncements();
        } catch {
            toast.error("Unable to delete");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try { return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
        catch { return dateStr; }
    };

    const applyTemplate = (tTitle, tMsg) => {
        setTitle(tTitle);
        setMessage(tMsg);
        toast.info(`Applied template: "${tTitle}"`);
    };

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Announcements</h1>
                        <p className="page-subtitle">Broadcast important campus notices with automated template presets</p>
                    </div>
                    <span className="badge badge-purple">{announcements.length} total</span>
                </div>

                {/* Post Form (Admin/Faculty only) */}
                {role !== "Student" && (
                    <div className="card" style={{ marginBottom: 28 }}>
                        <div className="card-header">
                            <span className="card-title">📢 Post Announcement</span>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyTemplate("📋 Semester Exam Schedule Published", "The final examination schedule for the current semester has been released. Please check your exam portal for room assignments.")}>⚡ Exam Notice</button>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyTemplate("💳 Fee Payment Reminder", "This is a reminder that tuition fee dues for the upcoming semester are payable by end of this week to avoid late penalties.")}>⚡ Fee Reminder</button>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyTemplate("🌴 Campus Holiday Notice", "The institute will remain closed on Monday on account of a public holiday. Regular classes resume on Tuesday.")}>⚡ Holiday Notice</button>
                            </div>
                        </div>
                        <form onSubmit={addAnnouncement} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input className="form-input" placeholder="Announcement title" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea className="form-textarea" placeholder="Write your announcement..." value={message} onChange={e => setMessage(e.target.value)} required />
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <button type="submit" className="btn btn-primary">📢 Post Announcement</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Announcements Feed */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {announcements.length > 0 ? announcements.map((item, i) => (
                        <div key={item.id} className="card" style={{ borderLeft: "4px solid var(--primary)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                        <span className="badge badge-blue">#{i + 1}</span>
                                        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{item.title}</h3>
                                    </div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>{item.message}</p>
                                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#94a3b8" }}>
                                        <span>🕒</span>
                                        <span>{formatDate(item.createdAt)}</span>
                                    </div>
                                </div>
                                {role !== "Student" && (
                                    <button
                                        className="btn btn-sm"
                                        style={{ background: "#fee2e2", color: "#dc2626", flexShrink: 0 }}
                                        onClick={() => deleteAnnouncement(item.id)}
                                    >🗑 Delete</button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon">📢</div>
                                <div className="empty-state-title">No announcements yet</div>
                                <div className="empty-state-desc">Post an announcement to let students and faculty know about important updates</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Announcements;