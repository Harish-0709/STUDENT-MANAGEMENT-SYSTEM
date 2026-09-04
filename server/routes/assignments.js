const express = require("express");

const router = express.Router();

const db = require("../database/database");

/*
====================================
GET ALL ASSIGNMENTS
====================================
*/

router.get("/assignments",(req,res)=>{

    db.all(

        "SELECT * FROM assignments ORDER BY id DESC",

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
====================================
ADD ASSIGNMENT
====================================
*/

router.post("/assignments",(req,res)=>{

    const{

        title,

        subject,

        department,

        year,

        dueDate,

        description

    }=req.body;

    db.run(

`INSERT INTO assignments

(title,subject,department,year,dueDate,description)

VALUES(?,?,?,?,?,?)`,

[

title,

subject,

department,

year,

dueDate,

description

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

message:"Assignment Added Successfully"

});

}

);

});

module.exports=router;