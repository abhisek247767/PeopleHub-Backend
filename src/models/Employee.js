const mongoose = require("mongoose");
const validator = require("validator"); // Assuming use email validation here too
const bcrypt = require("bcrypt"); // For hashing employee passwords

const employeeSchema = new mongoose.Schema({
    employeeName: {
        type: String,
        required: true,
        trim: true // Removing whitespace from both ends of a string
    },
    contactNo: {
        type: String,
        required: true,
        unique: true, // Assuming contact number should be unique
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true, // Stores emails in lowercase
        validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email",
        },
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'] // Restrict to specific values
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    subDepartment: {
        type: String,
        required: true,
        trim: true
    },
    password: { // Employees might also need a password for login
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        validate: {
            validator: function(value) {
                // Password regex: at least one lowercase, one uppercase, one digit, and one special character
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(value);
            },
            message: "Password must have at least one uppercase letter, one lowercase letter, one number, and one special character."
        },
    },
    role: { // Employee might also have a role
        type: String,
        enum: ['superadmin','admin', 'user', 'employee'], // Added 'employee' role
        default: 'employee' // Default role for new employees
    },
}, { timestamps: true });

// Hash password before saving employee
employeeSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});



const Employee = new mongoose.model('Employee', employeeSchema);

module.exports = Employee;