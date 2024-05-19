const express=require('express')
const studentApp = express.Router()
const bodyParser = require('body-parser');
studentApp.use(bodyParser.json());

let studentsCollection;
let sectionsCollection;
let studentname="";
let student=null;
studentApp.use((req,res,next)=>{
    studentsCollection=req.app.get('studentsCollection');
    sectionsCollection=req.app.get('sectionsCollection');
    next();
});


studentApp.post('/login',async(req,res)=>{
    let obj=req.body;
    student=await studentsCollection.findOne({username:obj.username})
    if(student === null)
    {
        res.send({message:"Invalid Username"})
    }
    else
    {
        if(obj.password !== student.password)
        {
            res.send({message:"Invalid Password"})
        }
        else
        {
            studentname=obj.username;
            res.send("Login Successfull")
        }
    }
})

studentApp.get('/details',async(req,res)=>{
   let student=await studentsCollection.findOne({username:studentname})
    res.send(student)
})

studentApp.get('/sec',async(req,res)=>{
    res.send(await sectionsCollection.findOne({name:student.section}))
})
studentApp.get('/concepts',async(req,res)=>{
    let concepts=await sectionsCollection.findOne({name:req.body.section})
    res.send(concepts.concepts)
})

module.exports=studentApp;