const express = require('express');
const {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
} = require('../controllers/classController');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect, scopeToSchool);

router.route('/')
  .get(getAllClasses)
  .post(authorize('principal', 'deputy'), createClass);

router.route('/:id')
  .put(authorize('principal', 'deputy', 'teacher'),  updateClass)
  .delete(authorize('principal'),                     deleteClass);

router.get('/:id/students', getClassStudents);

module.exports = router;
