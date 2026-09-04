const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../database/database");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ================================
// LOGIN (AUTHENTICATE FROM USERS TABLE)
// ================================
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and Password are required"
        });
    }

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username.trim()],
        async (err, user) => {
            if (err) {
                console.error("LOGIN DATABASE ERROR:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Username or Password"
                });
            }

            try {
                const match = await bcrypt.compare(password, user.password);

                if (!match) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid Username or Password"
                    });
                }

                const token = jwt.sign(
                    {
                        id: user.id,
                        username: user.username,
                        role: user.role || "Student"
                    },
                    process.env.JWT_SECRET || "default_jwt_secret_key_12345",
                    {
                        expiresIn: "7d"
                    }
                );

                res.json({
                    success: true,
                    message: "Login Successful",
                    token,
                    username: user.username,
                    role: user.role || "Student",
                    userId: user.id
                });
            } catch (error) {
                console.error("LOGIN ERROR:", error.message);
                return res.status(500).json({
                    success: false,
                    message: "Login Error"
                });
            }
        }
    );
});

// ================================
// CHANGE PASSWORD
// ================================
router.put("/change-password", authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Current and new password are required"
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "New password must contain at least 6 characters"
        });
    }

    db.get(
        "SELECT * FROM users WHERE id = ?",
        [req.user.id],
        async (err, user) => {
            if (err) {
                console.error("PASSWORD DATABASE ERROR:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            try {
                const passwordMatch = await bcrypt.compare(
                    currentPassword,
                    user.password
                );

                if (!passwordMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Current password is incorrect"
                    });
                }

                const hashedPassword = await bcrypt.hash(newPassword, 10);

                db.run(
                    "UPDATE users SET password = ? WHERE id = ?",
                    [hashedPassword, req.user.id],
                    function (updateError) {
                        if (updateError) {
                            console.error(
                                "PASSWORD UPDATE ERROR:",
                                updateError.message
                            );
                            return res.status(500).json({
                                success: false,
                                message: "Unable to change password"
                            });
                        }

                        res.json({
                            success: true,
                            message: "Password changed successfully"
                        });
                    }
                );
            } catch (error) {
                console.error("PASSWORD ERROR:", error.message);
                return res.status(500).json({
                    success: false,
                    message: "Password processing error"
                });
            }
        }
    );
});

module.exports = router;