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
// Use routes
app.use('/user', userRoutes);
app.use('/log', logRoutes);
app.use('/student', studentRoutes);
app.use('/class', classroute);
// async function updateFees() {
//     console.log('All student fees have been updated.1');
//     const students = await Student.find().populate('classInfo');

//     students.forEach(async (student) => {
//         console.log('All student fees have been updated.inloop');
//         const newFees = student.classInfo.fees;
//         const currentFees = student.currentFees || 0;
//         const newCharge = {
//             date: new Date(),
//             amount: newFees,
//             description: 'Monthly class fee',
//             type: 'tuitionFees',
//             createdBy: 'system',
//             createdAt: new Date()
//         };
//         if (!student.tuitionFees) {
//             student.tuitionFees = { totalDue: 0, totalPaid: 0, transactions: [newCharge] };
//         } else {
//             student.tuitionFees.transactions.push(newCharge);
//             // Optionally, directly update totalDue to include the new charge
//             // This step is necessary only if you keep a running totalDue separate from transaction calculations
//             // student.tuitionFees.totalDue = currentDue + monthlyFee;
//         }
//         // If there are existing currentFees, add them to the due
//         if (currentFees > 0) {
//             if (!student?.tuitionFees?.totalDue) {
//                 student.tuitionFees.totalDue = 0; // Initialize if it doesn't exist
//             }
//             student.tuitionFees.totalDue += currentFees; // Add currentFees to due
//         }

//         // Update currentFees to the new fees from classInfo
//         student.currentFees = newFees;

//         await student.save();
//     });

//     console.log('All student fees have been updated.');
// }

// Schedule the updateFees function to run 2 minutes from now
// setTimeout(updateFees, 1 * 60 * 1000);

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
