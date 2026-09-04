import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { toast } from "../components/Toast";

function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [roomNo, setRoomNo] = useState("");
    const [capacity, setCapacity] = useState("");
    const [rows, setRows] = useState("");
    const [columns, setColumns] = useState("");
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchRooms(); }, []);
    const fetchRooms = async () => { try { const r = await api.get("/rooms"); setRooms(r.data); } catch { } };

    const clearForm = () => { setRoomNo(""); setCapacity(""); setRows(""); setColumns(""); setEditingId(null); };

    const saveRoom = async (e) => {
        e.preventDefault();
        if (Number(rows) * Number(columns) < Number(capacity)) { toast.warning("Rows × Columns must be ≥ capacity"); return; }
        try {
            const data = { roomNo, capacity: Number(capacity), rows: Number(rows), columns: Number(columns) };
            if (editingId) {
                await api.put(`/rooms/${editingId}`, data);
                toast.success("Room updated successfully");
            } else {
                await api.post("/rooms", data);
                toast.success("Room added successfully");
            }
            clearForm(); fetchRooms();
        } catch (err) { toast.error(err.response?.data?.message || "Unable to save room"); }
    };

    const editRoom = (room) => {
        setEditingId(room.id); setRoomNo(room.roomNo); setCapacity(room.capacity); setRows(room.rows); setColumns(room.columns);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteRoom = async (id) => {
        if (!window.confirm("Delete this room?")) return;
        try { await api.delete(`/rooms/${id}`); toast.success("Room deleted"); fetchRooms(); }
        catch (err) { toast.error(err.response?.data?.message || "Unable to delete room"); }
    };

    const totalSeats = rooms.reduce((s, r) => s + Number(r.rows) * Number(r.columns), 0);
    const totalCapacity = rooms.reduce((s, r) => s + Number(r.capacity), 0);

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Room Management</h1>
                        <p className="page-subtitle">Configure exam halls and classroom layouts</p>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                    {[
                        { label: "Total Rooms", value: rooms.length, icon: "🏫", color: "#3b82f6", bg: "#dbeafe" },
                        { label: "Total Capacity", value: totalCapacity, icon: "👥", color: "#8b5cf6", bg: "#ede9fe" },
                        { label: "Total Seats", value: totalSeats, icon: "🪑", color: "#10b981", bg: "#dcfce7" },
                    ].map(c => (
                        <div key={c.label} className="stat-card">
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color, borderRadius: "var(--radius) var(--radius) 0 0" }} />
                            <div className="stat-card-icon" style={{ background: c.bg }}>{c.icon}</div>
                            <div><div className="stat-card-value">{c.value}</div><div className="stat-card-label">{c.label}</div></div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header">
                        <span className="card-title">{editingId ? "✏️ Edit Room" : "🏫 Add Room"}</span>
                        {editingId && <button className="btn btn-secondary btn-sm" onClick={clearForm}>✕ Cancel Edit</button>}
                    </div>
                    <form onSubmit={saveRoom} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, alignItems: "end" }}>
                        <div className="form-group">
                            <label className="form-label">Room Number</label>
                            <input className="form-input" placeholder="e.g. A101" value={roomNo} onChange={e => setRoomNo(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Capacity</label>
                            <input className="form-input" type="number" min="1" placeholder="30" value={capacity} onChange={e => setCapacity(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Rows</label>
                            <input className="form-input" type="number" min="1" placeholder="5" value={rows} onChange={e => setRows(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Columns</label>
                            <input className="form-input" type="number" min="1" placeholder="6" value={columns} onChange={e => setColumns(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: 42 }}>{editingId ? "Update Room" : "Add Room"}</button>
                    </form>
                </div>

                {/* Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead><tr><th>Room No</th><th>Capacity</th><th>Layout</th><th>Total Seats</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
                        <tbody>
                            {rooms.length > 0 ? rooms.map(r => (
                                <tr key={r.id}>
                                    <td><span style={{ fontWeight: 700, color: "var(--primary)" }}>{r.roomNo}</span></td>
                                    <td><span className="badge badge-blue">{r.capacity} students</span></td>
                                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{r.rows} rows × {r.columns} cols</td>
                                    <td><span className="badge badge-green">{Number(r.rows) * Number(r.columns)} seats</span></td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => editRoom(r)}>✏️ Edit</button>
                                            <button className="btn btn-sm" style={{ background: "#fee2e2", color: "#dc2626" }} onClick={() => deleteRoom(r.id)}>🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5"><div className="empty-state"><div className="empty-state-icon">🏫</div><div className="empty-state-title">No rooms available</div></div></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Rooms;