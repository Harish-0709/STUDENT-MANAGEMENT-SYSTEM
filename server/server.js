require("dotenv").config();
const path = require("path");
const leaveRoutes = require("./routes/leave");
const express = require("express");
const cors = require("cors");
const roomRoutes = require("./routes/rooms");
const marksRoutes = require("./routes/marks");
const db = require("./database/database");
const userRoutes = require("./routes/users");
const app = express();
const allocationRoutes = require("./routes/allocation");
const libraryRoutes = require("./routes/library");
const examRoutes = require("./routes/exams");
const assignmentRoutes = require("./routes/assignments");
const timetableRoutes=require("./routes/timetable");
const feesRoutes = require("./routes/fees");
const dashboardRoutes = require("./routes/dashboard");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const attendanceRoutes=require("./routes/attendance");
const announcementRoutes=require("./routes/announcement");
const studentImportRoutes =require("./routes/studentImport");
app.use(cors());
app.use(express.json());
app.use("/api", roomRoutes);
app.use("/api",timetableRoutes);
app.use("/api", libraryRoutes);
app.use("/api", studentImportRoutes);
app.use("/api", examRoutes);
app.use("/api", assignmentRoutes);
app.use("/api", userRoutes);
app.use("/api", announcementRoutes);
app.use("/api", authRoutes);
app.use("/api", feesRoutes);
app.use("/api", studentRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", marksRoutes);
app.use("/api", allocationRoutes);
app.use("/api", leaveRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
    res.json({
        message: "Student Management Backend Running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});