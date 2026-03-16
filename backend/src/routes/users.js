const express = require('express');
const {
  getAllUsers,
  getStudents,
  getTeachers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  linkParentStudent,
  unlinkParentStudent,
} = require('../controllers/userController');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect, scopeToSchool);

router.route('/')
  .get(authorize('principal', 'deputy', 'teacher'), getAllUsers)
  .post(authorize('principal', 'deputy'),           createUser);

router.get('/students', authorize('principal', 'deputy', 'teacher'), getStudents);
router.get('/teachers', authorize('principal', 'deputy'),            getTeachers);
router.post('/link',    authorize('principal', 'deputy'),            linkParentStudent);
router.post('/unlink',  authorize('principal', 'deputy'),            unlinkParentStudent);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('principal'), deleteUser);

module.exports = router;