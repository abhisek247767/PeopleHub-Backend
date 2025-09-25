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
<<<<<<< HEAD
router.get('/profile-picture/:userId', getProfilePicture);v
=======
>>>>>>> 349c80d2ff95efe905f55a9179b3646136f6a64a
router.put('/update-profile', authenticate(), updateProfile);

router.get('/profile-picture/:userId', getProfilePicture);

module.exports = router;