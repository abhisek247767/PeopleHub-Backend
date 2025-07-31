
const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    projectName:{
        type: String,
        required:[true,"Project name is required"],
        trim: true,
        maxlength:[100,"Project name cannot exceed 100 characters"]
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"]
    },
    endDate: {
        type: Date,
        required: [true, "End date is required"],
        validate: {
            validator: function(value) {
                return value > this.startDate;
            },
            message: "End date must be after start date"
        }
    },
    status: {
        type: String,
        required: true,
        enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
        default: 'Not Started'
    },
    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true
    },
    // Foreign key reference to Employee for Delivery Manager
    deliveryManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required:[true , "Delivery Manager is required"]
    },
    // Foreign key reference to Employee for Team Lead
    teamLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, "Team Lead is required"]
    },
    // Array of foreign key references to Employee for Developers (multiple employees)
    developers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Employee'
    }],
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    clientName: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});


// Index for better query Performance
projectSchema.index({ projectName: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ department: 1 });
projectSchema.index({ deliveryManager: 1 });
projectSchema.index({ teamLead: 1 });
projectSchema.index({ developers: 1 });


const Project = mongoose.model('Project', projectSchema);
module.exports = Project;