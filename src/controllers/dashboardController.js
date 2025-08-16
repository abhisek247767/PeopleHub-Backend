const { DashboardService } = require("../services");

class DashboardController {
    /**
     * Get dashboard statistics
     * GET /dashboard/stats
     */
    static async getAllStats(req, res) {
        try {
            const stats = await DashboardService.getStats();
            res.status(200).json(stats);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = DashboardController;