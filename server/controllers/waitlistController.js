const Waitlist = require('../models/Waitlist');
const { sendEmail } = require('../config/email');

// Join waitlist
const joinWaitlist = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email already exists
    const existing = await Waitlist.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in waitlist' });
    }

    const waitlistEntry = new Waitlist({ email });
    await waitlistEntry.save();
    res.status(201).json({ message: 'Joined waitlist successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// For cron job: Get unsent waitlist users from today and send email
const sendDailyWaitlist = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const waitlistUsers = await Waitlist.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      sent: false,
    });

    if (waitlistUsers.length === 0) {
      console.log('No new waitlist users today');
      return;
    }

    const emailList = waitlistUsers.map((user) => user.email).join('\n');
    const subject = 'Daily Waitlist Summary';
    const text = `Today’s waitlist registrations:\n\n${emailList}`;

    await sendEmail(process.env.WAITLIST_EMAIL, subject, text);

    // Mark users as sent
    await Waitlist.updateMany(
      { _id: { $in: waitlistUsers.map((user) => user._id) } },
      { sent: true }
    );
    console.log('Daily waitlist email sent');
  } catch (error) {
    console.error('Error in daily waitlist cron:', error);
  }
};

module.exports = { joinWaitlist, sendDailyWaitlist };