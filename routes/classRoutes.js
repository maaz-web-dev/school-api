const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { Student, Class, Subject } = require('../models/studentModel');
const Log = require('../models/logModel');
const { authenticateToken } = require('../middleware/authMiddleware')
const { authorizeRoles } = require('../middleware/studentMiddleware');

router.post('/addClass', authenticateToken, async (req, res) => {
    try {
        const newClass = await Class.create(req.body);
        res.status(201).json(newClass);
    } catch (error) {
        // Handle validation errors (e.g., required fields missing)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        // Handle duplicate key error (e.g., unique constraint violation)
        else if (error.code && error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate value error', field: Object.keys(error.keyValue) });
        }
        // Handle other errors, including potential database connection issues
        else {
            console.error('Error adding class:', error); // Log the error for server-side debugging
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
});
// Route to create a new subject
router.post('/addSubject', authenticateToken, async (req, res) => {
    try {
        const newSubject = await Subject.create(req.body);
        res.status(201).json(newSubject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// DELETE endpoint to remove a class by its ID
router.delete('/:id', authenticateToken, async (req, res) => {
    const classId = req.params.id; // Extract the class ID from the request parameters

    try {
        // Use the Mongoose model to find and delete the class by ID
        const deletedClass = await Class.findByIdAndDelete(classId);

        // If no class found, return a 404 not found response
        if (!deletedClass) {
            return res.status(404).json({ message: "Class not found." });
        }

        // If the class was successfully deleted, return a success response
        res.json({ message: "Class successfully deleted.", class: deletedClass });
    } catch (error) {
        // Log the error for backend debugging
        console.error("Error deleting class:", error);

        // Send a 500 status code and error message to the frontend
        res.status(500).json({ message: "Failed to delete class. Please try again later." });
    }
});

// getting all classes
router.get('/getAllClasses', async (req, res) => {
    try {
        const allClasses = await Class.find();
        res.status(200).json(allClasses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;