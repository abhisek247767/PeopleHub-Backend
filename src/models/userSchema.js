const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email",
        },
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        validate: {
            validator: function(value) {
                // Only validate password if it hasn't been hashed yet
                if (this.isModified('password') && !value.startsWith('$2b$')) {
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(value);
                }
                return true;
            },
            message: "Password must have at least one uppercase letter, one lowercase letter, one number, and one special character."
        },
    },
    role: { type: String, enum: ['superadmin', 'admin', 'user', 'employee'], default: 'user' },
    verified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeValidation: { type: Date },
    forgotPasswordCode: { type: String },
    forgotPasswordCodeValidation: { type: Date },
    profilePicture: { type: Buffer, required: false },
    profilePictureType: { type: String, required: false },
}, { timestamps: true });

// Hash password before saving user
userSchema.pre('save', async function (next) {
    if (this.isModified('password') && !this.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.index({ email: 1, username: 1 });

userSchema.methods.isVerificationCodeExpired = function() {
    return this.verificationCodeValidation < new Date();
};

userSchema.methods.isForgotPasswordCodeExpired = function() {
    return this.forgotPasswordCodeValidation < new Date();
};

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.verificationCode;
    delete userObject.verificationCodeValidation;
    delete userObject.forgotPasswordCode;
    delete userObject.forgotPasswordCodeValidation;
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
