const authService = require("../services/authService");

const createUser = async (req, res) => {
  try {
    const data = await authService.createUser(
      req.body.username,
      req.body.email,
      req.body.password,
      req.body.confirmPassword
    );
    res.status(201).json(data);
  } catch (error) {
    console.error("Error in createUser controller:", error);

    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    res.status(500).json({ message: error.message || "Signup failed!" });
  }
};


const verifyUser = async (req, res) => {
  try {
    const data = await authService.verifyUser(
      req.body.email,
      req.body.verificationCode
    );

    res.status(200).json(data);
  } catch (error) {
    console.error("Error in verifyUser controller : ", error.message);
    res.status(400).json({ message: error.message });
  }
};

const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const data = await authService.resendVerificationCode(email);
    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Error in resendVerificationCode controller : ",
      error.message
    );
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body.email, req.body.password);

    req.session.user = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
    };
    req.session.token = data.token;

    res.cookie("authToken", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Error in loginUser controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const data = await authService.forgotPassword(email);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error in forgot password:", error);
    res
      .status(500)
      .json({ message: "Failed to process password reset request" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword, confirmPassword } = req.body;

    const data = await authService.resetPassword(
      email,
      resetCode,
      newPassword,
      confirmPassword
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

const changePassword = async (req, res) => {
  try {
    const data = await authService.changePassword(
      req.user.userId,
      req.body.currentPassword,
      req.body.newPassword,
      req.body.confirmPassword
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const role = req.user.role;

    // Clear cookies
    res.clearCookie("authToken");
    res.clearCookie("refreshToken");
    res.clearCookie("connect.sid");

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Failed to log out" });
      }
      return res.status(200).json({
        message: `${role} successfully logged out`,
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};

const fetchAccountData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('username email verified role profilePicture');
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
  fetchAccountData,
};
