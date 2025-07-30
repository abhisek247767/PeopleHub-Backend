const {
    createUser, 
    verifyUser, 
    resendVerificationCode,
    loginUser, 
    forgotPassword,
    resetPassword,
    changePassword,
    logoutUser,
    fetchAccountData,
} = require("../controllers/authController");

const { authenticate } = require("../middleware/authMiddleware");
const express = require('express');
const router = express.Router();

// Public routes
router.post('/signup', createUser);
router.post('/verify', verifyUser);
router.post('/resend-verification', resendVerificationCode);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', authenticate(['superadmin', 'admin', 'user']), logoutUser);
router.get('/me', authenticate(), fetchAccountData);
router.post('/change-password', authenticate(), changePassword);

module.exports = router;