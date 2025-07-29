const express = require('express');
const router = express.Router();

// Import controller functions
const { createEmployee, getEmployees, uploadProfilePicture, getProfilePicture, updateProfile } = require('../controllers/userController'); // New import
const { fetchDepartment, fetchSubDepartment } = require('../controllers/DepartmentController'); // Existing import

// Import the authentication middleware
const { authenticate } = require('../middleware/authMiddleware');

// Existing Department Routes
router.get('/departments', fetchDepartment);
router.get('/subDepartment', fetchSubDepartment);

// New Employee Creation Route
// It is protected by the authenticate middleware, allowing only 'superadmin' and 'admin' roles to create employees.
router.post('/create-employee', createEmployee);
router.get('/employees', getEmployees);

// Profile Picture Upload and Retrieval
router.get('/profile-picture/:userId', getProfilePicture);
router.put('/update-profile', authenticate(), updateProfile);

module.exports = router;