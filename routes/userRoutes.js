const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret';
router.post('/create', async (req, res) => {
    try {
        const { username, password, permissions } = req.body;
        console.log(req.body);
        // Example of custom business logic validation
        // if (password.length < 8) {
        //     return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        // }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            permissions
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            let messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        else if (error.code === 11000) {
            return res.status(400).json({ message: 'Username already exists. Please choose a different username.' });
        } else if (error.name === 'ValidationError') {
            let messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join('. ') });
        } else {
            console.error(error); // For debugging purposes
            return res.status(500).json({ message: 'An error occurred while creating the user. Please try again later.' });
        }
    }
});
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error(error); // For debugging purposes
        res.status(500).json({ message: 'An error occurred while retrieving the users.' });
    }
});
// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Generate JWT
        const token = jwt.sign(
            { id: user._id, username: user.username, permissions: user.permissions },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            user: user,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.delete('/delete/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error); // For debugging purposes
        res.status(500).json({ message: 'An error occurred while deleting the user. Please try again later.' });
    }
});
module.exports = router;
