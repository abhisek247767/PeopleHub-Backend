const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generateVerificationCode = require('../utils/generateVerificationCode');
const {sendVerificationEmail} = require('../services/mailService');

const createUser = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        
        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
    
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const verificationCode = generateVerificationCode();

        // Create user with unverified status
        const user = new User({ 
            username, 
            email, 
            password, 
            verificationCode, 
            verificationCodeValidation: new Date(Date.now() + 3600000), // 1 hour
            verified: false
        });
        
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, username, verificationCode);
            console.log("Verification email sent successfully");
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Don't fail the registration if email fails
        }
   
        res.status(201).json({
            message: `Registration successful! Please check your email at ${email} for verification code.`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            },
        });

    } catch(error) {
        console.error('Error during user signup:', error);
        
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: errorMessages });
        }

        if (error.code === 11000) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        res.status(500).json({ message: "Signup failed!", error: error.message });
    }
};

const verifyUser = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;
        
        if (!email || !verificationCode) {
            return res.status(400).json({ message: "Email and verification code are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.verified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        if (user.verificationCode !== verificationCode || !user.verificationCode) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        if (user.isVerificationCodeExpired()) {
            return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
        }

        // Verify user
        user.verified = true; 
        user.verificationCode = undefined; 
        user.verificationCodeValidation = undefined; 
        await user.save();

        res.status(200).json({ 
            message: "Email verified successfully! You can now login.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });

    } catch (error) {
        console.error('Error during verification:', error);
        res.status(500).json({ message: "Verification failed. Please try again." });
    }
};

const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.verified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        // Generate new verification code
        const verificationCode = generateVerificationCode();
        user.verificationCode = verificationCode;
        user.verificationCodeValidation = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // Send new verification email
        try {
            await sendVerificationEmail(email, user.username, verificationCode);
            res.status(200).json({ 
                message: "New verification code sent to your email" 
            });
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            res.status(500).json({ message: "Failed to send verification email" });
        }

    } catch (error) {
        console.error('Error resending verification code:', error);
        res.status(500).json({ message: "Failed to resend verification code" });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ errors: { message: "Email and password are required" } });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ errors: { message: "Invalid email or password" } });
        }

        // Check if user is verified
        if (!user.verified) {
            return res.status(401).json({ 
                errors: { message: "Please verify your email before logging in" },
                needsVerification: true
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
           return res.status(401).json({ errors: { password: "Password is incorrect" } });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Save session information
        req.session.user = { id: user._id, email: user.email, role: user.role };
        req.session.token = token;

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                username: user.username, 
                role: user.role,
                verified: user.verified
            },
            token,
            refreshToken
        });

    } catch(error) {
        console.error('Login error: ', error);
        res.status(500).json({ message: "Login failed. Please try again later." });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({ 
                message: "If an account with this email exists, you will receive a password reset code." 
            });
        }

        // Generate password reset code
        const resetCode = generateVerificationCode();
        user.forgotPasswordCode = resetCode;
        user.forgotPasswordCodeValidation = new Date(Date.now() + 1800000); // 30 minutes
        await user.save();

        // Send password reset email
        try {
            await sendVerificationEmail(email, user.username, resetCode, 'passwordReset');
            res.status(200).json({ 
                message: "If an account with this email exists, you will receive a password reset code." 
            });
        } catch (emailError) {
            console.error("Failed to send password reset email:", emailError);
            res.status(500).json({ message: "Failed to send password reset email" });
        }

    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: "Failed to process password reset request" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, resetCode, newPassword, confirmPassword } = req.body;
        
        if (!email || !resetCode || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.forgotPasswordCode || user.forgotPasswordCode !== resetCode) {
            return res.status(400).json({ message: "Invalid reset code" });
        }

        if (user.isForgotPasswordCodeExpired()) {
            return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user password and clear reset fields
        user.password = hashedPassword;
        user.forgotPasswordCode = undefined;
        user.forgotPasswordCodeValidation = undefined;
        await user.save();

        res.status(200).json({ 
            message: "Password reset successful. You can now login with your new password." 
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: "Failed to reset password" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ 
            message: "Password changed successfully" 
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: "Failed to change password" });
    }
};

const logoutUser = async (req, res) => {
    try {
        const role = req.user.role;
        
        // Clear cookies
        res.clearCookie('authToken');
        res.clearCookie('refreshToken');
        res.clearCookie('connect.sid');

        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Failed to log out' });
            }
            return res.status(200).json({ 
                message: `${role} successfully logged out` 
            });
        });
      
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'An unexpected error occurred' });
    }
};

const fetchAccountData = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('username email verified role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);      
    } catch (error) {
        console.error('Error fetching account data:', error.message);
        res.status(500).json({ 
            message: 'Failed to fetch account data', 
            detail: error.message 
        });
    }
};

module.exports = {
    createUser, 
    verifyUser, 
    resendVerificationCode,
    loginUser, 
    forgotPassword,
    resetPassword,
    changePassword,
    logoutUser,
    fetchAccountData
};