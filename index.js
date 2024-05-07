
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// mongoose.connect('mongodb://localhost/schoolManagementDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
mongoose
    .connect("mongodb+srv://maazkhan:1234@cluster0.f44xick.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

// mongoose.connect('mongodb://localhost:27017/schoolManagementDB');

// // Listen for the connected event
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB database');
  });
  
  // Listen for the error event
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);
const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  fatherName: String,
  age: Number,
  gender: String,
  status: String,
  studentClass: {
    type: String, // Change type to String
    required: true // Ensure it's required if necessary
  },
  address: String,
  phoneNumber: String,
  email: String,
  dob: Date,
  nationality: String,
  admissionDate: Date,
  currentFees: Number,
  feePaymentHistory: [{
    date: Date,
    amount: Number
  }],
  otherCharges: [{
    chargeType: String,
    amount: Number,
    paymentStatus: {
      type: String,
      default: "pending"
    },
    dueDate: Date,
    paidAmount: {
      type: Number,
      default: 0
    },
    paymentHistory: [{
      date: Date,
      amount: Number
    }]
  }],
  discount: {
    type: Number,
    default: 0
  },
  createdBy: String
});

const Student = mongoose.model('Student', studentSchema);
// const Student = mongoose.model('Student', studentSchema);

const logSchema = new mongoose.Schema({
  username: String,
  action: String,
  description: String,
  timestamp: { type: Date, default: Date.now }
});
const dummyUser = {
    username: 'testuser',
    password: 'testpassword'
};
const Log = mongoose.model('Log', logSchema);

const authenticateUser = async (req, res, next) => {
  try {
    // const token = req.headers.authorization.split(' ')[1];
    const token = jwt.sign({ username: dummyUser.username }, 'secret');
    const decoded = jwt.verify(token, 'secret');
    
    req.username = decoded.username;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

app.use((req, res, next) => {
  if (req.originalUrl !== '/login') {
    authenticateUser(req, res, next);
  } else {
    next();
  }
});
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user
        const user = new User({ username, password: hashedPassword });
        // Save the user to the database
        await user.save();
        // Log the registration action
        await Log.create({ username, action: 'Registration', description: 'User registered successfully' });
        // Respond with success message
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        // If an error occurs during registration, respond with an error message
        res.status(400).json({ message: error.message });
    }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('User not found');
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid password');
    }
    const token = jwt.sign({ username }, 'secret');
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

app.post('/students', async (req, res) => {
  try {
    const student = new Student({ ...req.body, createdBy: req.username });
    await student.save();
    // Log the action after the successful operation
    await Log.create({ username: req.username, action: 'POST', description: 'added a new student' });
    res.status(201).json({ message: 'Student created successfully', student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Log the action after the successful operation
    await Log.create({ username: req.username, action: 'PUT', description: 'updated student details' });
    res.json({ message: 'Student updated successfully', updatedStudent });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    // Log the action after the successful operation
    await Log.create({ username: req.username, action: 'DELETE', description: 'deleted a student' });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
