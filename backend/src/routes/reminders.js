const express = require('express');
const {
  getReminders,
  createReminder,
  markAsRead,
  deleteReminder,
} = require('../controllers/reminderController');
const { protect, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect, scopeToSchool);

router.route('/')
  .get(getReminders)
  .post(createReminder);

router.patch('/:id/read', markAsRead);
router.delete('/:id',     deleteReminder);

module.exports = router;
