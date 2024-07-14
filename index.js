const { Student } = require('./models/studentModel');
const express = require('express');
const { connectToDatabase } = require('./utils/dbUtils');
const userRoutes = require('./routes/userRoutes');
const logRoutes = require('./routes/logRoutes');
const studentRoutes = require('./routes/studentRoutes');
const classroute = require('./routes/classRoutes');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => res.send("Express on Vercel"));
// Use routes
app.use('/user', userRoutes);
app.use('/log', logRoutes);
app.use('/student', studentRoutes);
app.use('/class', classroute);

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Call the function to connect to the database after the server starts
    connectToDatabase();
});
