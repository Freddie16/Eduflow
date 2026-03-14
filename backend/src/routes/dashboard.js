const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect, scopeToSchool);

router.get('/', getDashboardStats);

module.exports = router;
