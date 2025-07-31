const Employee = require('../models/Employee'); // Import the new Employee model
const User = require('../models/userSchema'); // If needed for general user lookup
const { authenticate } = require('../middleware/authMiddleware'); // For protecting routes
const multer = require('multer');
const upload = multer();

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

// Upload profile picture as blob to MongoDB
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Accept file as raw binary in body
        if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('image/')) {
            return res.status(400).json({ message: 'Content-Type must be an image' });
        }
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
            const buffer = Buffer.concat(chunks);
            await User.findByIdAndUpdate(req.user._id, {
                profilePicture: buffer,
                profilePictureType: req.headers['content-type']
            });
            res.status(200).json({ message: 'Profile picture uploaded successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading profile picture', error: error.message });
    }
};

// Get profile picture as blob from MongoDB
const getProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user || !user.profilePicture) {
            return res.status(404).json({ message: 'Profile picture not found' });
        }
        res.set('Content-Type', user.profilePictureType || 'image/jpeg');
        res.send(user.profilePicture);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving profile picture', error: error.message });
    }
};

// Update profile and profile picture in one endpoint
const updateProfile = [upload.single('profilePicture'), async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const updateData = { ...req.body };
        if (req.file) {
            updateData.profilePicture = req.file.buffer;
            updateData.profilePictureType = req.file.mimetype;
        }
        // If password is being updated, hash it before saving
        if (updateData.password && updateData.password !== '********') {
            const bcrypt = require('bcrypt');
            const salt = await bcrypt.genSalt();
            updateData.password = await bcrypt.hash(updateData.password, salt);
        } else {
            delete updateData.password;
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
}];

// Export the functions to be used in routes
module.exports = {
    createEmployee,
    getEmployees,
    uploadProfilePicture,
    getProfilePicture,
    updateProfile,
    // ... other user-related functions if they were to be added here
}