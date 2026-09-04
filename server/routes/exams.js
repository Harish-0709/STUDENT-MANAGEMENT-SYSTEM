const express = require("express");

const router = express.Router();

const db = require("../database/database");


/*
====================================
GET ALL EXAMS
====================================
*/

router.get("/exams", (req, res) => {

    db.all(
        `
        SELECT *
        FROM exams
        ORDER BY examDate ASC
        `,
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
====================================
ADD EXAM
====================================
*/

router.post("/exams", (req, res) => {

    const {
        subject,
        department,
        year,
        examDate,
        examTime,
        hall,
        participants
    } = req.body;


    /*
    ====================================
    VALIDATION
    ====================================
    */

    if (
        !subject ||
        !examDate ||
        !examTime ||
        !hall
    ) {

        return res.status(400).json({
            success: false,
            message: "Subject, date, time and hall are required"
        });

    }


    if (
        !participants ||
        !Array.isArray(participants) ||
        participants.length === 0
    ) {

        return res.status(400).json({
            success: false,
            message: "At least one participant is required"
        });

    }


    /*
    ====================================
    CREATE EXAM
    ====================================
    */

    db.run(
        `
        INSERT INTO exams
        (
            subject,
            department,
            year,
            examDate,
            examTime,
            hall
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            subject,

            // Keep first participant in
            // existing exams table for
            // compatibility.
            participants[0].department,

            participants[0].year,

            examDate,
            examTime,
            hall
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }


            const examId = this.lastID;


            /*
            ====================================
            INSERT ALL PARTICIPANTS
            ====================================
            */

            const stmt = db.prepare(
                `
                INSERT INTO exam_participants
                (
                    examId,
                    department,
                    year
                )
                VALUES (?, ?, ?)
                `
            );


            let insertError = null;


            participants.forEach((participant) => {

                stmt.run(
                    [
                        examId,
                        participant.department,
                        participant.year
                    ],
                    (err) => {

                        if (err) {
                            insertError = err;
                        }

                    }
                );

            });


            stmt.finalize((err) => {

                if (err || insertError) {

                    return res.status(500).json({
                        success: false,
                        message:
                            (err || insertError).message
                    });

                }


                res.json({

                    success: true,

                    message:
                        "Exam Created Successfully",

                    examId: examId

                });

            });

        }
    );

});


/*
====================================
GET EXAM PARTICIPANTS
====================================
*/

router.get(
    "/exams/:id/participants",
    (req, res) => {

        db.all(
            `
            SELECT *
            FROM exam_participants
            WHERE examId = ?
            ORDER BY department, year
            `,
            [req.params.id],
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

    }
);


module.exports = router;