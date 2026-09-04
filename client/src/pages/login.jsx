import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (token) {
            if (role === "Student") {
                navigate("/student-profile", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        }
    }, [navigate]);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);
    const [showPass, setShowPass] = useState(false);

    const performLogin = async (u, p) => {
        setError("");
        setLoading(true);
        try {
            const response = await api.post("/login", { username: u, password: p });
            const rawRole = response.data.role || "Student";
            const normalizedRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

            localStorage.setItem("token",    response.data.token);
            localStorage.setItem("role",     normalizedRole);
            localStorage.setItem("username", response.data.username);
            if (response.data.userId) {
                localStorage.setItem("userId", response.data.userId);
            }

            if (normalizedRole === "Student") {
                navigate("/student-profile");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid username or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        performLogin(username, password);
    };

    const setDemoCredentials = (u, p) => {
        setUsername(u);
        setPassword(p);
        performLogin(u, p);
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Left Hero Panel */}
            <div style={{
                flex: 1.2,
                background: "linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 50%, #065f46 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 40px",
                color: "white",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Glowing decorative circles */}
                <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: "-120px", right: "-100px", width: "450px", height: "450px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)" }} />

                <div style={{ position: "relative", textAlign: "center", maxWidth: 460 }}>
                    <div style={{
                        width: 80, height: 80,
                        background: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(12px)",
                        borderRadius: 22,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "2.5rem",
                        margin: "0 auto 24px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
                    }}>🎓</div>

                    <h1 style={{ fontSize: "2.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12, lineHeight: 1.15 }}>
                        EduAdmin Core
                    </h1>
                    <p style={{ fontSize: "1.05rem", opacity: 0.85, lineHeight: 1.6, marginBottom: 36 }}>
                        Enterprise Campus Automation & Student Lifecycle Platform with Role-Based Access Control.
                    </p>

                    {/* Role highlights */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, textAlign: "left" }}>
                        {[
                            ["👑", "Administrator Suite", "Complete campus control, seating generator, user credentials"],
                            ["🎓", "Faculty Portal", "Attendance marking, grade book, assignments, leave reviews"],
                            ["📚", "Student Dashboard", "Live attendance metrics, marks history, seat lookup, fee ledger"]
                        ].map(([icon, title, desc]) => (
                            <div key={title} style={{
                                display: "flex", alignItems: "center", gap: 14,
                                padding: "12px 16px",
                                background: "rgba(255,255,255,0.07)",
                                backdropFilter: "blur(8px)",
                                borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.12)"
                            }}>
                                <span style={{ fontSize: "1.4rem" }}>{icon}</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{title}</div>
                                    <div style={{ fontSize: "0.75rem", opacity: 0.75 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Login Form */}
            <div style={{
                flex: 1,
                minWidth: 420,
                maxWidth: 520,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 40px",
                background: "#ffffff"
            }}>
                <div style={{ width: "100%", maxWidth: 380 }}>
                    <div style={{ marginBottom: 30 }}>
                        <div style={{ display: "inline-block", background: "#eff6ff", color: "#2563eb", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
                            Secure Portal Authentication
                        </div>
                        <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 6 }}>Sign In</h2>
                        <p style={{ color: "#64748b", fontSize: "0.88rem" }}>Choose a role below or enter your login credentials</p>
                    </div>

                    {/* One-Click Role Quick Logins */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                            Quick Demo Logins (Click to Enter)
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                            <button
                                type="button"
                                onClick={() => setDemoCredentials("admin", "admin123")}
                                style={{
                                    padding: "10px 8px", borderRadius: 8, border: "1.5px solid #c7d2fe",
                                    background: "#eef2ff", color: "#4338ca", fontWeight: 700, fontSize: "0.78rem",
                                    cursor: "pointer", transition: "all 0.15s ease", textAlign: "center"
                                }}
                            >
                                👑 Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setDemoCredentials("faculty", "faculty123")}
                                style={{
                                    padding: "10px 8px", borderRadius: 8, border: "1.5px solid #bae6fd",
                                    background: "#f0f9ff", color: "#0369a1", fontWeight: 700, fontSize: "0.78rem",
                                    cursor: "pointer", transition: "all 0.15s ease", textAlign: "center"
                                }}
                            >
                                🎓 Faculty
                            </button>
                            <button
                                type="button"
                                onClick={() => setDemoCredentials("student", "student123")}
                                style={{
                                    padding: "10px 8px", borderRadius: 8, border: "1.5px solid #a7f3d0",
                                    background: "#ecfdf5", color: "#047857", fontWeight: 700, fontSize: "0.78rem",
                                    cursor: "pointer", transition: "all 0.15s ease", textAlign: "center"
                                }}
                            >
                                📚 Student
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>OR SIGN IN MANUALLY</span>
                        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                    </div>

                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>Username</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Username (e.g. admin, faculty, student)"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>Password</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    className="form-input"
                                    type={showPass ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    style={{ paddingRight: 44 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(v => !v)}
                                    style={{
                                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#94a3b8"
                                    }}
                                >
                                    {showPass ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
                                padding: "10px 14px", color: "#dc2626", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 8
                            }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ width: "100%", justifyContent: "center", marginTop: 4, height: 46 }}
                        >
                            {loading ? "⏳ Authenticating..." : "Sign In to Portal →"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;