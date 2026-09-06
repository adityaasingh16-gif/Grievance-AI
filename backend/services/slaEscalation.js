const cron = require('node-cron');
const Grievance = require('../models/Grievance');

const checkSLAandEscalate = async () => {
  try {
    const now = new Date();
    // Find un-resolved grievances past deadline that haven't been escalated to level 2 yet
    const breachedGrievances = await Grievance.find({
      status: { $ne: 'Resolved' },
      slaDeadline: { $lt: now }
    });

    if (breachedGrievances.length === 0) {
      return;
    }

    console.log(`[SLA Cron] Found ${breachedGrievances.length} breached grievances.`);

    for (const g of breachedGrievances) {
      g.escalationLevel += 1;
      g.status = 'Escalated';
      // Bump priority if not already critical
      if (g.priority === 'Low') g.priority = 'Medium';
      else if (g.priority === 'Medium') g.priority = 'High';
      else if (g.priority === 'High') g.priority = 'Critical';
      
      await g.save();
      console.log(`[SLA Escalated] Grievance ID: ${g._id} escalated to Level ${g.escalationLevel}, priority set to ${g.priority}`);
    }
  } catch (err) {
    console.error('[SLA Cron Error]:', err);
  }
};

const startSLACron = () => {
  // Check every 10 minutes (or every minute in dev)
  cron.schedule('*/10 * * * *', () => {
    console.log('[SLA Cron] Running SLA breach evaluation job...');
    checkSLAandEscalate();
  });
};

module.exports = { startSLACron, checkSLAandEscalate };
