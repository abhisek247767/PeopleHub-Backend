const Project = require('../models/Project');
const User = require('../models/userSchema');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');

class ProjectService {
    /**
     * Create new project
     * Only admin can create projects
     * @param {Object} projectData - Project data
     * @param {Object} createdBy - User creating the project (must be admin)
     * @returns {Object} Created project
     */
static async createProject(projectData, createdBy) {
        // Check if creator has admin privileges
    if (createdBy.role !== 'admin' && createdBy.role !== 'superadmin') {
        throw new Error('Access denied. Only admins can create projects.');
    }

    const { 
        projectName, 
        projectDescription, 
        deliveryManager, 
        manager, 
        lead, 
        developers,
        startDate,
        endDate,
        priority,
        budget
    } = projectData;

    try {
        // Clean and validate user IDs (same as before)
        const cleanUserId = (id) => {
            if (!id) return null;
            let cleanId;
            if (typeof id === 'object' && id._id) {
                cleanId = id._id.toString();
            } else {
                cleanId = id.toString().trim();
            }
            const match = cleanId.match(/(?:^['"]|:\s*['"])([a-f0-9]{24})['"]?$/);
            if (match) cleanId = match[1];
            if (!mongoose.Types.ObjectId.isValid(cleanId)) {
                throw new Error(`Invalid user ID: ${id}`);
            }
            return cleanId;
        };

        // Clean all IDs (duplicates allowed)
        const deliveryManagerId = cleanUserId(deliveryManager);
        const managerId = cleanUserId(manager);
        const leadId = cleanUserId(lead);
        const developerIds = developers?.map(cleanUserId).filter(Boolean) || [];

        // Combine all non-null IDs (duplicates allowed)
        const userIds = [
            deliveryManagerId, 
            managerId, 
            leadId, 
            ...developerIds
        ].filter(Boolean);

        // Validate user existence and roles (if any IDs provided)
        if (userIds.length > 0) {
            const users = await User.find({ 
                _id: { $in: userIds },
                role: { $in: ['employee', 'admin', 'superadmin', 'user'] }
            }).lean();

            const foundUserIds = users.map(user => user._id.toString());
            const missingUserIds = userIds.filter(id => !foundUserIds.includes(id));

            if (missingUserIds.length > 0) {
                throw new Error(
                    `Invalid or non-employee users: ${missingUserIds.join(', ')}`
                );
            }
        }

        // Check for duplicate project name (case-insensitive)
        const existingProject = await Project.findOne({ 
            projectName: { $regex: new RegExp(`^${projectName}$`, 'i') }
        });
        if (existingProject) {
            throw new Error('Project name already exists.');
        }

        // Create and save the project (duplicate IDs allowed)
        const project = new Project({
            projectName,
            projectDescription,
            deliveryManager: deliveryManagerId,
            manager: managerId,
            lead: leadId,
            developers: developerIds,
            startDate,
            endDate,
            priority: priority || 'medium',
            budget,
            createdBy: createdBy._id
        });

        await project.save();

            // Populate team member details
        await project.populate([
            { path: 'deliveryManagerDetails', select: 'username email' },
            { path: 'managerDetails', select: 'username email' },
            { path: 'leadDetails', select: 'username email' },
            { path: 'developerDetails', select: 'username email' },
            { path: 'createdByDetails', select: 'username email' }
        ]);

        return { 
            success: true, 
            message: 'Project created successfully', 
            project 
        };
    } catch (error) {
        throw new Error(`Project creation failed: ${error.message}`);
    }
}

    /**
     * Get project by ID with team details
     * @param {String} projectId - Project ID
     * @param {Object} requestedBy - User requesting the data
     * @returns {Object} Project with team details
     */
    static async getProjectById(projectId, requestedBy) {
        try {
            const project = await Project.findById(projectId)
                .populate([
                    { path: 'deliveryManagerDetails', select: 'username email' },
                    { path: 'managerDetails', select: 'username email' },
                    { path: 'leadDetails', select: 'username email' },
                    { path: 'developerDetails', select: 'username email' },
                    { path: 'createdByDetails', select: 'username email' }
                ]);

            if (!project) {
                throw new Error('Project not found');
            }

            // Check if user has access to view this project
            const isAdmin = requestedBy.role === 'admin' || requestedBy.role === 'superadmin';
            const isTeamMember = project.isTeamMember(requestedBy._id);

            if (!isAdmin && !isTeamMember) {
                throw new Error('Access denied. You are not a member of this project.');
            }

            return project;
        } catch (error) {
            throw new Error(`Failed to fetch project: ${error.message}`);
        }
    }

    /**
     * Get all projects with pagination and filters
     * @param {Number} page - Page number
     * @param {Number} limit - Items per page
     * @param {Object} filters - Filter criteria
     * @param {Object} requestedBy - User requesting the data
     * @returns {Object} Projects list with pagination
     */
    static async getAllProjects(page = 1, limit = 10, filters = {}, requestedBy) {
        try {
            const skip = (page - 1) * limit;
            
            // Build filter query
            let filterQuery = {};
            
            // If user is not admin, only show projects they're part of
            const isAdmin = requestedBy.role === 'admin' || requestedBy.role === 'superadmin';
            if (!isAdmin) {
                filterQuery.$or = [
                    { deliveryManager: requestedBy._id },
                    { manager: requestedBy._id },
                    { lead: requestedBy._id },
                    { developers: requestedBy._id }
                ];
            }

            // Apply additional filters
            if (filters.status) filterQuery.status = filters.status;
            if (filters.priority) filterQuery.priority = filters.priority;
            if (filters.manager) filterQuery.manager = filters.manager;
            if (filters.lead) filterQuery.lead = filters.lead;

            const projects = await Project.find(filterQuery)
                .populate([
                    { path: 'deliveryManagerDetails', select: 'username email' },
                    { path: 'managerDetails', select: 'username email' },
                    { path: 'leadDetails', select: 'username email' },
                    { path: 'developerDetails', select: 'username email' }
                ])
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Project.countDocuments(filterQuery);

            return {
                projects,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProjects: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            };
        } catch (error) {
            throw new Error(`Failed to fetch projects: ${error.message}`);
        }
    }

    /**
     * Update project
     * @param {String} projectId - Project ID
     * @param {Object} updateData - Data to update
     * @param {Object} updatedBy - User making the update
     * @returns {Object} Updated project
     */
    static async updateProject(projectId, updateData, updatedBy) {
        try {
            const project = await Project.findById(projectId);
            if (!project) {
                throw new Error('Project not found');
            }

            // Check permissions
            const isAdmin = updatedBy.role === 'admin' || updatedBy.role === 'superadmin';
            const isManager = project.manager.toString() === updatedBy._id.toString();
            const isDeliveryManager = project.deliveryManager.toString() === updatedBy._id.toString();

            if (!isAdmin && !isManager && !isDeliveryManager) {
                throw new Error('Access denied. Only admins, project managers, or delivery managers can update projects.');
            }

            // If updating team members, validate they exist and are employees
            // if (updateData.developers || updateData.manager || updateData.lead || updateData.deliveryManager) {
            //     const userIds = [];
            //     if (updateData.deliveryManager) userIds.push(updateData.deliveryManager);
            //     if (updateData.manager) userIds.push(updateData.manager);
            //     if (updateData.lead) userIds.push(updateData.lead);
            //     if (updateData.developers) userIds.push(...updateData.developers);

            //     const users = await User.find({ 
            //         _id: { $in: userIds },
            //         role: { $in: ['employee', 'admin', 'superadmin'] }
            //     });

            //     if (users.length !== userIds.length) {
            //         throw new Error('One or more assigned users do not exist or are not employees');
            //     }
            // }

            // Update project
            Object.assign(project, updateData);
            await project.save();

            // Populate team details
            await project.populate([
                { path: 'deliveryManagerDetails', select: 'username email' },
                { path: 'managerDetails', select: 'username email' },
                { path: 'leadDetails', select: 'username email' },
                { path: 'developerDetails', select: 'username email' }
            ]);

            return project;
        } catch (error) {
            throw new Error(`Failed to update project: ${error.message}`);
        }
    }

    /**
     * Delete project
     * @param {String} projectId - Project ID
     * @param {Object} deletedBy - User deleting the project (must be admin)
     * @returns {Object} Deletion result
     */
    static async deleteProject(projectId, deletedBy) {
        // Only admin can delete projects
        if (deletedBy.role !== 'admin' && deletedBy.role !== 'superadmin') {
            throw new Error('Access denied. Only admins can delete projects.');
        }

        try {
            const project = await Project.findById(projectId);
            if (!project) {
                throw new Error('Project not found');
            }

            // Check if project is in progress
            if (project.status === 'in-progress') {
                throw new Error('Cannot delete project that is currently in progress. Please change status first.');
            }

            await Project.findByIdAndDelete(projectId);

            return {
                success: true,
                message: 'Project deleted successfully'
            };
        } catch (error) {
            throw new Error(`Failed to delete project: ${error.message}`);
        }
    }

    /**
     * Get projects by user (projects where user is a team member)
     * @param {String} userId - User ID
     * @returns {Array} User's projects
     */
    static async getProjectsByUser(userId) {
        try {
            const projects = await Project.find({
                $or: [
                    { deliveryManager: userId },
                    { manager: userId },
                    { lead: userId },
                    { developers: userId }
                ]
            })
            .populate([
                { path: 'deliveryManagerDetails', select: 'username email' },
                { path: 'managerDetails', select: 'username email' },
                { path: 'leadDetails', select: 'username email' },
                { path: 'developerDetails', select: 'username email' }
            ])
            .sort({ createdAt: -1 });

            // Add user's role in each project
            const projectsWithRole = projects.map(project => {
                const projectObj = project.toJSON();
                projectObj.userRole = project.getUserRole(userId);
                return projectObj;
            });

            return projectsWithRole;
        } catch (error) {
            throw new Error(`Failed to fetch user projects: ${error.message}`);
        }
    }

    /**
     * Get all projects with employee hierarchy (tree structure)
     * @returns {Object} Tree-structured projects with team members
     */
static async getProjectsTree() {
    try {
        // Get all projects with populated team members
        const projects = await Project.find()
            .populate({
                path: 'deliveryManager',
                select: 'name email role employeeId'
            })
            .populate({
                path: 'manager',
                select: 'name email role employeeId'
            })
            .populate({
                path: 'lead',
                select: 'name email role employeeId'
            })
            .populate({
                path: 'developers',
                select: 'name email role employeeId'
            })
            .lean();

        // Transform into tree structure
        const projectsTree = projects.map(project => {
            const treeNode = {
                id: project._id.toString(),
                name: project.projectName,
                description: project.projectDescription,
                status: project.status,
                children: []
            };

            // Add delivery manager if exists
            if (project.deliveryManager) {
                treeNode.children.push({
                    id: `dm-${project._id}`,
                    name: 'Delivery Manager',
                    role: 'delivery_manager',
                    employee: {
                        id: project.deliveryManager._id,
                        name: project.deliveryManager.name,
                        email: project.deliveryManager.email,
                        employeeId: project.deliveryManager.employeeId
                    }
                });
            }

            // Add manager if exists
            if (project.manager) {
                treeNode.children.push({
                    id: `mgr-${project._id}`,
                    name: 'Project Manager',
                    role: 'manager',
                    employee: {
                        id: project.manager._id,
                        name: project.manager.name,
                        email: project.manager.email,
                        employeeId: project.manager.employeeId
                    }
                });
            }

            // Add lead if exists
            if (project.lead) {
                treeNode.children.push({
                    id: `lead-${project._id}`,
                    name: 'Team Lead',
                    role: 'lead',
                    employee: {
                        id: project.lead._id,
                        name: project.lead.name,
                        email: project.lead.email,
                        employeeId: project.lead.employeeId
                    }
                });
            }

            // Add developers if any
            if (project.developers && project.developers.length > 0) {
                const devGroup = {
                    id: `devs-${project._id}`,
                    name: 'Development Team',
                    role: 'team',
                    children: project.developers.map(dev => ({
                        id: dev._id.toString(),
                        name: dev.name,
                        email: dev.email,
                        role: 'developer',
                        employeeId: dev.employeeId
                    }))
                };
                treeNode.children.push(devGroup);
            }

            return treeNode;
        });

        return {
            success: true,
            count: projectsTree.length,
            data: projectsTree
        };
    } catch (error) {
        throw new Error(`Failed to generate projects tree: ${error.message}`);
    }
}
}

module.exports = ProjectService;
