const express=require('express')
const bodyParser = require('body-parser');
const { ReturnDocument } = require('mongodb');
const teacherApp = express.Router()
teacherApp.use(bodyParser.json());

let teachersCollection;
let sectionsCollection;
let studentsCollection;
teacherApp.use((req,res,next)=>{
    teachersCollection=req.app.get('teachersCollection');
    sectionsCollection=req.app.get('sectionsCollection');
    studentsCollection=req.app.get('studentsCollection');
    next();
});

teacherApp.post('/login',async(req,res)=>{
    let obj=req.body;
    let teacher=await teachersCollection.findOne({username:obj.username})
    if(teacher === null)
    {
        res.send({message:"Invalid Username"})
    }
    else
    {
        if(obj.password !== teacher.password)
        {
            res.send({message:"Invalid Password"})
        }
        else
        {
            res.send("Login Successfull")
        }
    }
})

teacherApp.get('/get-students', async (req, res) => {
    const className = req.query.name;

    // Find the section based on the class name
    const section = await sectionsCollection.findOne({ name: className });
    if (!section) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Get the roll numbers from the section
    const rollNumbers = section.students; // Assuming `students` is an array of roll numbers

    // Find students with matching roll numbers
    const students = await studentsCollection.find({ rollno: { $in: rollNumbers } }).toArray();
    // Send the list of students as a response
    res.json(students);
  });

teacherApp.put('/update-class',async(req,res)=>{
    let obj=req.body;
    let section = await sectionsCollection.find({name:obj.name}).toArray();
    let periodCount=section[0].period_count;
    await studentsCollection.updateMany({ rollno: { $in: obj.students } }, { $set: { [`attendance.${periodCount}`]: 1},$inc: { classes_present: 1 } });
    await sectionsCollection.findOneAndUpdate({name:section[0].name},{$set:{period_count:periodCount+1,[`concepts.${periodCount}`]:obj.concept,total_classes:section[0].total_classes+1 }})
    let students = await studentsCollection.find({ rollno:{$in:obj.students} }).toArray();
    res.send({message:"Student List",payload:students,periodCount:periodCount+1}) 
})

module.exports=teacherApp;
