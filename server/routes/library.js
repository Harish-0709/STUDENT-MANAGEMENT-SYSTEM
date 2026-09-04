const express = require("express");
const router = express.Router();
const db = require("../database/database");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

/*
========================================
IMPORT BOOKS FROM CSV
========================================
*/
router.post("/books/import", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Please upload a CSV file" });
    }

    const books = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            const { bookName, author, isbn, quantity } = row;
            if (bookName && author && isbn) {
                books.push({
                    bookName: bookName.trim(),
                    author: author.trim(),
                    isbn: isbn.trim(),
                    quantity: Number(quantity || 1)
                });
            }
        })
        .on("end", async () => {
            if (books.length === 0) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, message: "No valid records found in CSV" });
            }

            let inserted = 0;
            let failed = 0;

            for (const item of books) {
                try {
                    await new Promise((resolve, reject) => {
                        db.run(
                            "INSERT INTO books (bookName, author, isbn, quantity) VALUES (?, ?, ?, ?)",
                            [item.bookName, item.author, item.isbn, item.quantity],
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
                message: "Books imported successfully",
                totalRecords: books.length,
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
====================================
GET ALL BOOKS
====================================
*/

router.get("/books", (req, res) => {

    db.all(
        "SELECT * FROM books ORDER BY id DESC",
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
ADD BOOK
====================================
*/

router.post("/books", (req, res) => {

    const {
        bookName,
        author,
        isbn,
        quantity
    } = req.body;

    if (!bookName || !author || !isbn || !quantity) {

        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });

    }

    db.run(

        `INSERT INTO books
        (bookName, author, isbn, quantity)
        VALUES (?, ?, ?, ?)`,

        [
            bookName,
            author,
            isbn,
            quantity
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
                message: "Book Added Successfully"
            });

        }

    );

});

module.exports = router;