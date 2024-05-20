const express = require('express');
const app = express();
const path = require('path');
const { MongoClient } = require('mongodb');
const student = require('./APIs/student');
const teacher = require('./APIs/teacher');
const cors = require('cors');
const cron = require('node-cron');

const dbUrl = 'mongodb+srv://21501a0580:bharath+8510@cluster0.sxwaaj9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use(cors());

MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    const dbObj = client.db('institute');
    console.log("Connected to DataBase.");

    const studentsCollection = dbObj.collection("students");
    const teachersCollection = dbObj.collection("teachers");
    const sectionsCollection = dbObj.collection("sections");

    app.set('studentsCollection', studentsCollection);
    app.set('teachersCollection', teachersCollection);
    app.set('sectionsCollection', sectionsCollection);

    app.use('/student', student);
    app.use('/teacher', teacher);

    app.use((err, req, res, next) => {
      res.send({ message: "Error occurred", payload: err });
    });

    cron.schedule('30 8 * * *', async () => {
      // Code to set attendance array of each student to 0s
      try {
        const studentsCollection = app.get('studentsCollection');
        const sectionsCollection = app.get('sectionsCollection');
        await studentsCollection.updateMany({}, { $set: { attendance: [0, 0, 0, 0, 0, 0] } });
        await sectionsCollection.updateMany({}, { $set: { concepts: ["p1", "p2", "p3", "p4", "p5", "p6"], period_count: 0 } });
      } catch (error) {
        console.error('Error resetting attendance:', error);
      }
    }, {
      timezone: 'Asia/Kolkata' // Adjust timezone as per your requirement
    });

    const port = 4000;
    app.listen(port, () => console.log(`http://localhost:${port}`));
  })
  .catch(err => {
    console.error("Failed to connect to the database:", err);
  });
