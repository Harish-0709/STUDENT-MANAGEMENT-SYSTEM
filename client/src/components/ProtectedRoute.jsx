import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const rawRole = localStorage.getItem("role") || "";
    const role = rawRole ? (rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()) : "";

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
        if (!normalizedAllowed.includes(role.toLowerCase())) {
            if (role.toLowerCase() === "student") {
                return <Navigate to="/student-profile" replace />;
            }
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;