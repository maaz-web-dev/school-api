
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
// Subject Schema
const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    totalMarks: { type: Number, required: true }
});

// Class Schema
const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fees: { type: Number, required: true },
    // subjects: [subjectSchema]  //this need to be fixed
});

// Transaction Schema for detailed financial transactions
const transactionSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    amount: { type: Number, required: true, default: 0 },
    description: String, // Optional
    type: {
        type: String,
        required: true,
        enum: ['tuitionFees', 'scholarship', 'financialAid', 'refund', 'lateFee'],
        default: 'tuitionFees' // Set default transaction type
    },
    createdBy: { type: String, required: true, default: 'admin' },
    createdAt: { type: Date, default: Date.now }
});

// Tuition Fees Schema for managing all tuition-related finances
const tuitionFeesSchema = new mongoose.Schema({
    totalDue: { type: Number, required: true, default: 0 },
    totalPaid: { type: Number, required: true, default: 0 },
    transactions: [transactionSchema]
});


// Student Schema
const studentSchema = new mongoose.Schema({
    // rollNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    phoneNumber: { type: String },
    age: Number,
    gender: String,
    status: { type: String, default: 'Active' },
    address: String,
    // phoneNumber: String,
    email: String,
    dob: Date,
    nationality: String,
    admissionDate: Date,
    currentFees: Number,
    tuitionFees: tuitionFeesSchema,
    otherCharges: [{
        chargeType: String,
        amount: Number,
        paymentStatus: {
            type: String,
            default: "pending"
        },
        dueDate: Date,
    }],
    classInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }, // References Class
    results: [{
        subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true }, // References Subject
        subjectName: { type: String, required: true },
        obtainedMarks: { type: Number, required: true }
    }]
});

studentSchema.plugin(AutoIncrement, { inc_field: 'rollNumber' });

// Model creation
const Subject = mongoose.model('Subject', subjectSchema);
const Class = mongoose.model('Class', classSchema);
const Student = mongoose.model('Student', studentSchema);

module.exports = { Subject, Class, Student };
