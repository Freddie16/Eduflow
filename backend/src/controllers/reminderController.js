const Reminder = require('../models/Reminder');

/**
 * @desc   Get all reminders for the current user
 * @route  GET /api/reminders
 * @access Private
 */
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      userId: req.user._id,
      schoolId: req.schoolId,
    }).sort({ date: -1 });

    res.json({ success: true, count: reminders.length, data: reminders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Create a reminder (optionally for another user — admin only)
 * @route  POST /api/reminders
 * @access Private
 */
exports.createReminder = async (req, res) => {
  try {
    const { title, description, date, type, targetUserId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'title and description are required.' });
    }

    // Principal/deputy can create reminders for other users via targetUserId
    const userId = targetUserId && ['principal', 'deputy'].includes(req.user.role)
      ? targetUserId
      : req.user._id;

    const reminder = await Reminder.create({
      userId,
      schoolId: req.schoolId,
      title,
      description,
      date: date || new Date(),
      type: type || 'general',
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Mark a reminder as read
 * @route  PATCH /api/reminders/:id/read
 * @access Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found.' });
    }

    res.json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a reminder
 * @route  DELETE /api/reminders/:id
 * @access Private
 */
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found.' });
    }

    res.json({ success: true, message: 'Reminder deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
