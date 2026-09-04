const express = require("express");

const router = express.Router();

const db = require("../database/database");

/*
==========================
GET TIMETABLE
==========================
*/

router.get("/timetable",(req,res)=>{

    db.all(

        "SELECT * FROM timetable",

        [],

        (err,rows)=>{

            if(err){

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
==========================
ADD TIMETABLE
==========================
*/

router.post("/timetable",(req,res)=>{

    const{

        department,

        year,

        day,

        period1,

        period2,

        period3,

        period4,

        period5,

        period6

    }=req.body;

    db.run(

`INSERT INTO timetable

(department,year,day,period1,period2,period3,period4,period5,period6)

VALUES(?,?,?,?,?,?,?,?,?)`,

[

department,

year,

day,

period1,

period2,

period3,

period4,

period5,

period6

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

message:"Timetable Saved"

});

}

);

});

module.exports=router;