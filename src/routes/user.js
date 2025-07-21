// routes/department.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { fetchDepartment,fetchSubDepartment } = require('../controllers/departmentController');

router.get('/departments', fetchDepartment);
router.get('/subDepartments', fetchSubDepartment);

module.exports = router;
