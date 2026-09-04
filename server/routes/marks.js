const express = require("express");
const router = express.Router();
const db = require("../database/database");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

/*
========================================
IMPORT MARKS FROM CSV
========================================
*/
router.post("/marks/import", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload a CSV file" });
    }

    const marksData = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            const { studentId, subject, marks } = row;
            if (studentId && subject && marks) {
                marksData.push({
                    studentId: studentId.trim(),
                    subject: subject.trim(),
                    marks: Number(marks.trim())
                });
            }
        })
        .on("end", async () => {
            if (marksData.length === 0) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, message: "No valid records found in CSV" });
            }

            let inserted = 0;
            let failed = 0;

            for (const item of marksData) {
                try {
                    await new Promise((resolve, reject) => {
                        db.run(
                            "INSERT INTO marks (studentId, subject, marks) VALUES (?, ?, ?)",
                            [item.studentId, item.subject, item.marks],
                            function(err) {
                                if (err) reject(err);
                                else resolve();
                            }
                        );
                    });
                    inserted++;
                } catch (err) {
                    failed++;
                }
            }

            fs.unlinkSync(req.file.path);
            res.json({
                success: true,
                message: "Marks imported successfully",
                totalRecords: marksData.length,
                inserted,
                failed
            });
        })
        .on("error", (err) => {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.status(500).json({ success: false, message: err.message });
        });
});

/*
==================================
GET MARKS
==================================
*/

router.get("/marks", (req, res) => {

    db.all(

        `SELECT
        marks.id,
        students.name,
        marks.subject,
        marks.marks
        FROM marks
        INNER JOIN students
        ON marks.studentId = students.id`,

        [],

        (err, rows) => {

            if (err) {

                return res.status(500).json({

                    success: false,

                    message: err.message

                });

            }

            res.json(rows);

        }

    );

});

/*
==================================
ADD MARKS
==================================
*/

router.post("/marks", (req, res) => {

    const {

        studentId,
        subject,
        marks

    } = req.body;

    db.run(

        `INSERT INTO marks
        (studentId,subject,marks)
        VALUES(?,?,?)`,

        [

            studentId,
            subject,
            marks

        ],

        function (err) {

            if (err) {

                return res.status(500).json({

                    success: false,

                    message: err.message

                });

            }

            res.json({

                success: true,

                message: "Marks Saved"

            });

        }

    );

});

module.exports = router;