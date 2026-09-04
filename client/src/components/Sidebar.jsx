import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const NAV_ADMIN = [
    { to: "/dashboard",     icon: "📊", label: "Dashboard" },
    { to: "/students",      icon: "🎓", label: "Students" },
    { to: "/add-student",   icon: "➕", label: "Add Student" },
    { to: "/attendance",    icon: "📅", label: "Attendance" },
    { to: "/marks",         icon: "📝", label: "Marks & Grades" },
    { to: "/fees",          icon: "💳", label: "Fees Management" },
    { to: "/exams",         icon: "📋", label: "Exam Schedules" },
    { to: "/assignments",   icon: "📌", label: "Assignments" },
    { to: "/timetable",     icon: "🕐", label: "Timetable" },
    { to: "/library",       icon: "📚", label: "Library Catalogue" },
    { to: "/rooms",         icon: "🏫", label: "Exam Rooms" },
    { to: "/allocation",    icon: "🪑", label: "Seating Allocation" },
    { to: "/leave",         icon: "🌴", label: "Leave Requests" },
    { to: "/announcements", icon: "📢", label: "Announcements" },
    { to: "/users",         icon: "👥", label: "User Accounts" },
];

const NAV_FACULTY = [
    { to: "/dashboard",     icon: "📊", label: "Dashboard" },
    { to: "/students",      icon: "🎓", label: "Students List" },
    { to: "/attendance",    icon: "📅", label: "Mark Attendance" },
    { to: "/marks",         icon: "📝", label: "Grade Marks" },
    { to: "/assignments",   icon: "📌", label: "Assignments" },
    { to: "/exams",         icon: "📋", label: "Exam Schedule" },
    { to: "/timetable",     icon: "🕐", label: "Class Timetable" },
    { to: "/library",       icon: "📚", label: "Library" },
    { to: "/allocation",    icon: "🪑", label: "Seating Views" },
    { to: "/leave",         icon: "🌴", label: "Leave Approvals" },
    { to: "/announcements", icon: "📢", label: "Announcements" },
];

const NAV_STUDENT = [
    { to: "/student-profile", icon: "👤", label: "My Profile" },
    { to: "/attendance",      icon: "📅", label: "My Attendance" },
    { to: "/marks",           icon: "📝", label: "My Marks & Grades" },
    { to: "/fees",            icon: "💳", label: "My Fee Status" },
    { to: "/assignments",     icon: "📌", label: "Assignments" },
    { to: "/exams",           icon: "📋", label: "Exam Schedule" },
    { to: "/timetable",       icon: "🕐", label: "My Timetable" },
    { to: "/library",         icon: "📚", label: "Library Catalogue" },
    { to: "/allocation",      icon: "🪑", label: "My Exam Seat" },
    { to: "/leave",           icon: "🌴", label: "Apply Leave" },
    { to: "/announcements",   icon: "📢", label: "Announcements" },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const rawRole = localStorage.getItem("role") || "Student";
    const role = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
    const username = localStorage.getItem("username") || "User";

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        if (theme === "dark") {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(t => (t === "light" ? "dark" : "light"));
    };

    const navItems =
        role === "Admin"
            ? NAV_ADMIN
            : role === "Faculty"
            ? NAV_FACULTY
            : NAV_STUDENT;

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        navigate("/");
    };

    const initials = username.slice(0, 2).toUpperCase();

    const roleBadgeStyles = {
        Admin:   { bg: "linear-gradient(135deg, #7c3aed, #4f46e5)", text: "#ffffff", border: "rgba(124, 58, 237, 0.4)", label: "Administrator" },
        Faculty: { bg: "linear-gradient(135deg, #2563eb, #0284c7)", text: "#ffffff", border: "rgba(37, 99, 235, 0.4)", label: "Faculty Member" },
        Student: { bg: "linear-gradient(135deg, #059669, #10b981)", text: "#ffffff", border: "rgba(16, 185, 129, 0.4)", label: "Enrolled Student" }
    }[role] || { bg: "#475569", text: "#ffffff", border: "#334155", label: role };

    return (
        <aside className="sidebar">
            {/* Header / Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">🎓</div>
                <div>
                    <div className="sidebar-logo-text">EduAdmin</div>
                    <div className="sidebar-logo-sub">Enterprise Campus Hub</div>
                </div>
            </div>

            {/* Role Badge Indicator */}
            <div style={{ padding: "0 20px 16px" }}>
                <div style={{
                    background: roleBadgeStyles.bg,
                    color: roleBadgeStyles.text,
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}>
                    <span style={{ fontSize: "0.9rem" }}>
                        {role === "Admin" ? "👑" : role === "Faculty" ? "🎓" : "📚"}
                    </span>
                    <span>{roleBadgeStyles.label}</span>
                </div>
            </div>

            {/* Nav Menu */}
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Main Modules</div>
                {navItems.map(({ to, icon, label }) => {
                    const isActive = location.pathname === to || (to === "/student-profile" && location.pathname.startsWith("/student-profile"));
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`sidebar-link ${isActive ? "active" : ""}`}
                        >
                            <span className="sidebar-link-icon">{icon}</span>
                            <span style={{ flex: 1 }}>{label}</span>
                            {isActive && (
                                <span style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#3b82f6",
                                    boxShadow: "0 0 8px #3b82f6"
                                }} />
                            )}
                        </Link>
                    );
                })}

                <div className="sidebar-section-label" style={{ marginTop: 16 }}>Preferences</div>
                <button
                    className="sidebar-link"
                    onClick={toggleTheme}
                    style={{ marginTop: 2 }}
                >
                    <span className="sidebar-link-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
                    <span>{theme === "dark" ? "Light Theme" : "Dark Theme"}</span>
                </button>
                <Link
                    to="/settings"
                    className={`sidebar-link ${location.pathname === "/settings" ? "active" : ""}`}
                >
                    <span className="sidebar-link-icon">⚙️</span>
                    <span>Account Settings</span>
                </Link>
                <button
                    className="sidebar-link"
                    onClick={logout}
                    style={{ color: "#ef4444", marginTop: 4 }}
                >
                    <span className="sidebar-link-icon">🚪</span>
                    <span>Sign Out</span>
                </button>
            </nav>

            {/* Footer user profile */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">{initials}</div>
                    <div style={{ overflow: "hidden", flex: 1 }}>
                        <div className="sidebar-user-name">{username}</div>
                        <div className="sidebar-user-role">{role} Account</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;