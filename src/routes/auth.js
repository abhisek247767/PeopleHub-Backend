const {createUser, verifyUser, loginUser, logoutUser} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

const express = require('express');
const router = express.Router();


router.post('/signup', createUser);
router.post('/verify', verifyUser);
router.post('/login', loginUser);
router.post('/logout', authenticate(['superadmin', 'admin', 'user']) ,logoutUser);

module.exports = router;