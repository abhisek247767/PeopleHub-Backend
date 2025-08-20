const { ProjectService } = require('../services');

class ProjectController {
    /**
     * Create a new project
     * POST /projects
     */
    static async createProject(req, res) {
        try {
            const result = await ProjectService.createProject(req.body, req.user);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating project:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get all projects with pagination and filters
     * GET /projects
     */
    static async getAllProjects(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                status: req.query.status,
                priority: req.query.priority,
                manager: req.query.manager,
                lead: req.query.lead
            };

            // Remove undefined filters
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });

            const result = await ProjectService.getAllProjects(page, limit, filters, req.user);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching projects:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get project by ID
     * GET /projects/:id
     */
    static async getProjectById(req, res) {
        try {
            const project = await ProjectService.getProjectById(req.params.id, req.user);
            res.status(200).json(project);
        } catch (error) {
            console.error('Error fetching project:', error);
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update project
     * PUT /projects/:id
     */
    static async updateProject(req, res) {
        try {
            const project = await ProjectService.updateProject(
                req.params.id,
                req.body,
                req.user
            );
            res.status(200).json({
                success: true,
                message: 'Project updated successfully',
                project
            });
        } catch (error) {
            console.error('Error updating project:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete project
     * DELETE /projects/:id
     */
    static async deleteProject(req, res) {
        try {
            const result = await ProjectService.deleteProject(req.params.id, req.user);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error deleting project:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get projects by user ID
     * GET /projects/user/:userId
     */
    static async getProjectsByUser(req, res) {
        try {
            const projects = await ProjectService.getProjectsByUser(req.params.userId);
            res.status(200).json(projects);
        } catch (error) {
            console.error('Error fetching user projects:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get all projects with employee hierarchy (tree structure)
     * GET /projects/tree
     */
    static async getProjectsTree(req, res) {
        try {
            const projects = await ProjectService.getProjectsTree();
            res.status(200).json(projects);
        } catch (error) {
            console.error('Error fetching projects tree:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = ProjectController;
