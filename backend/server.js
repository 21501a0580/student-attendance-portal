const express=require('express')
const app=express()
const path = require('path');
const mongoClient=require('mongodb').MongoClient;
const student=require('./APIs/student');
const teacher=require('./APIs/teacher')
const cors=require('cors')
const dbUrl='mongodb+srv://21501a0580:bharath+8510@cluster0.sxwaaj9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const cron = require('node-cron');

app.use(express.static(path.join(__dirname,'../frontend/build')))
app.use(cors());
mongoClient.connect(dbUrl).then(client=>{
    const dbObj=client.db('institute').then(console.log("Connected to DataBase.");
    const studentsCollection=dbObj.collection("students");
    const teachersCollection=dbObj.collection("teachers");
    const sectionsCollection=dbObj.collection("sections")
    app.set('studentsCollection',studentsCollection);
    app.set('teachersCollection',teachersCollection);
    app.set('sectionsCollection',sectionsCollection);
})

app.use('/student',student);
app.use('/teacher',teacher);

app.use((err,req,res,next)=>{
    res.send({message:"Error occured",payload:err});
})

cron.schedule('30 8 * * *', async () => {
    // Code to set attendance array of each student to 0s
    try {
      const studentsCollection = app.get('studentsCollection');
      await studentsCollection.updateMany({}, { $set: { attendance: [0, 0, 0, 0, 0, 0] } });
      await sectionsCollection.updateMany({}, { $set: { concepts:["p1","p2","p3","p4","p5","p6"],period_count:0 } });
    } catch (error) {
      console.error('Error resetting attendance:', error);
    }
  }, {
    timezone: 'Asia/Kolkata' // Adjust timezone as per your requirement
  });
  
const port=4000;
app.listen(port,console.log(`http://localhost:${port}`))
