const { EmployeeService } = require('../services');

class EmployeeController {
    /**
     * Create a new employee
     * POST /employees
     */
    static async createEmployee(req, res) {
        try {
            const result = await EmployeeService.createEmployee(req.body, req.user);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating employee:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get all employees with pagination and filters
     * GET /employees
     */
    static async getAllEmployees(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                department: req.query.department,
                subDepartment: req.query.subDepartment,
                gender: req.query.gender
            };

            // Remove undefined filters
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });

            const result = await EmployeeService.getAllEmployees(page, limit, filters);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching employees:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get employee by ID
     * GET /employees/:id
     */
    static async getEmployeeById(req, res) {
        try {
            const employee = await EmployeeService.getEmployeeById(req.params.id);
            res.status(200).json(employee);
        } catch (error) {
            console.error('Error fetching employee:', error);
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get all employee email
     * GET /employees/emails
     */
    static async getAllEmployeeEmails(req, res) {
        try {
            const emails = await EmployeeService.getAllEmployeeEmails();
            res.status(200).json({
                success: true,
                count: emails.length,
                emails: emails
            });
        } catch (error) {
            console.error('Error fetching employee emails:', error)
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
     /* Get employee leave balances
     * GET /employees/:id/leaves
     */
    static async getEmployeeLeaves(req, res) {
        try {
            const employeeId = req.params.id;

            const leaves = await EmployeeService.getEmployeeLeaves(employeeId);

            res.status(200).json({
                success: true,
                employeeId,
                leaves
            });
        } catch (error) {
            console.error('Error fetching employee leaves:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update employee
     * PUT /employees/:id
     */
    static async updateEmployee(req, res) {
        try {
            const employee = await EmployeeService.updateEmployee(
                req.params.id,
                req.body,
                req.user
            );
            res.status(200).json({
                success: true,
                message: 'Employee updated successfully',
                employee
            });
        } catch (error) {
            console.error('Error updating employee:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete employee
     * DELETE /employees/:id
     */
    static async deleteEmployee(req, res) {
        try {
            console.log('Delete employee request received:', {
                employeeId: req.params.id,
                userRole: req.user?.role,
                userId: req.user?._id
            });

            const result = await EmployeeService.deleteEmployee(req.params.id, req.user);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error deleting employee:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = EmployeeController;
