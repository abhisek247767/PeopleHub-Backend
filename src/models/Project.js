const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    projectDescription: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxlength: [1000, "Project description cannot exceed 1000 characters"],
    },
    deliveryManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Delivery Manager is required"],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Manager is required"],
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Lead is required"],
    },
    developers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["planning", "in-progress", "on-hold", "completed", "cancelled"],
      default: "planning",
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    budget: {
      type: Number,
      required: false,
      min: [0, "Budget cannot be negative"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ======================
// Indexes for Performance
// ======================
projectSchema.index({ projectName: 1 });
projectSchema.index({ deliveryManager: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ lead: 1 });
projectSchema.index({ developers: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdBy: 1 });

// ======================
// Virtual Fields
// ======================
projectSchema.virtual("teamSize").get(function () {
  return 3 + this.developers.length; // deliveryManager + manager + lead + developers
});

// Virtuals for populated user details
const userVirtualOptions = { ref: "User", foreignField: "_id" };

projectSchema.virtual("deliveryManagerDetails", {
  ...userVirtualOptions,
  localField: "deliveryManager",
  justOne: true,
});

projectSchema.virtual("managerDetails", {
  ...userVirtualOptions,
  localField: "manager",
  justOne: true,
});

projectSchema.virtual("leadDetails", {
  ...userVirtualOptions,
  localField: "lead",
  justOne: true,
});

projectSchema.virtual("developerDetails", {
  ...userVirtualOptions,
  localField: "developers",
});

projectSchema.virtual("createdByDetails", {
  ...userVirtualOptions,
  localField: "createdBy",
  justOne: true,
});

// Ensure virtuals are included in JSON output
projectSchema.set("toJSON", { virtuals: true });

// ======================
// Methods
// ======================
projectSchema.methods.isTeamMember = function (userId) {
  const userIdStr = userId.toString();
  return (
    this.deliveryManager.toString() === userIdStr ||
    this.manager.toString() === userIdStr ||
    this.lead.toString() === userIdStr ||
    this.developers.some((dev) => dev.toString() === userIdStr)
  );
};

projectSchema.methods.getUserRole = function (userId) {
  const userIdStr = userId.toString();

  if (this.deliveryManager.toString() === userIdStr) return "deliveryManager";
  if (this.manager.toString() === userIdStr) return "manager";
  if (this.lead.toString() === userIdStr) return "lead";
  if (this.developers.some((dev) => dev.toString() === userIdStr))
    return "developer";

  return null;
};

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;