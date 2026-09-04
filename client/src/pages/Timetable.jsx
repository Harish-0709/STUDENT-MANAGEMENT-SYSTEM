import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { toast } from "../components/Toast";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DEPTS = ["CSE","ECE","EEE","MECH","CIVIL"];

function Timetable() {
    const [timetable, setTimetable] = useState([]);
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [day, setDay] = useState("");
    const [period1, setPeriod1] = useState("");
    const [period2, setPeriod2] = useState("");
    const [period3, setPeriod3] = useState("");
    const [period4, setPeriod4] = useState("");
    const [period5, setPeriod5] = useState("");
    const [period6, setPeriod6] = useState("");

    useEffect(() => { fetchTimetable(); }, []);
    const fetchTimetable = async () => { try { const r = await api.get("/timetable"); setTimetable(r.data); } catch {} };

    const saveTimetable = async (e) => {
        e.preventDefault();
        try {
            await api.post("/timetable", { department, year, day, period1, period2, period3, period4, period5, period6 });
            toast.success("Timetable saved");
            setDepartment(""); setYear(""); setDay(""); setPeriod1(""); setPeriod2(""); setPeriod3(""); setPeriod4(""); setPeriod5(""); setPeriod6("");
            fetchTimetable();
        } catch { toast.error("Unable to save timetable"); }
    };

    const autoGenerateWeeklySchedule = async () => {
        const targetDept = department || "CSE";
        const targetYear = year || "2";

        const sampleSubjects = ["Data Structures", "Computer Networks", "Database Systems", "Operating Systems", "Software Eng", "Web Tech", "Algorithms Lab"];

        if (!window.confirm(`Auto-generate a complete 5-day weekly timetable for ${targetDept} Year ${targetYear}?`)) return;

        try {
            const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
            for (let i = 0; i < weekdays.length; i++) {
                const dayName = weekdays[i];
                await api.post("/timetable", {
                    department: targetDept,
                    year: targetYear,
                    day: dayName,
                    period1: sampleSubjects[i % sampleSubjects.length],
                    period2: sampleSubjects[(i + 1) % sampleSubjects.length],
                    period3: sampleSubjects[(i + 2) % sampleSubjects.length],
                    period4: "LUNCH BREAK",
                    period5: sampleSubjects[(i + 3) % sampleSubjects.length],
                    period6: sampleSubjects[(i + 4) % sampleSubjects.length]
                });
            }
            toast.success(`Auto-generated 5-day weekly timetable for ${targetDept} Yr ${targetYear}!`);
            fetchTimetable();
        } catch {
            toast.error("Error auto-generating timetable");
        }
    };

    return (
        <div className="page-layout">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Timetable</h1>
                        <p className="page-subtitle">Manage weekly class schedules with automated timetable generation</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <button className="btn btn-secondary btn-sm" onClick={autoGenerateWeeklySchedule}>⚡ Auto-Generate Weekly Timetable</button>
                        <span className="badge badge-blue">{timetable.length} entries</span>
                    </div>
                </div>

                {/* Form */}
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header">
                        <span className="card-title">🕐 Add Timetable Entry</span>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={autoGenerateWeeklySchedule}>⚡ Auto-Fill Week</button>
                    </div>
                    <form onSubmit={saveTimetable}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)} required>
                                    <option value="">Select</option>
                                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Year</label>
                                <select className="form-select" value={year} onChange={e => setYear(e.target.value)} required>
                                    <option value="">Select</option>
                                    {[1,2,3,4].map(y => <option key={y}>{y}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Day</label>
                                <select className="form-select" value={day} onChange={e => setDay(e.target.value)} required>
                                    <option value="">Select</option>
                                    {DAYS.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16, marginBottom: 16 }}>
                            {[
                                ["Period 1", period1, setPeriod1], ["Period 2", period2, setPeriod2], ["Period 3", period3, setPeriod3],
                                ["Period 4", period4, setPeriod4], ["Period 5", period5, setPeriod5], ["Period 6", period6, setPeriod6],
                            ].map(([label, val, setter]) => (
                                <div className="form-group" key={label}>
                                    <label className="form-label">{label}</label>
                                    <input className="form-input" placeholder="Subject" value={val} onChange={e => setter(e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button type="submit" className="btn btn-primary">🕐 Save Timetable</button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Department</th><th>Year</th><th>Day</th>
                                <th>P1</th><th>P2</th><th>P3</th><th>P4</th><th>P5</th><th>P6</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timetable.length > 0 ? timetable.map(t => (
                                <tr key={t.id}>
                                    <td><span className="badge badge-blue">{t.department}</span></td>
                                    <td><span className="badge badge-gray">Yr {t.year}</span></td>
                                    <td style={{ fontWeight: 600 }}>{t.day}</td>
                                    {[t.period1, t.period2, t.period3, t.period4, t.period5, t.period6].map((p, i) => (
                                        <td key={i} style={{ fontSize: "0.82rem", color: p ? "var(--text)" : "var(--text-muted)" }}>{p || "—"}</td>
                                    ))}
                                </tr>
                            )) : (
                                <tr><td colSpan="9"><div className="empty-state"><div className="empty-state-icon">🕐</div><div className="empty-state-title">No timetable entries</div></div></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Timetable;