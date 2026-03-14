const express = require('express');
const {
  getAttendance,
  saveBulkAttendance,
  getAttendanceSummary,
} = require('../controllers/attendanceController');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect, scopeToSchool);

router.get('/',                getAttendance);
router.post('/bulk',           authorize('principal', 'deputy', 'teacher'), saveBulkAttendance);
router.get('/summary/:classId', getAttendanceSummary);

module.exports = router;
