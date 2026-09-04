const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const db = require("../database/database");

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});


/*
========================================
IMPORT STUDENTS FROM CSV
========================================
*/

router.post(
    "/students/import",
    upload.single("file"),
    (req, res) => {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please upload a CSV file"
            });

        }

        const students = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (row) => {

                const studentId =
                    row.rollnumber ||
                    row.studentId;

                const name =
                    row.name;

                const department =
                    row.department;

                const year =
                    row.semester ||
                    row.year;

                if (
                    studentId &&
                    name &&
                    department &&
                    year
                ) {

                    students.push([
                        studentId.trim(),
                        name.trim(),
                        department.trim(),
                        Number(year)
                    ]);

                }

            })
            .on("end", () => {

                if (students.length === 0) {

                    fs.unlinkSync(req.file.path);

                    return res.status(400).json({
                        success: false,
                        message:
                            "No valid student records found"
                    });

                }


                const stmt = db.prepare(`
                    INSERT INTO students
                    (
                        studentId,
                        name,
                        department,
                        year
                    )
                    VALUES (?, ?, ?, ?)
                `);


                let inserted = 0;
                let failed = 0;


                students.forEach((student) => {

                    stmt.run(
                        student,
                        (err) => {

                            if (err) {

                                failed++;

                            } else {

                                inserted++;

                            }

                        }
                    );

                });


                stmt.finalize((err) => {

                    fs.unlinkSync(req.file.path);


                    if (err) {

                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });

                    }


                    res.json({

                        success: true,

                        message:
                            "Students imported successfully",

                        totalRecords:
                            students.length,

                        inserted: inserted,

                        failed: failed

                    });

                });

            })
            .on("error", (err) => {

                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                res.status(500).json({
                    success: false,
                    message: err.message
                });

            });

    }
);


module.exports = router;