const {createUser, verifyUser, loginUser, logoutUser,fetchAccountData} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

const express = require('express');
const router = express.Router();


router.post('/signup', createUser);
router.post('/verify', verifyUser);
router.post('/login', loginUser);
router.post('/logout', authenticate(['superadmin', 'admin', 'user']) ,logoutUser);
router.get('/me',authenticate(),fetchAccountData);



module.exports = router;