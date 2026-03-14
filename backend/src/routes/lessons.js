const express = require('express');
const {
  getAllLessons,
  getLesson,
  createLesson,
  updateLesson,
  toggleComplete,
  deleteLesson,
} = require('../controllers/lessonController');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect, scopeToSchool);

router.route('/')
  .get(getAllLessons)
  .post(authorize('principal', 'deputy', 'teacher'), createLesson);

router.route('/:id')
  .get(getLesson)
  .put(authorize('principal', 'deputy', 'teacher'),    updateLesson)
  .delete(authorize('principal', 'deputy', 'teacher'), deleteLesson);

router.patch('/:id/complete', authorize('student'), toggleComplete);

module.exports = router;
