const User = require("../models/userSchema");
const generateVerificationCode = require("../utils/generateVerificationCode");
const { sendVerificationEmail } = require("../services/mailService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createUser = async (username, email, password, confirmPassword) => {
  if (!username || !email || !password || !confirmPassword) {
    throw new Error("All fields are required");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const verificationCode = generateVerificationCode();

  // Create user with unverified status
  const user = new User({
    username,
    email,
    password,
    verificationCode,
    verificationCodeValidation: new Date(Date.now() + 3600000), // 1 hour
    verified: false,
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

  return {
    message: `Registration successful! Please check your email at ${email} for verification code.`,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
  };
};

const verifyUser = async (email, verificationCode) => {
  if (!email || !verificationCode) {
    throw new Error("Email and verification code are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  if (user.verified) {
    throw new Error("User is already verified");
  }

  if (user.verificationCode !== verificationCode || !user.verificationCode) {
    throw new Error("Invalid verification code");
  }
  if (user.isVerificationCodeExpired()) {
    throw new Error("Verification code has expired. Please request a new one.");
  }

  user.verified = true;
  user.verificationCode = undefined;
  user.verificationCodeValidation = undefined;
  await user.save();

  return {
    message: "Email verified successfully! You can now login.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
  };
};

const resendVerificationCode = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const verificationCode = generateVerificationCode();
  user.verificationCode = verificationCode;
  user.verificationCodeValidation = new Date(Date.now() + 3600000); // 1 hour
  await user.save();

  try {
    await sendVerificationEmail(email, user.username, verificationCode);
    return {
      message: "New verification code sent to your email",
    };
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    return { message: "Failed to send verification email" };
  }
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }
  if (!user.verified) {
    throw new Error("Please verify your email before logging in");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error("Password is incorrect");
  }
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return {
    message: "Login successful",
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      verified: user.verified,
    },
    token,
    refreshToken,
  };
};

const forgotPassword = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return {
      message:
        "If an account with this email exists, you will receive a password reset code.",
    };
  }
  const resetCode = generateVerificationCode();
  user.forgotPasswordCode = resetCode;
  user.forgotPasswordCodeValidation = new Date(Date.now() + 1800000); // 30 minutes
  await user.save();

  try {
    await sendVerificationEmail(
      email,
      user.username,
      resetCode,
      "passwordReset"
    );
    return {
      message:
        "If an account with this email exists, you will receive a password reset code.",
    };
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
    throw new Error("Failed to send password reset email");
  }
};

const resetPassword = async (
  email,
  resetCode,
  newPassword,
  confirmPassword
) => {
  if (!email || !resetCode || !newPassword || !confirmPassword) {
    throw new Error("All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.forgotPasswordCode || user.forgotPasswordCode !== resetCode) {
    throw new Error("Invalid reset code");
  }

  if (user.isForgotPasswordCodeExpired()) {
    throw new Error("Reset code has expired. Please request a new one.");
  }

  // Hash new password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update user password and clear reset fields
  user.password = hashedPassword;
  user.forgotPasswordCode = undefined;
  user.forgotPasswordCodeValidation = undefined;
  await user.save();

  return {
    message:
      "Password reset successful. You can now login with your new password.",
  };
};

const changePassword = async (
  userId,
  currentPassword,
  newPassword,
  confirmPassword
) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New passwords do not match");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    throw new Error("Current password is incorrect");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  user.password = hashedPassword;
  await user.save();

  return {
    message: "Password changed successfully",
  };
};

module.exports = {
  createUser,
  verifyUser,
  resendVerificationCode,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
};
