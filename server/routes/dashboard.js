const express = require("express");
const router = express.Router();
const db = require("../database/database");

/*
==================================
DASHBOARD STATISTICS
==================================
*/

router.get("/dashboard", (req, res) => {

    db.get(
        `
        SELECT

            (SELECT COUNT(*) FROM students)
            AS totalStudents,

            (SELECT COUNT(*) FROM attendance)
            AS totalAttendance,

            (SELECT COUNT(*) FROM marks)
            AS totalMarks,

            (SELECT COUNT(*)
             FROM leaves
             WHERE status = 'Pending')
            AS pendingLeaves

        `,
        [],
        (err, row) => {

            if (err) {

                console.error(
                    "DASHBOARD ERROR:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to load dashboard data"
                });

            }

            res.json({
                success: true,
                totalStudents: row.totalStudents || 0,
                totalAttendance: row.totalAttendance || 0,
                totalMarks: row.totalMarks || 0,
                pendingLeaves: row.pendingLeaves || 0
            });

        }
    );

});

module.exports = router;