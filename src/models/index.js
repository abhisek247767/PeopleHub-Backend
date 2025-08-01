// Export all models from a single file for easy importing
const User = require('./userSchema');
const Employee = require('./Employee');
const Project = require('./Project');

module.exports = {
    User,
    Employee,
    Project
};
