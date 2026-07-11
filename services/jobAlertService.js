const User = require('../models/User');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

const checkJobAlerts = async () => {
  try {
    const users = await User.find({ 'alertPreferences.jobAlerts': true });
    
    for (const user of users) {
      const pref = user.alertPreferences || {};
      
      const query = {
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      };
      
      if (pref.categories?.length) query.category = { $in: pref.categories };
      if (pref.countries?.length) query.country = { $in: pref.countries };
      if (pref.salaryMin) query.salary = { $gte: pref.salaryMin };
      
      const newJobs = await Job.find(query);
      
      if (newJobs.length > 0) {
        await Notification.create({
          userId: user._id,
          type: 'job_alert',
          title: `${newJobs.length} new jobs matching your preferences!`,
          message: `Check out new opportunities in ${pref.categories?.join(', ') || 'your preferred categories'}`,
          data: { jobs: newJobs.map(j => j._id) }
        });
      }
    }
  } catch (err) {
    console.error('Job alert error:', err);
  }
};

module.exports = { checkJobAlerts };
