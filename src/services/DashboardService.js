const Employee = require("../models/Employee");
const Project = require("../models/Project");
const mongoose = require('mongoose');


class DashboardService {
    /**
     * Get dashboard statistics
     * @returns {Object} Dashboard metrics
     */
    static async getStats() {
        try {
            // Total projects
            const totalProjects = await Project.countDocuments();

            // Total employees
            const totalEmployees = await Employee.countDocuments();

            // Get all assigned user IDs from projects
            const projects = await Project.find({}, "deliveryManager manager lead developers");

            const assignedSet = new Set();
            projects.forEach(proj => {
                if (proj.deliveryManager) assignedSet.add(proj.deliveryManager.toString());
                if (proj.manager) assignedSet.add(proj.manager.toString());
                if (proj.lead) assignedSet.add(proj.lead.toString());
                if (proj.developers?.length) {
                    proj.developers.forEach(dev => assignedSet.add(dev.toString()));
                }
            });

            const assignedEmployees = assignedSet.size;
            const benchEmployees = totalEmployees - assignedEmployees;

            return {
                totalProjects,
                totalEmployees,
                assignedEmployees,
                benchEmployees,
            };
        } catch (error) {
            throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
        }
    }
}


module.exports = DashboardService;