const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../database/database");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/*
========================================
IMPORT USERS FROM CSV
========================================
*/
router.post("/users/import", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload a CSV file" });
    }

    const users = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            const { username, password, role } = row;
            if (username && password && role) {
                users.push({
                    username: username.trim(),
                    password: password.trim(),
                    role: role.trim()
                });
            }
        })
        .on("end", async () => {
            if (users.length === 0) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, message: "No valid user records found in CSV" });
            }

            let inserted = 0;
            let failed = 0;

            for (const user of users) {
                try {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    await new Promise((resolve, reject) => {
                        db.run(
                            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                            [user.username, hashedPassword, user.role],
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
                message: "Users imported successfully",
                totalRecords: users.length,
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
GET ALL USERS
==================================
*/

router.get("/users", (req, res) => {

    db.all(
        "SELECT id, username, role FROM users ORDER BY id ASC",
        [],
        (err, rows) => {

            if (err) {

                console.error("GET USERS ERROR:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Unable to fetch users"
                });

            }

            res.json(rows);

        }
    );

});


/*
==================================
ADD USER
==================================
*/

router.post("/users", async (req, res) => {

    const {
        username,
        password,
        role
    } = req.body;

    if (!username || !password || !role) {

        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });

    }

    if (password.length < 6) {

        return res.status(400).json({
            success: false,
            message: "Password must contain at least 6 characters"
        });

    }

    const allowedRoles = [
        "Admin",
        "Faculty",
        "Student"
    ];

    if (!allowedRoles.includes(role)) {

        return res.status(400).json({
            success: false,
            message: "Invalid role"
        });

    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            `
            INSERT INTO users
            (username, password, role)
            VALUES (?, ?, ?)
            `,
            [
                username.trim(),
                hashedPassword,
                role
            ],
            function (err) {

                if (err) {

                    console.error(
                        "CREATE USER ERROR:",
                        err.message
                    );

                    if (err.message.includes("UNIQUE")) {

                        return res.status(409).json({
                            success: false,
                            message: "Username already exists"
                        });

                    }

                    return res.status(500).json({
                        success: false,
                        message: "Unable to create user"
                    });

                }

                res.status(201).json({
                    success: true,
                    message: "User Created Successfully",
                    userId: this.lastID
                });

            }
        );

    } catch (error) {

        console.error(
            "PASSWORD HASH ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to create user"
        });

    }

});


/*
==================================
DELETE USER
==================================
*/

router.delete("/users/:id", (req, res) => {

    const userId = req.params.id;

    // Prevent deleting the default admin account
    db.get(
        "SELECT username, role FROM users WHERE id=?",
        [userId],
        (err, user) => {

            if (err) {

                console.error(
                    "CHECK USER ERROR:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to delete user"
                });

            }

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });

            }

            if (
                user.username === "admin" &&
                user.role === "Admin"
            ) {

                return res.status(403).json({
                    success: false,
                    message: "Default admin account cannot be deleted"
                });

            }

            db.run(
                "DELETE FROM users WHERE id=?",
                [userId],
                function (deleteErr) {

                    if (deleteErr) {

                        console.error(
                            "DELETE USER ERROR:",
                            deleteErr.message
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Unable to delete user"
                        });

                    }

                    if (this.changes === 0) {

                        return res.status(404).json({
                            success: false,
                            message: "User not found"
                        });

                    }

                    res.json({
                        success: true,
                        message: "User Deleted Successfully"
                    });

                }
            );

        }
    );

});


module.exports = router;