const User = require('../models/userSchema');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const mongoose = require('mongoose');
const cron = require('node-cron');

cron.schedule("0 0 1 * *", async () => {
    try {
        await Employee.updateMany({}, {
            $set: { casualLeave: 1 }, // reset CL
            $inc: { privilegeLeave: 1, sickLeave: 1 } // increment PL & SL
        });
        console.log("Monthly leave update successful!");
    } catch (err) {
        console.error("Error in monthly leave update:", err);
    }
});

class EmployeeService {
    /**
     * Create employee with automatic user creation
     * Only admin can create employees
     * @param {Object} employeeData - Employee data
     * @param {Object} createdBy - User who is creating the employee (must be admin)
     * @returns {Object} Created employee with user data
     */
    static async createEmployee(employeeData, createdBy) {
        // Check if creator has admin privileges
        if (createdBy.role !== 'admin' && createdBy.role !== 'superadmin') {
            throw new Error('Access denied. Only admins can create employees.');
        }

        const { employeeName, contactNo, email, gender, department, subDepartment, password, username } = employeeData;

        try {
            // Check if user with this email already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                // Check if employee record also exists
                const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
                if (existingEmployee) {
                    throw new Error('Employee with this email already exists');
                }
                // If user exists but no employee record, we can create employee record
                // This handles the case where a user was created first
            }

            // Check if employee with contact number already exists
            const existingEmployeeByContact = await Employee.findOne({ contactNo });
            if (existingEmployeeByContact) {
                throw new Error('Employee with this contact number already exists');
            }

            let user;
            if (existingUser) {
                user = existingUser;
                // Update user role to employee if not already
                if (user.role === 'user') {
                    user.role = 'employee';
                    await user.save();
                }
            } else {
                // Create new user account
                user = new User({
                    username: username || employeeName.toLowerCase().replace(/\s+/g, ''),
                    email: email.toLowerCase(),
                    password: password,
                    role: 'employee',
                    verified: true // Auto-verify employee accounts
                });
                await user.save();
            }

            // Create employee record
            const employee = new Employee({
                user_id: user._id,
                employeeName,
                contactNo,
                email: email.toLowerCase(),
                gender,
                department,
                subDepartment
            });

            await employee.save();

            // Populate user data
            await employee.populate('user');

            return {
                success: true,
                message: 'Employee created successfully',
                employee: employee,
                userCreated: !existingUser
            };

        } catch (error) {
            throw new Error(`Failed to create employee: ${error.message}`);
        }
    }


    /**
     * Get employee with user details
     * @param {String} employeeId - Employee ID
     * @returns {Object} Employee with user data
     */
    static async getEmployeeById(employeeId) {
        try {
            const employee = await Employee.findById(employeeId).populate('user');
            if (!employee) {
                throw new Error('Employee not found');
            }
            return employee;
        } catch (error) {
            throw new Error(`Failed to fetch employee: ${error.message}`);
        }
    }

        /**
     * Get all employees with emails
     * @returns {Array} list of employee email
     */
        static async getAllEmployeeEmail() {
            try {
                const employees = await Employee.find({}).select('email').sort({ email: 1});

                const emailList = employees.map(employee => employee.email)

                return emailList;
            } catch (error) {
                throw new Error(`Failed to fetch employee emails: ${error.message}`);
            }
        }

    /**
     * Get all employees with pagination
     * @param {Number} page - Page number
     * @param {Number} limit - Items per page
     * @param {Object} filters - Filter criteria
     * @returns {Object} Employees list with pagination info
     */
    static async getAllEmployees(page = 1, limit = 10, filters = {}) {
        try {
            const skip = (page - 1) * limit;

            // Build filter query
            let filterQuery = {};
            if (filters.department) filterQuery.department = filters.department;
            if (filters.subDepartment) filterQuery.subDepartment = filters.subDepartment;
            if (filters.gender) filterQuery.gender = filters.gender;

            const employees = await Employee.find(filterQuery)
                .populate('user', '-password -verificationCode -verificationCodeValidation -forgotPasswordCode -forgotPasswordCodeValidation')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Employee.countDocuments(filterQuery);

            // Add some debugging to check the data format
            console.log('Raw employee data sample:', employees[0] ? {
                _id: employees[0]._id,
                user_id: employees[0].user_id,
                employeeName: employees[0].employeeName
            } : 'No employees found');

            return {
                employees,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalEmployees: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            };
        } catch (error) {
            throw new Error(`Failed to fetch employees: ${error.message}`);
        }
    }

    /**
     * Get employee leave balances
     * @param {String} employeeId - Employee ID
     * @returns {Object} Leave balances (sick, casual, privilege)
     */
    static async getEmployeeLeaves(employeeId) {
        try {
            // Validate employeeId
            if (!mongoose.Types.ObjectId.isValid(employeeId)) {
                throw new Error(`Invalid employee ID format: ${employeeId}`);
            }

            // Fetch employee with leave fields only
            const employee = await Employee.findById(employeeId).select(
                'sickLeave casualLeave privilegeLeave'
            );

            if (!employee) {
                throw new Error('Employee not found');
            }

            return {
                sickLeave: employee.sickLeave ?? 0,
                casualLeave: employee.casualLeave ?? 0,
                privilegeLeave: employee.privilegeLeave ?? 0
            };
        } catch (error) {
            throw new Error(`Failed to fetch employee leaves: ${error.message}`);
        }
    }

    /**
     * Update employee data
     * @param {String} employeeId - Employee ID
     * @param {Object} updateData - Data to update
     * @param {Object} updatedBy - User making the update
     * @returns {Object} Updated employee
     */
    static async updateEmployee(employeeId, updateData, updatedBy) {
        try {
            // Check permissions (admin or the employee themselves)
            const employee = await Employee.findById(employeeId).populate('user');
            if (!employee) {
                throw new Error('Employee not found');
            }

            const isAdmin = updatedBy.role === 'admin' || updatedBy.role === 'superadmin';
            const isSelf = employee.user_id.toString() === updatedBy._id.toString();

            if (!isAdmin && !isSelf) {
                throw new Error('Access denied. You can only update your own profile or be an admin.');
            }

            // Prevent updating sensitive fields if not admin
            if (!isAdmin) {
                delete updateData.department;
                delete updateData.subDepartment;
                delete updateData.email;
            }

            // Update employee data
            Object.assign(employee, updateData);
            await employee.save();

            await employee.populate('user');
            return employee;
        } catch (error) {
            throw new Error(`Failed to update employee: ${error.message}`);
        }
    }

    /**
     * Delete employee (also handles user account)
     * @param {String} employeeId - Employee ID
     * @param {Object} deletedBy - User making the deletion (must be admin)
     * @returns {Object} Deletion result
     */
    static async deleteEmployee(employeeId, deletedBy) {
        console.log('EmployeeService.deleteEmployee called with:', {
            employeeId,
            deletedByRole: deletedBy?.role,
            deletedById: deletedBy?._id
        });

        // Only admin can delete employees
        if (deletedBy.role !== 'admin' && deletedBy.role !== 'superadmin') {
            throw new Error('Access denied. Only admins can delete employees.');
        }

        try {
            // Validate employeeId format
            if (!mongoose.Types.ObjectId.isValid(employeeId)) {
                throw new Error(`Invalid employee ID format: ${employeeId}`);
            }

            const employee = await Employee.findById(employeeId);
            if (!employee) {
                throw new Error('Employee not found');
            }

            console.log('Employee found, checking project assignments...');

            // Check if employee is assigned to any projects
            const projectCount = await Project.countDocuments({
                $or: [
                    { deliveryManager: employee.user_id },
                    { manager: employee.user_id },
                    { lead: employee.user_id },
                    { developers: employee.user_id }
                ]
            });

            console.log(`Employee is assigned to ${projectCount} projects`);

            if (projectCount > 0) {
                throw new Error('Cannot delete employee. They are assigned to active projects.');
            }

            console.log('Proceeding to delete employee...');

            // Delete employee record
            await Employee.findByIdAndDelete(employeeId);

            console.log('Employee record deleted, updating user account...');

            // Optionally delete or deactivate user account
            // For now, we'll just change the role back to 'user'
            await User.findByIdAndUpdate(employee.user_id, {
                role: 'user',
                verified: false
            });

            console.log('Employee deletion completed successfully');

            return {
                success: true,
                message: 'Employee deleted successfully'
            };
        } catch (error) {
            throw new Error(`Failed to delete employee: ${error.message}`);
        }
    }
}

module.exports = EmployeeService;
