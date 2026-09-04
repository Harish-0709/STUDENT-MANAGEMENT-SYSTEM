const express = require("express");
const router = express.Router();
const db = require("../database/database");


/*
====================================
GENERATE SEATING ALLOCATION
====================================
*/

router.post("/allocate/:examId", (req, res) => {

    const { examId } = req.params;

    // STEP 1: Get exam
    db.get(
        "SELECT * FROM exams WHERE id = ?",
        [examId],
        (examError, exam) => {

            if (examError) {
                return res.status(500).json({
                    success: false,
                    message: examError.message
                });
            }

            if (!exam) {
                return res.status(404).json({
                    success: false,
                    message: "Exam not found"
                });
            }


            // STEP 2: Get students
            db.all(
                `
                SELECT students.*
                FROM students
                INNER JOIN exam_participants
                ON students.department = exam_participants.department
                AND students.year = exam_participants.year
                WHERE exam_participants.examId = ?
                ORDER BY students.department, students.year, students.studentId
                `,
                [
    examId
],
                (studentError, students) => {

                    if (studentError) {
                        return res.status(500).json({
                            success: false,
                            message: studentError.message
                        });
                    }

                    if (students.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "No students found for this exam"
                        });
                    }


                    // STEP 3: Get rooms
                    db.all(
                        `
                        SELECT *
                        FROM rooms
                        ORDER BY roomNo ASC
                        `,
                        [],
                        (roomError, rooms) => {

                            if (roomError) {
                                return res.status(500).json({
                                    success: false,
                                    message: roomError.message
                                });
                            }

                            if (rooms.length === 0) {
                                return res.status(400).json({
                                    success: false,
                                    message:
                                        "No rooms available"
                                });
                            }


                            // STEP 4: Generate every available seat
                            const seats = [];

                            rooms.forEach((room) => {

                                const capacity =
                                    Number(room.capacity);

                                const totalRows =
                                    Number(room.rows);

                                const totalColumns =
                                    Number(room.columns);

                                let seatCount = 0;

                                for (
                                    let row = 1;
                                    row <= totalRows;
                                    row++
                                ) {

                                    for (
                                        let column = 1;
                                        column <= totalColumns;
                                        column++
                                    ) {

                                        if (
                                            seatCount >=
                                            capacity
                                        ) {
                                            break;
                                        }

                                        seats.push({
                                            roomNo: room.roomNo,
                                            rowNo: row,
                                            columnNo: column
                                        });

                                        seatCount++;
                                    }
                                }

                            });


                            // STEP 5: Check capacity
                            if (
                                seats.length <
                                students.length
                            ) {

                                return res.status(400).json({

                                    success: false,

                                    message:
                                        `Not enough seats. ` +
                                        `${students.length} students ` +
                                        `but only ` +
                                        `${seats.length} seats available.`

                                });

                            }


                            // STEP 6: Delete previous allocation
                            db.run(
                                `
                                DELETE FROM allocations
                                WHERE examId = ?
                                `,
                                [examId],
                                (deleteError) => {

                                    if (deleteError) {
                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                deleteError.message
                                        });
                                    }


                                    // STEP 7: Prepare allocation list
                                    const allocationList =
                                        students.map(
                                            (student, index) => {

                                                return {
                                                    examId: examId,
                                                    studentId:
                                                        student.id,
                                                    roomNo:
                                                        seats[index].roomNo,
                                                    rowNo:
                                                        seats[index].rowNo,
                                                    columnNo:
                                                        seats[index].columnNo
                                                };

                                            }
                                        );


                                    // STEP 8: Insert allocations
                                    db.serialize(() => {

                                        db.run(
                                            "BEGIN TRANSACTION"
                                        );


                                        const statement =
                                            db.prepare(
                                                `
                                                INSERT INTO allocations
                                                (
                                                    examId,
                                                    studentId,
                                                    roomNo,
                                                    rowNo,
                                                    columnNo
                                                )
                                                VALUES (?, ?, ?, ?, ?)
                                                `
                                            );


                                        let insertError = null;


                                        allocationList.forEach(
                                            (allocation) => {

                                                if (insertError) {
                                                    return;
                                                }

                                                statement.run(
                                                    [
                                                        allocation.examId,
                                                        allocation.studentId,
                                                        allocation.roomNo,
                                                        allocation.rowNo,
                                                        allocation.columnNo
                                                    ],
                                                    (err) => {

                                                        if (err) {
                                                            insertError =
                                                                err;
                                                        }

                                                    }
                                                );

                                            }
                                        );


                                        statement.finalize(
                                            (finalizeError) => {

                                                if (
                                                    insertError ||
                                                    finalizeError
                                                ) {

                                                    db.run(
                                                        "ROLLBACK"
                                                    );

                                                    return res.status(
                                                        500
                                                    ).json({

                                                        success: false,

                                                        message:
                                                            (
                                                                insertError ||
                                                                finalizeError
                                                            ).message

                                                    });

                                                }


                                                db.run(
                                                    "COMMIT",
                                                    (commitError) => {

                                                        if (
                                                            commitError
                                                        ) {

                                                            return res
                                                                .status(
                                                                    500
                                                                )
                                                                .json({

                                                                    success:
                                                                        false,

                                                                    message:
                                                                        commitError.message

                                                                });

                                                        }


                                                        res.json({

                                                            success:
                                                                true,

                                                            message:
                                                                "Seating allocation generated successfully",

                                                            totalStudents:
                                                                students.length,

                                                            totalSeats:
                                                                seats.length,

                                                            roomsUsed:
                                                                new Set(
                                                                    allocationList.map(
                                                                        item =>
                                                                            item.roomNo
                                                                    )
                                                                ).size

                                                        });

                                                    }
                                                );

                                            }
                                        );

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});


/*
====================================
GET ALLOCATION
====================================
*/

router.get(
    "/allocations/:examId",
    (req, res) => {

        const { examId } = req.params;

        db.all(
            `
            SELECT
                allocations.id,
                allocations.examId,
                allocations.studentId,
                allocations.roomNo,
                allocations.rowNo,
                allocations.columnNo,

                students.studentId AS rollNumber,
                students.name,
                students.department,
                students.year

            FROM allocations

            JOIN students
            ON allocations.studentId = students.id

            WHERE allocations.examId = ?

            ORDER BY
                allocations.roomNo,
                allocations.rowNo,
                allocations.columnNo
            `,
            [examId],
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