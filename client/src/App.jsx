import { Routes, Route, Navigate } from "react-router-dom";
import Attendance from "./pages/attendance";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Students from "./pages/students";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import Marks from "./pages/Marks";
import Users from "./pages/users";
import Settings from "./pages/Settings";
import Leave from "./pages/leave";
import Rooms from "./pages/Rooms";
import Library from "./pages/Library";
import Fees from "./pages/Fees";
import Allocation from "./pages/Allocation";
import Exams from "./pages/Exams";
import Assignments from "./pages/Assignments";
import Timetable from "./pages/Timetable";
import StudentProfile from "./pages/StudentProfile";
import Announcements from "./pages/Announcements";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            {/* Public Login Route */}
            <Route path="/" element={<Login />} />

            {/* Dashboard (Admin & Faculty) */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty"]}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* Student Directory & Profiles */}
            <Route
                path="/students"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty"]}>
                        <Students />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/add-student"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <AddStudent />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/edit-student/:id"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <EditStudent />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student-profile"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <StudentProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student-profile/:id"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <StudentProfile />
                    </ProtectedRoute>
                }
            />

            {/* Academic Modules */}
            <Route
                path="/attendance"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Attendance />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/marks"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Marks />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/fees"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Fees />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/exams"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Exams />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/assignments"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Assignments />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/timetable"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Timetable />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/library"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Library />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/leave"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Leave />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/announcements"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Announcements />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Settings />
                    </ProtectedRoute>
                }
            />

            {/* Admin-Only Management Modules */}
            <Route
                path="/users"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <Users />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/rooms"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <Rooms />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/allocation"
                element={
                    <ProtectedRoute allowedRoles={["Admin", "Faculty", "Student"]}>
                        <Allocation />
                    </ProtectedRoute>
                }
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;