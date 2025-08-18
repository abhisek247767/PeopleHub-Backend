const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');
const { authenticate } = require('../middleware/authMiddleware');

// Project Routes

/**
 * @route POST /projects
 * @desc Create a new project (admin only)
 * @access Private (Admin only)
 */
router.post('/projects', authenticate(['admin', 'superadmin']), ProjectController.createProject);

/**
 * @route GET /projects
 * @desc Get all projects with pagination and filters
 * @access Private (All authenticated users)
 */
router.get('/projects', authenticate(), ProjectController.getAllProjects);

/**
 * @route GET /projects/tree
 * @desc Get all projects with employee hierarchy (tree structure)
 * @access Private (All authenticated users)
 * IMPORTANT: This route must come BEFORE /projects/:id
 */
router.get('/projects/tree', authenticate(), ProjectController.getProjectsTree);

/**
 * @route GET /projects/user/:userId
 * @desc Get projects by user ID (projects where user is a team member)
 * @access Private (All authenticated users)
 */
router.get('/projects/user/:userId', authenticate(), ProjectController.getProjectsByUser);

/**
 * @route GET /projects/:id
 * @desc Get project by ID
 * @access Private (All authenticated users)
 * IMPORTANT: This route must come AFTER specific routes like /projects/tree
 */
router.get('/projects/:id', authenticate(), ProjectController.getProjectById);

/**
 * @route PUT /projects/:id
 * @desc Update project data
 * @access Private (Admin, Project Manager, or Delivery Manager)
 */
router.put('/projects/:id', authenticate(), ProjectController.updateProject);

/**
 * @route DELETE /projects/:id
 * @desc Delete project (admin only)
 * @access Private (Admin only)
 */
router.delete('/projects/:id', authenticate(['admin', 'superadmin']), ProjectController.deleteProject);

module.exports = router;