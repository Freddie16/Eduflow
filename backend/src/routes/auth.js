const express = require('express');
const { login, registerSchool, getMe, getSchoolBySubdomain } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login',            login);
router.post('/register-school',  registerSchool);
router.get('/me',                protect, getMe);
router.get('/school/:subdomain', getSchoolBySubdomain);

module.exports = router;
