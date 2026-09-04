const express = require("express");

const router = express.Router();

const db = require("../database/database");


/*
====================================
GET ALL ROOMS
====================================
*/

router.get("/rooms", (req, res) => {

    db.all(
        "SELECT * FROM rooms ORDER BY roomNo ASC",
        [],
        (err, rows) => {

            if (err) {

                console.error(
                    "GET ROOMS ERROR:",
                    err.message
                );

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
ADD ROOM
====================================
*/

router.post("/rooms", (req, res) => {

    const {
        roomNo,
        capacity,
        rows,
        columns
    } = req.body;


    if (
        !roomNo ||
        !capacity ||
        !rows ||
        !columns
    ) {

        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });

    }


    if (
        Number(capacity) <= 0 ||
        Number(rows) <= 0 ||
        Number(columns) <= 0
    ) {

        return res.status(400).json({
            success: false,
            message: "Room values must be greater than zero"
        });

    }


    if (
        Number(rows) * Number(columns)
        < Number(capacity)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Rows × Columns must be at least the room capacity"
        });

    }


    db.run(
        `
        INSERT INTO rooms
        (
            roomNo,
            capacity,
            rows,
            columns
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            roomNo.trim(),
            Number(capacity),
            Number(rows),
            Number(columns)
        ],
        function (err) {

            if (err) {

                console.error(
                    "ADD ROOM SQLITE ERROR:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }


            console.log(
                "ROOM INSERTED:",
                this.lastID
            );


            res.status(201).json({

                success: true,

                message:
                    "Room Added Successfully",

                roomId:
                    this.lastID

            });

        }
    );

});


/*
====================================
UPDATE ROOM
====================================
*/

router.put("/rooms/:id", (req, res) => {

    const {
        roomNo,
        capacity,
        rows,
        columns
    } = req.body;

    const { id } = req.params;


    if (
        !roomNo ||
        !capacity ||
        !rows ||
        !columns
    ) {

        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });

    }


    if (
        Number(rows) * Number(columns)
        < Number(capacity)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Rows × Columns must be at least the room capacity"
        });

    }


    db.run(
        `
        UPDATE rooms
        SET
            roomNo = ?,
            capacity = ?,
            rows = ?,
            columns = ?
        WHERE id = ?
        `,
        [
            roomNo.trim(),
            Number(capacity),
            Number(rows),
            Number(columns),
            id
        ],
        function (err) {

            if (err) {

                console.error(
                    "UPDATE ROOM ERROR:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }


            if (this.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Room not found"
                });

            }


            res.json({
                success: true,
                message: "Room Updated Successfully"
            });

        }
    );

});


/*
====================================
DELETE ROOM
====================================
*/

router.delete("/rooms/:id", (req, res) => {

    const { id } = req.params;


    db.run(
        "DELETE FROM rooms WHERE id = ?",
        [id],
        function (err) {

            if (err) {

                console.error(
                    "DELETE ROOM ERROR:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }


            if (this.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Room not found"
                });

            }


            res.json({
                success: true,
                message: "Room Deleted Successfully"
            });

        }
    );

});


module.exports = router;