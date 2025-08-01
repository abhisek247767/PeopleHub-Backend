const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: [true, "Project name is required"],
        trim: true,
        maxlength: [100, "Project name cannot exceed 100 characters"]
    },
    projectDescription: {
        type: String,
        required: [true, "Project description is required"],
        trim: true,
        maxlength: [1000, "Project description cannot exceed 1000 characters"]
    },
    deliveryManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Delivery Manager is required"]
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Manager is required"]
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Lead is required"]
    },
    developers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'],
        default: 'planning'
    },
    startDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    budget: {
        type: Number,
        required: false,
        min: [0, "Budget cannot be negative"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Indexes for better query performance
projectSchema.index({ projectName: 1 });
projectSchema.index({ deliveryManager: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ lead: 1 });
projectSchema.index({ developers: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdBy: 1 });

// Validation to ensure roles are not duplicated
projectSchema.pre('save', function(next) {
    const roles = [this.deliveryManager, this.manager, this.lead];
    const uniqueRoles = new Set(roles.map(id => id.toString()));
    
    if (uniqueRoles.size !== roles.length) {
        return next(new Error('Delivery Manager, Manager, and Lead must be different users'));
    }
    
    // Check if any developer is also in management roles
    const developerIds = this.developers.map(id => id.toString());
    const managementIds = roles.map(id => id.toString());
    
    const overlap = developerIds.some(devId => managementIds.includes(devId));
    if (overlap) {
        return next(new Error('Developers cannot also be in management roles'));
    }
    
    next();
});

// Virtual to get total team size
projectSchema.virtual('teamSize').get(function() {
    return 3 + this.developers.length; // deliveryManager + manager + lead + developers
});

// Virtual to populate all team members
projectSchema.virtual('deliveryManagerDetails', {
    ref: 'User',
    localField: 'deliveryManager',
    foreignField: '_id',
    justOne: true
});

projectSchema.virtual('managerDetails', {
    ref: 'User',
    localField: 'manager',
    foreignField: '_id',
    justOne: true
});

projectSchema.virtual('leadDetails', {
    ref: 'User',
    localField: 'lead',
    foreignField: '_id',
    justOne: true
});

projectSchema.virtual('developerDetails', {
    ref: 'User',
    localField: 'developers',
    foreignField: '_id'
});

projectSchema.virtual('createdByDetails', {
    ref: 'User',
    localField: 'createdBy',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true });

// Method to check if a user is part of the project team
projectSchema.methods.isTeamMember = function(userId) {
    const userIdStr = userId.toString();
    return (
        this.deliveryManager.toString() === userIdStr ||
        this.manager.toString() === userIdStr ||
        this.lead.toString() === userIdStr ||
        this.developers.some(dev => dev.toString() === userIdStr)
    );
};

// Method to get user's role in the project
projectSchema.methods.getUserRole = function(userId) {
    const userIdStr = userId.toString();
    
    if (this.deliveryManager.toString() === userIdStr) return 'deliveryManager';
    if (this.manager.toString() === userIdStr) return 'manager';
    if (this.lead.toString() === userIdStr) return 'lead';
    if (this.developers.some(dev => dev.toString() === userIdStr)) return 'developer';
    
    return null;
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
