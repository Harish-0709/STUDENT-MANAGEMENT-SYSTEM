const express = require("express");

const router = express.Router();

const db = require("../database/database");

/*
==================================
GET LEAVE REQUESTS
==================================
*/

router.get("/leave", (req, res) => {

    db.all(

        `SELECT
        leaves.id,
        students.name,
        leaves.fromDate,
        leaves.toDate,
        leaves.reason,
        leaves.status

        FROM leaves

        INNER JOIN students

        ON leaves.studentId = students.id`,

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
ADD LEAVE
==================================
*/

router.post("/leave", (req, res) => {

    const {

        studentId,
        fromDate,
        toDate,
        reason

    } = req.body;

    db.run(

        `INSERT INTO leaves
        (studentId,fromDate,toDate,reason)
        VALUES(?,?,?,?)`,

        [

            studentId,
            fromDate,
            toDate,
            reason

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

                message:"Leave Request Submitted"

            });

        }

    );

});

/*
==================================
APPROVE LEAVE
==================================
*/

router.put("/leave/:id", (req, res) => {

    db.run(

        `UPDATE leaves
        SET status='Approved'
        WHERE id=?`,

        [

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

                success:true

            });

        }

    );

});

/*
==================================
REJECT LEAVE
==================================
*/

router.put("/leave/reject/:id", (req, res) => {

    db.run(

        `UPDATE leaves
        SET status='Rejected'
        WHERE id=?`,

        [

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

                success:true

            });

        }

    );

});

module.exports = router;