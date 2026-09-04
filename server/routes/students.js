const express = require("express");
const db = require("../database/database");
const upload = require("../middleware/upload");
const router = express.Router();

/*
====================================
GET ALL STUDENTS
====================================
*/

router.get("/students", (req, res) => {

    db.all("SELECT * FROM students ORDER BY id DESC", [], (err, rows) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }

        res.json(rows);

    });

});

/*
====================================
ADD STUDENT WITH PHOTO
====================================
*/

router.post(
    "/students",
    upload.single("photo"),
    (req, res) => {
      console.log("========== NEW REQUEST ==========");
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);
      console.log("BODY KEYS:", Object.keys(req.body));

        const {

            studentId,
            name,
            department,
            year,
            email

        } = req.body;


        const photo = req.file
            ? req.file.filename
            : null;


        if (!studentId || !name || !department || !year || !email) {

            return res.status(400).json({

                success:false,

                message:"All fields are required"

            });

        }


        db.run(

            `INSERT INTO students
            (studentId,name,department,year,email,photo)
            VALUES(?,?,?,?,?,?)`,

            [

                studentId,
                name,
                department,
                year,
                email,
                photo

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

                    message:"Student Added Successfully"

                });

            }

        );

    }
);
/*
====================================
GET SINGLE STUDENT
====================================
*/

router.get("/students/:id", (req, res) => {

    db.get(
        "SELECT * FROM students WHERE id = ?",
        [req.params.id],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json(row);

        }
    );

});


/*
====================================
UPDATE STUDENT
====================================
*/

router.put("/students/:id", (req, res) => {

    const {
        studentId,
        name,
        department,
        year,
        email
    } = req.body;

    db.run(

        `UPDATE students
         SET studentId=?,
             name=?,
             department=?,
             year=?,
             email=?
         WHERE id=?`,

        [
            studentId,
            name,
            department,
            year,
            email,
            req.params.id
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

                message:"Student Updated Successfully"

            });

        }

    );

});
/*
====================================
DELETE STUDENT
====================================
*/

router.delete("/students/:id", (req, res) => {

    db.run(

        "DELETE FROM students WHERE id=?",

        [req.params.id],

        function(err){

            if(err){

                return res.status(500).json({

                    success:false,

                    message:err.message

                });

            }

            res.json({

                success:true,

                message:"Student Deleted Successfully"

            });

        }

    );

});
/*
=========================================
STUDENT PROFILE
=========================================
*/

router.get("/student-profile/:id", (req, res) => {

    const id = req.params.id;

    db.get(

        "SELECT * FROM students WHERE id=?",

        [id],

        (err, student) => {

            if (err) {

                return res.status(500).json(err);

            }

            db.all(

                "SELECT date,status FROM attendance WHERE studentId=?",

                [id],

                (err, attendance) => {

                    if (err) {

                        return res.status(500).json(err);

                    }

                    db.all(

                        "SELECT subject,marks FROM marks WHERE studentId=?",

                        [id],

                        (err, marks) => {

                            if (err) {

                                return res.status(500).json(err);

                            }

                            res.json({

                                student,

                                attendance,

                                marks

                            });

                        }

                    );

                }

            );

        }

    );

});

module.exports = router;