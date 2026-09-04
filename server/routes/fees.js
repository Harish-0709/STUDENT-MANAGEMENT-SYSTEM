const express = require("express");
const router = express.Router();
const db = require("../database/database");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

/*
========================================
IMPORT FEES FROM CSV
========================================
*/
router.post("/fees/import", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload a CSV file" });
    }

    const records = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            const { studentId, semester, totalFee, paidAmount } = row;
            if (studentId && semester && totalFee) {
                const total = Number(totalFee);
                const paid = Number(paidAmount || 0);
                const balance = total - paid;
                const status = balance === 0 ? "Paid" : "Pending";
                records.push({
                    studentId: studentId.trim(),
                    semester: semester.trim(),
                    totalFee: total,
                    paidAmount: paid,
                    balance,
                    status
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
                            "INSERT INTO fees (studentId, semester, totalFee, paidAmount, balance, status) VALUES (?, ?, ?, ?, ?, ?)",
                            [item.studentId, item.semester, item.totalFee, item.paidAmount, item.balance, item.status],
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
                message: "Fees imported successfully",
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
==================================
GET ALL FEES
==================================
*/

router.get("/fees", (req, res) => {

    db.all(

        `SELECT
            fees.*,
            students.name
        FROM fees
        JOIN students
        ON fees.studentId = students.id
        ORDER BY fees.id DESC`,

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
ADD FEES
==================================
*/

router.post("/fees", (req, res) => {

    const {

        studentId,
        semester,
        totalFee,
        paidAmount

    } = req.body;

    const balance = totalFee - paidAmount;

    const status = balance === 0 ? "Paid" : "Pending";

    db.run(

        `INSERT INTO fees
        (studentId,semester,totalFee,paidAmount,balance,status)
        VALUES(?,?,?,?,?,?)`,

        [

            studentId,
            semester,
            totalFee,
            paidAmount,
            balance,
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

                message:"Fee Added Successfully"

            });

        }

    );

});

module.exports = router;