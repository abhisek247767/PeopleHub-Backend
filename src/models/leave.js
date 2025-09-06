const { default: mongoose } = require("mongoose");

// Model for leave requests
const leaveSchema = new mongoose.Schema({

    // Link to employee
    employee:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
     leaveType: {
        type: String,
        required: true,
        enum: ['Casual', 'Sick', 'Privilege']
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    numberOfDays: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    appliedOn: {
        type: Date,
        default: Date.now
    }
}, { _id: true });


// Ensure virtual fields are serialized
leaveSchema.set('toJSON', { virtuals: true });

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;