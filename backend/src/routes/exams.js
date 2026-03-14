const express = require('express');
const {
  getAllExams,
  createExam,
  deleteExam,
  getAllResults,
  createResult,
  updateResult,
} = require('../controllers/examController');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect, scopeToSchool);

// ── Exams ─────────────────────────────────────────────────────────────────────
router.route('/')
  .get(getAllExams)
  .post(authorize('principal', 'deputy', 'teacher'), createExam);

router.delete('/:id', authorize('principal', 'deputy', 'teacher'), deleteExam);

// ── Results ───────────────────────────────────────────────────────────────────
// NOTE: /results routes must be declared BEFORE /:id to avoid route conflicts
router.route('/results')
  .get(getAllResults)
  .post(authorize('principal', 'deputy', 'teacher'), createResult);

router.put('/results/:id', authorize('principal', 'deputy', 'teacher'), updateResult);

module.exports = router;
