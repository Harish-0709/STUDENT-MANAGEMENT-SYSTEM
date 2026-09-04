const express = require("express");
const router = express.Router();
const db = require("../database/database");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

/*
========================================
IMPORT ATTENDANCE FROM CSV
========================================
*/
router.post("/attendance/import", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload a CSV file" });
    }

    const records = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            const { studentId, date, status } = row;
            if (studentId && date) {
                records.push({
                    studentId: studentId.trim(),
                    date: date.trim(),
                    status: (status || "Present").trim()
                });
            }
        })
        .on("end", async () => {
            if (records.length === 0) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, message: "No valid records found in CSV" });
            }

            let inserted = 0;
            let failed = 0;

            for (const item of records) {
                try {
                    await new Promise((resolve, reject) => {
                        db.run(
                            "INSERT INTO attendance (studentId, date, status) VALUES (?, ?, ?)",
                            [item.studentId, item.date, item.status],
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
                message: "Attendance imported successfully",
                totalRecords: records.length,
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
==============================
GET ATTENDANCE
==============================
*/

router.get("/attendance", (req, res) => {

    db.all(

        `SELECT
        attendance.id,
        students.name,
        attendance.date,
        attendance.status
        FROM attendance
        INNER JOIN students
        ON attendance.studentId = students.id`,

        [],

        (err, rows) => {

            if(err){

                return res.status(500).json({

                    success:false,

                    message:err.message

                });

            }

            res.json(rows);

        }

    );

});

/*
==============================
ADD ATTENDANCE
==============================
*/

router.post("/attendance",(req,res)=>{

    const{

        studentId,
        date,
        status

    }=req.body;

    db.run(

        `INSERT INTO attendance
        (studentId,date,status)
        VALUES(?,?,?)`,

        [

            studentId,
            date,
            status

        ],

        function(err){

            if(err){

                return res.status(500).json({

                    success:false,

                    message:err.message

                });

            }

            res.json({

                success:true,

                message:"Attendance Saved"

            });

        }

    );

});

module.exports=router;