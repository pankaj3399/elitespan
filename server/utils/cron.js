const cron = require('node-cron');
const { sendDailyWaitlist } = require('../controllers/waitlistController');

// Schedule to run every day at midnight (00:00)
cron.schedule('0 0 * * *', () => {
  console.log('Running daily waitlist cron job');
  sendDailyWaitlist();
});