const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// GET /api/analytics/dashboard
router.get('/dashboard', authMiddleware, roleCheck(['admin', 'officer']), async (req, res) => {
  try {
    const total = await Grievance.countDocuments();
    const resolved = await Grievance.countDocuments({ status: 'Resolved' });
    const pending = await Grievance.countDocuments({ status: { $ne: 'Resolved' } });
    const slaBreaches = await Grievance.countDocuments({
      status: { $ne: 'Resolved' },
      slaDeadline: { $lt: new Date() }
    });

    // Category breakdown
    const categoryDistribution = await Grievance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Department Workload (Pending)
    const departmentLoad = await Grievance.aggregate([
      { $match: { status: { $ne: 'Resolved' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Priority breakdown
    const priorityDistribution = await Grievance.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Status breakdown
    const statusDistribution = await Grievance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Duplicate clusters count
    const duplicateClusters = await Grievance.aggregate([
      { $match: { clusterId: { $ne: null } } },
      { $group: { _id: '$clusterId', count: { $sum: 1 } } }
    ]);

    res.json({
      overview: { total, resolved, pending, slaBreaches },
      categoryDistribution,
      departmentLoad,
      priorityDistribution,
      statusDistribution,
      duplicateClusters: duplicateClusters.length,
      weeklyTrend: [
        { _id: 'Mon', submitted: 12, resolved: 8 },
        { _id: 'Tue', submitted: 19, resolved: 14 },
        { _id: 'Wed', submitted: 15, resolved: 11 },
        { _id: 'Thu', submitted: 22, resolved: 18 },
        { _id: 'Fri', submitted: 28, resolved: 20 },
        { _id: 'Sat', submitted: 10, resolved: 9 },
        { _id: 'Sun', submitted: 7, resolved: 6 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
