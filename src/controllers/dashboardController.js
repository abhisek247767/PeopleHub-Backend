const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Project = require("../models/Project");


const getAllStats = async (req, res) => {
    try {
        // Total projects
        const totalProjects = await Project.countDocuments();

        // Total employees
        const totalEmployees = await Employee.countDocuments();

        // Get all assigned user IDs from projects
        const projects = await Project.find({}, 'deliveryManager manager lead developers');

        const assignedSet = new Set();
        projects.forEach(proj => {
            if (proj.deliveryManager) assignedSet.add(proj.deliveryManager.toString());
            if (proj.manager) assignedSet.add(proj.manager.toString());
            if (proj.lead) assignedSet.add(proj.lead.toString());
            if (proj.developers && proj.developers.length > 0) {
                proj.developers.forEach(dev => assignedSet.add(dev.toString()));
            }
        });

        const assignedEmployees = assignedSet.size;
        const benchEmployees = totalEmployees - assignedEmployees;

        res.status(200).json({
            totalProjects,
            totalEmployees,
            assignedEmployees,
            benchEmployees
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getAllStats };
