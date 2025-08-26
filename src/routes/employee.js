const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/EmployeeController');
const { authenticate } = require('../middleware/authMiddleware');

// Employee Routes

/**
 * @route POST /employees
 * @desc Create a new employee (admin only)
 * @access Private (Admin only)
 */
router.post('/employees', authenticate(['admin', 'superadmin']), EmployeeController.createEmployee);

/**
 * @route GET /employees
 * @desc Get all employees with pagination and filters
 * @access Private (All authenticated users)
 */
router.get('/employees', authenticate(), EmployeeController.getAllEmployees);

/**
 * @route GET /employees/:id
 * @desc Get employee by ID
 * @access Private (All authenticated users)
 */
router.get('/employees/:id', authenticate(), EmployeeController.getEmployeeById);

/**
 * @route GET /employees/emails
 * @desc Get all employee emails
 * @access Private (All authenticated users)
 */
router.get('/employees/emails', authenticate(), EmployeeController.getAllEmployeeEmails);
/*
 * @route GET /employees/:id/leaves
 * @desc Get employee leave balances (sick, casual, privilege)
 * @access Private (All authenticated users)
 */
router.get('/employees/:id/leaves', authenticate(), EmployeeController.getEmployeeLeaves);

/**
 * @route PUT /employees/:id
 * @desc Update employee data
 * @access Private (Admin or employee themselves)
 */
router.put('/employees/:id', authenticate(), EmployeeController.updateEmployee);

/**
 * @route DELETE /employees/:id
 * @desc Delete employee (admin only)
 * @access Private (Admin only)
 */
router.delete('/employees/:id', authenticate(['admin', 'superadmin']), EmployeeController.deleteEmployee);

module.exports = router;
