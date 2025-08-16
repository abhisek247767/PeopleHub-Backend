// Export all services from a single file for easy importing
const EmployeeService = require('./EmployeeService');
const ProjectService = require('./ProjectService');
const DashboardService = require('./DashboardService');

module.exports = {
    EmployeeService,
    ProjectService,
    DashboardService
};
