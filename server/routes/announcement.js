const express = require("express");

const router = express.Router();

const db = require("../database/database");

/*
==================================
GET ALL ANNOUNCEMENTS
==================================
*/

router.get("/announcements", (req, res) => {

    db.all(

        `SELECT *
         FROM announcements
         ORDER BY id DESC`,

        [],

        (err, rows) => {

            if (err) {

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
==================================
ADD ANNOUNCEMENT
==================================
*/

router.post("/announcements", (req, res) => {

    const {

        title,

        message

    } = req.body;

    db.run(

        `INSERT INTO announcements
        (title,message,createdAt)
        VALUES(?,?,datetime('now'))`,

        [

            title,

            message

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

                message:"Announcement Posted"

            });

        }

    );

});

/*
==================================
DELETE ANNOUNCEMENT
==================================
*/

router.delete("/announcements/:id",(req,res)=>{

    db.run(

        "DELETE FROM announcements WHERE id=?",

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

module.exports=router;