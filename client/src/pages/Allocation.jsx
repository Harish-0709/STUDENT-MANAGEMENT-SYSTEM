import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { toast } from "../components/Toast";

function Allocation() {
    const role = localStorage.getItem("role") || "Student";
    const username = localStorage.getItem("username") || "";

    const [exams, setExams] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedExam, setSelectedExam] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allocationSummary, setAllocationSummary] = useState(null);

    useEffect(() => {
        fetchExams();
        fetchRooms();
    }, []);

    const fetchExams = async () => {
        try {
            const r = await api.get("/exams");
            setExams(r.data);
            if (r.data.length > 0 && !selectedExam) {
                setSelectedExam(r.data[0].id);
                loadAllocations(r.data[0].id);
            }
        } catch {
            toast.error("Unable to load exams");
        }
    };

    const fetchRooms = async () => {
        try {
            const r = await api.get("/rooms");
            setRooms(r.data);
        } catch {
            toast.error("Unable to load rooms");
        }
    };

    const loadAllocations = async (examId) => {
        if (!examId) return;
        try {
            const r = await api.get(`/allocations/${examId}`);
            setAllocations(r.data);
            const rList = [...new Set(r.data.map(a => String(a.roomNo)))];
            if (rList.length > 0 && !selectedRoom) {
                setSelectedRoom(rList[0]);
            }
        } catch {}
    };

    const generateAllocation = async () => {
        if (!selectedExam) { toast.warning("Please select an exam"); return; }
        try {
            setLoading(true);
            const r = await api.post(`/allocate/${selectedExam}`);
            setAllocationSummary(r.data);
            await loadAllocations(selectedExam);
            toast.success(r.data.message || "Seating allocation generated successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Unable to generate allocation");
        } finally {
            setLoading(false);
        }
    };

    const handleExamChange = (e) => {
        const id = e.target.value;
        setSelectedExam(id);
        setSelectedRoom("");
        setAllocations([]);
        setAllocationSummary(null);
        if (id) loadAllocations(id);
    };

    const allocatedRooms = [...new Set(allocations.map(a => String(a.roomNo)))];
    const currentRoom = rooms.find(r => String(r.roomNo) === String(selectedRoom));
    const roomRows = currentRoom ? Number(currentRoom.rows) : 0;
    const roomColumns = currentRoom ? Number(currentRoom.columns) : 0;
    const getStudentAtSeat = (row, col) => allocations.find(a => String(a.roomNo) === String(selectedRoom) && Number(a.rowNo) === row && Number(a.columnNo) === col);

    // Student specific seat lookup
    const mySeat = allocations.find(a => a.name?.toLowerCase().includes(username.toLowerCase()) || a.rollNumber?.toLowerCase() === username.toLowerCase());

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">{role === "Student" ? "My Exam Seating Arrangement" : "Seating Allocation Management"}</h1>
                        <p className="page-subtitle">
                            {role === "Student"
                                ? "Check your designated examination hall, row, and seat allocation"
                                : "Auto-distribute student cohorts across halls and generate seat plans"}
                        </p>
                    </div>
                    {allocations.length > 0 && (
                        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>🖨️ Print Seating Chart</button>
                    )}
                </div>

                {/* Student Personal Seat Card */}
                {role === "Student" && (
                    <div className="card" style={{ marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)", border: "1px solid #bfdbfe" }}>
                        <div className="card-header">
                            <span className="card-title">🪑 Your Allocated Exam Seat</span>
                            <span className="badge badge-green">Confirmed</span>
                        </div>
                        {mySeat ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                                <div style={{ background: "white", padding: 16, borderRadius: 10, border: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Exam Hall / Room</div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>Room {mySeat.roomNo}</div>
                                </div>
                                <div style={{ background: "white", padding: 16, borderRadius: 10, border: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Assigned Row</div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#8b5cf6", marginTop: 4 }}>Row {mySeat.rowNo}</div>
                                </div>
                                <div style={{ background: "white", padding: 16, borderRadius: 10, border: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Desk Column / Seat</div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", marginTop: 4 }}>Seat #{mySeat.columnNo}</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: "16px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                Select an examination below to check your allocated desk location.
                            </div>
                        )}
                    </div>
                )}

                {/* Exam Selection Bar */}
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header"><span className="card-title">📋 Select Examination Session</span></div>
                    <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
                        <div className="form-group" style={{ flex: 1, minWidth: 260 }}>
                            <label className="form-label">Examination Course *</label>
                            <select className="form-select" value={selectedExam} onChange={handleExamChange}>
                                <option value="">-- Choose Exam --</option>
                                {exams.map(e => (
                                    <option key={e.id} value={e.id}>
                                        {e.subject} — {e.department} — Year {e.year} ({e.examDate || "Date TBA"})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {role !== "Student" && (
                            <button className="btn btn-primary" onClick={generateAllocation} disabled={loading} style={{ height: 42 }}>
                                {loading ? "⏳ Generating..." : "⚡ Auto-Allocate Seats"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary Metrics */}
                {allocationSummary && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                        {[
                            { label: "Assigned Students", value: allocationSummary.totalStudents, icon: "🎓", color: "#3b82f6", bg: "#dbeafe" },
                            { label: "Total Available Desks", value: allocationSummary.totalSeats, icon: "🪑", color: "#10b981", bg: "#d1fae5" },
                            { label: "Exam Rooms Used", value: allocationSummary.roomsUsed, icon: "🏫", color: "#8b5cf6", bg: "#ede9fe" },
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
                )}

                {/* Room Seating View */}
                {allocatedRooms.length > 0 && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">🏫 Visual Seating Grid</span>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Room:</label>
                                <select className="form-select" style={{ width: "auto", minWidth: 140 }} value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
                                    {allocatedRooms.map(rn => <option key={rn} value={rn}>Room {rn}</option>)}
                                </select>
                            </div>
                        </div>

                        {selectedRoom && currentRoom ? (
                            <div style={{ overflowX: "auto", paddingBottom: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                    <span style={{ fontWeight: 700 }}>Room {currentRoom.roomNo}</span>
                                    <span className="badge badge-blue">{currentRoom.capacity} desk capacity</span>
                                    <span className="badge badge-gray">{roomRows} Rows × {roomColumns} Columns</span>
                                </div>

                                {/* Column headers */}
                                <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${roomColumns}, minmax(100px, 1fr))`, gap: 8, marginBottom: 8, minWidth: roomColumns * 110 + 60 }}>
                                    <div />
                                    {Array.from({ length: roomColumns }, (_, i) => (
                                        <div key={i} style={{ textAlign: "center", fontWeight: 700, fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                                            Col {i + 1}
                                        </div>
                                    ))}
                                </div>

                                {/* Rows */}
                                {Array.from({ length: roomRows }, (_, ri) => {
                                    const row = ri + 1;
                                    return (
                                        <div key={row} style={{ display: "grid", gridTemplateColumns: `60px repeat(${roomColumns}, minmax(100px, 1fr))`, gap: 8, marginBottom: 8, minWidth: roomColumns * 110 + 60 }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                Row {row}
                                            </div>
                                            {Array.from({ length: roomColumns }, (_, ci) => {
                                                const col = ci + 1;
                                                const student = getStudentAtSeat(row, col);
                                                return (
                                                    <div
                                                        key={col}
                                                        style={{
                                                            borderRadius: 8,
                                                            minHeight: 68,
                                                            padding: "6px 8px",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            background: student ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)" : "#f8fafc",
                                                            border: student ? "1.5px solid #86efac" : "1.5px dashed #cbd5e1",
                                                            boxShadow: student ? "0 2px 6px rgba(34,197,94,0.15)" : "none"
                                                        }}
                                                    >
                                                        {student ? (
                                                            <>
                                                                <div style={{ fontWeight: 800, fontSize: "0.75rem", color: "#166534" }}>{student.rollNumber}</div>
                                                                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "#15803d", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                                                                    {student.name}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Empty Desk</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-title">Select an allocated room above</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Allocation Full Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Roll Number</th>
                                <th>Student Name</th>
                                <th>Department</th>
                                <th>Year</th>
                                <th>Assigned Hall</th>
                                <th>Seat Coordinates</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allocations.length > 0 ? allocations.map(a => (
                                <tr key={a.id}>
                                    <td><code style={{ fontSize: "0.82rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>{a.rollNumber}</code></td>
                                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                                    <td><span className="badge badge-blue">{a.department}</span></td>
                                    <td><span className="badge badge-gray">Year {a.year}</span></td>
                                    <td><span className="badge badge-purple">🏫 Room {a.roomNo}</span></td>
                                    <td style={{ fontWeight: 600, color: "var(--text-muted)" }}>Row {a.rowNo} • Desk {a.columnNo}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">🪑</div>
                                            <div className="empty-state-title">No seating allocation generated</div>
                                            <div className="empty-state-desc">
                                                {role === "Student" ? "Seating arrangement for this exam is not published yet" : "Click Auto-Allocate Seats above to generate a seating plan"}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Allocation;