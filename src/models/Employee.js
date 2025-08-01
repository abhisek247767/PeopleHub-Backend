const mongoose = require("mongoose");
const validator = require("validator");

const employeeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One user can have only one employee record
    },
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
    // Removed password and role fields as they are handled by User schema
}, { timestamps: true });

// Index for better query performance
employeeSchema.index({ user_id: 1, email: 1 });

// Virtual to populate user data
employeeSchema.virtual('user', {
    ref: 'User',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
employeeSchema.set('toJSON', { virtuals: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;