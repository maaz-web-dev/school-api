const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { Student, Class, Subject } = require('../models/studentModel');
const Log = require('../models/logModel');
const { authenticateToken } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/studentMiddleware');
// router.post('/addClass', authenticateToken, async (req, res) => {
//     try {
//         const newClass = await Class.create(req.body);
//         res.status(201).json(newClass);
//     } catch (error) {
//         // Handle validation errors (e.g., required fields missing)
//         if (error.name === 'ValidationError') {
//             return res.status(400).json({ message: 'Validation error', errors: error.errors });
//         }
//         // Handle duplicate key error (e.g., unique constraint violation)
//         else if (error.code && error.code === 11000) {
//             return res.status(400).json({ message: 'Duplicate value error', field: Object.keys(error.keyValue) });
//         }
//         // Handle other errors, including potential database connection issues
//         else {
//             console.error('Error adding class:', error); // Log the error for server-side debugging
//             return res.status(500).json({ message: 'Internal server error' });
//         }
//     }
// });

// getting all classes
// router.get('/getAllClasses', authenticateToken, async (req, res) => {
//     try {
//         const allClasses = await Class.find(); // Assuming you're using Mongoose or a similar ODM
//         res.status(200).json(allClasses);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });
// Route to create a new subject
router.post('/addSubject', authenticateToken, async (req, res) => {
    try {
        const newSubject = await Subject.create(req.body);
        res.status(201).json(newSubject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Assuming Student and Log models are imported

// POST endpoint to add a new student, incorporating RBAC, better error handling, and logging
router.post('/addStudent', authenticateToken, authorizeRoles('add_student'), async (req, res) => {
    try {
        const newStudent = await Student.create(req.body);
        await Log.create({
            actionType: 'Create',
            entityType: 'Student',
            entityId: newStudent._id.toString(),
            description: `New student added: ${newStudent.name}`,
            changes: JSON.stringify(req.body), // Consider filtering sensitive information
            username: req.user.username,
        });

        res.status(201).json(newStudent);
    } catch (error) {
        console.error('Failed to add student:', error); // Replace with a proper logging mechanism
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error: Check your data.' });
        }

        // Log the error asynchronously without waiting for it to finish
        Log.create({
            actionType: 'Error',
            entityType: 'Student',
            description: `Failed to add student: ${error.message}`,
            changes: JSON.stringify(req.body),
            username: req.user ? req.user.username : 'Unknown',
        }).catch(logError => console.error('Logging error failed:', logError)); // Log any errors that occur during logging

        res.status(500).json({ message: 'An error occurred while adding the student.' });
    }
});
// router.get('/', authenticateToken, async (req, res) => {
//     try {
//         const students = await Student.find()
//             .populate('classInfo')  // Populate classInfo to get detailed info instead of just ObjectId
//             .exec(); // Execute the query
//         res.json(students);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

router.get('/', authenticateToken, async (req, res) => {
    try {
        const students = await Student.find()
            .populate('classInfo') // Populate classInfo to get detailed info instead of just ObjectId
            .exec(); // Execute the query
        res.json(students);
    } catch (error) {
        // Log the error to the console for backend debugging
        console.error("Error fetching students:", error);

        // Send a 500 status code and a detailed error message to the frontend
        res.status(500).json({ message: "Failed to fetch students. Please try again later." });
    }
});

// DELETE endpoint to remove a student by their ID
router.delete('/:id', authenticateToken, async (req, res) => {
    const studentId = req.params.id; // Extract the student ID from the request parameters

    try {
        // Use the Mongoose model to find and delete the student by ID
        const deletedStudent = await Student.findByIdAndDelete(studentId);

        // If no student found, return a 404 not found response
        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found." });
        }

        // If the student was successfully deleted, return a success response
        res.json({ message: "Student successfully deleted.", student: deletedStudent });
    } catch (error) {
        // Log the error for backend debugging
        console.error("Error deleting student:", error);

        // Send a 500 status code and error message to the frontend
        res.status(500).json({ message: "Failed to delete student. Please try again later." });
    }
});

// Update student API endpoint
router.put('/:id', authenticateToken, authorizeRoles('edit_student'), async (req, res) => {
    const { id } = req.params;
    try {
        const updatedStudent = await Student.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedStudent) {
            return res.status(404).send('Student not found');
        }
        res.json(updatedStudent);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// // Modified Endpoint to add a transaction to a student
// router.post('/:studentId/transactions', async (req, res) => {
//     const { studentId } = req.params;
//     const { date, amount, description, type, createdBy } = req.body;

//     if (!date || !amount || !type || !createdBy) {
//         return res.status(400).json({ error: 'Missing required transaction fields' });
//     }

//     try {
//         const student = await Student.findById(studentId);

//         if (!student) {
//             return res.status(404).json({ error: 'Student not found' });
//         }

//         const newTransaction = {
//             date,
//             amount,
//             description,
//             type,
//             createdBy,
//             createdAt: new Date()
//         };

//         if (!student.tuitionFees) {
//             student.tuitionFees = { totalDue: 0, totalPaid: 0, transactions: [] };
//         }

//         student.tuitionFees.transactions.push(newTransaction);

//         // Update totalPaid based on transaction type
//         if (['tuitionFees', 'financialAid', 'scholarship'].includes(type)) {
//             student.tuitionFees.totalPaid += amount;
//         } else if (type === 'refund') {
//             student.tuitionFees.totalPaid -= amount;
//         }
//         // student.currentFees = amount;
//         // Optional: Consider updating totalDue based on transaction type
//         student.tuitionFees.totalDue -= amount;
//         await student.save();
//         res.status(201).json({ message: 'Transaction added successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });
router.post('/:studentId/transactions', authenticateToken, authorizeRoles('manage_fees'), async (req, res) => {
    const { studentId } = req.params;
    const { date, amount, description, type, createdBy } = req.body;

    if (!date || !amount || !type || !createdBy) {
        return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    try {
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const newTransaction = {
            date,
            amount,
            description,
            type,
            createdBy,
            createdAt: new Date()
        };
        if (!student.tuitionFees) {
            student.tuitionFees = { totalDue: 0, totalPaid: 0, transactions: [] };
        }

        student.tuitionFees.transactions.push(newTransaction);

        // Adjust logic for handling payments and refunds
        if (['tuitionFees', 'financialAid', 'scholarship'].includes(type)) {
            let paymentAmount = amount;

            // First, apply payment to currentFees
            if (student.currentFees) {
                const remainingFeesAfterPayment = student.currentFees - paymentAmount;
                if (remainingFeesAfterPayment >= 0) {
                    student.currentFees = remainingFeesAfterPayment;
                    paymentAmount = 0; // Payment fully absorbed by current fees
                } else {
                    paymentAmount -= student.currentFees; // Payment exceeds current fees
                    student.currentFees = 0; // Current fees fully paid
                }
            }

            // Apply any remaining payment amount to totalDue
            if (paymentAmount > 0 && student.tuitionFees.totalDue) {
                student.tuitionFees.totalDue = Math.max(student.tuitionFees.totalDue - paymentAmount, 0); // Ensure totalDue doesn't go negative
            }

            student.tuitionFees.totalPaid += amount; // Record the total amount paid
        } else if (type === 'refund') {
            // Logic for refunds (adjust based on your policy)
            student.currentFees += amount; // Example: Refunds are added back to current fees
        }

        await student.save();
        res.status(201).json({ message: 'Transaction added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});



// router.post('/', async (req, res) => {
//     try {
//         const newStudent = new Student(req.body);
//         const savedStudent = await newStudent.save();
//         res.status(201).json(savedStudent);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// router.post('/api/students', async (req, res) => {
//     const { rollNumber, name, fatherName, classInfo } = req.body;

//     // Basic validation
//     if (!rollNumber || !name || !fatherName || !classInfo) {
//         return res.status(400).send('Missing required student information.');
//     }

//     // Check for existing student with the same roll number
//     const existingStudent = await Student.findOne({ rollNumber });
//     if (existingStudent) {
//         return res.status(400).send('A student with this roll number already exists.');
//     }

//     try {
//         const newStudent = new Student(req.body);
//         await newStudent.save();
//         res.status(201).send(newStudent);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

router.post('/api/students/:studentId/results', authenticateToken, async (req, res) => {
    const { subject, subjectName, obtainedMarks } = req.body;

    // Validate obtained marks
    if (obtainedMarks < 0) {
        return res.status(400).send('Obtained marks must be a positive number.');
    }

    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            return res.status(404).send('Student not found.');
        }

        // Optional: Verify the subject belongs to the student's class
        const classInfo = await Class.findById(student.classInfo);
        if (!classInfo.subjects.includes(subject)) {
            return res.status(400).send('Subject does not belong to the student’s class.');
        }

        student.results.push({ subject, subjectName, obtainedMarks });
        await student.save();
        res.status(201).send(student);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// router.post('/api/classes', async (req, res) => {
//     const { name, fees, subjects } = req.body;

//     // Basic validation
//     if (!name || !fees) {
//         return res.status(400).send('Class name and fees are required.');
//     }

//     // Check for existing class
//     const existingClass = await Class.findOne({ name });
//     if (existingClass) {
//         return res.status(400).send('Class already exists.');
//     }

//     try {
//         const newClass = new Class({ name, fees, subjects });
//         await newClass.save();
//         res.status(201).send(newClass);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// Route to get a specific student by rollNumber
router.get('/:rollNumber', authenticateToken, async (req, res) => {
    try {
        const student = await Student.findOne({ rollNumber: req.params.rollNumber }).populate('classInfo')  // Populate classInfo to get detailed info instead of just ObjectId
            .exec();;
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to update a specific student by rollNumber
router.put('/:rollNumber', authenticateToken, async (req, res) => {
    const { rollNumber } = req.params;

    try {
        const existingStudent = await Student.findOne({ rollNumber });

        if (!existingStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update the existing student with the new data
        const updatedStudent = await Student.findOneAndUpdate(
            { rollNumber },
            req.body,
            { new: true }
        );

        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to delete a specific student by rollNumber
router.delete('/:rollNumber', authenticateToken, async (req, res) => {
    try {
        const deletedStudent = await Student.findOneAndDelete({ rollNumber: req.params.rollNumber });
        if (deletedStudent) {
            res.json({ message: 'Student deleted successfully' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/api/assignFees', async (req, res) => {
    try {
        const { className, feesAmount } = req.body;

        if (!className || feesAmount === undefined) {
            return res.status(400).json({ message: "Class name and fees amount must be provided" });
        }
        if (typeof feesAmount !== 'number' || feesAmount < 0) {
            return res.status(400).json({ message: "Fees amount must be a positive number" });
        }

        const classInfo = await Class.findOne({ name: className });
        if (!classInfo) {
            return res.status(404).json({ message: "Class not found" });
        }

        const students = await Student.find({ classInfo: classInfo._id });
        if (students.length === 0) {
            return res.status(404).json({ message: "No students found in this class" });
        }

        const updateFailures = [];

        for (const student of students) {
            try {
                // Initialize tuitionFees if it does not exist
                if (!student.tuitionFees) {
                    student.tuitionFees = {
                        totalDue: 0,
                        totalPaid: 0
                    };
                }
                if (!student.tuitionFees) {
                    student.tuitionFees = {
                        totalDue: 0,
                        totalPaid: 0,
                        transactions: []  // Initialize transactions array
                    };
                }

                if (student.currentFees === 0) {
                    student.currentFees = feesAmount;
                } else {
                    student.tuitionFees.totalDue += student.currentFees;
                    student.currentFees = feesAmount;
                }
                const newTransaction = {
                    date: new Date(),  // You can set the date to the current date or use the provided date from req.body
                    amount: feesAmount,
                    description: `System assigned monthly fees`,
                    type: 'tuitionFees',  // Or any other appropriate type for fees assignment
                    createdBy: 'System',  // Or whoever initiated the fees assignment
                    createdAt: new Date()
                };

                student.tuitionFees.transactions.push(newTransaction);  // Add transaction to transactions array

                await student.save();
            } catch (error) {
                updateFailures.push({
                    studentId: student._id,
                    name: student.name,
                    error: error.message
                });
            }
        }

        if (updateFailures.length > 0) {
            return res.status(500).json({
                message: "Some student fees failed to update",
                failures: updateFailures
            });
        }

        res.json({ message: `Fees successfully assigned to all students in ${className}` });
    } catch (error) {
        res.status(500).json({
            message: "Failed to assign fees",
            error: error.message
        });
    }
});
module.exports = router;
