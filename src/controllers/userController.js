const Employee = require('../models/Employee'); // Import the new Employee model
// You might also need the User model or authentication middleware if roles are involved
// const User = require('../models/userSchema'); // If needed for general user lookup
const { authenticate } = require('../middleware/authMiddleware'); // For protecting routes

// Function to create a new employee
const createEmployee = async (req, res) => {
    try {
        const { employeeName, contactNo, email, gender, department, subDepartment, password, role } = req.body;
        // Basic validation
        if (!employeeName || !contactNo || !email || !gender || !department || !subDepartment || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        // Check if an employee with the given email or contactNo already exists
        const existingEmployee = await Employee.findOne({ $or: [{ email }, { contactNo }] });
        if (existingEmployee) {
            return res.status(409).json({ message: 'Employee with this email or contact number already exists.' });
        }
        // Create a new employee instance
        const newEmployee = new Employee({
            employeeName,
            contactNo,
            email,
            gender,
            department,
            subDepartment,
            password, // The pre-save hook in Employee.js will hash this
            role
        });
        // Save the employee to the database
        await newEmployee.save();
        // Respond with success
        res.status(201).json({ message: 'Employee created successfully!', employeeId: newEmployee._id });
    } catch (error) {
        console.error('Error creating employee:', error);
        // Handle Mongoose validation errors or other errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation error', errors: messages });
        }
        res.status(500).json({ message: 'Server error while creating employee.' });
    }
};

// Function to get all employees
const getEmployees = async (req, res) => {
    try {
        // Fetch all employees from the database, excluding password field for security
        const employees = await Employee.find({}).select('-password');
        
        // Always return success (200) even with empty array
        res.status(200).json({
            message: employees.length > 0 
                ? 'Employees retrieved successfully!' 
                : 'No employees found',
            count: employees.length,
            employees: employees
        });
        
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ 
            message: 'Server error while fetching employees.',
            error: error.message 
        });
    }
};

// Export the functions to be used in routes
module.exports = {
    createEmployee,
    getEmployees,
    // ... other user-related functions if they were to be added here
}