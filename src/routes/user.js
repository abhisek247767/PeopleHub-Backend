const express = require('express');
const router = express.Router();

// Import controller functions
const { uploadProfilePicture, getProfilePicture, updateProfile } = require('../controllers/userController');
const { fetchDepartment, fetchSubDepartment } = require('../controllers/DepartmentController');

// Import the authentication middleware
const { authenticate } = require('../middleware/authMiddleware');

// Existing Department Routes
router.get('/departments', fetchDepartment);
router.get('/subDepartment', fetchSubDepartment);

// Profile Picture Upload and Retrieval
router.put('/update-profile', authenticate(), updateProfile);
router.get('/profile-picture/:userId', getProfilePicture);

module.exports = router;