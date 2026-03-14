const jwt = require('jsonwebtoken');
const School = require('../models/School');
const User = require('../models/User');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const buildUserPayload = (user) => ({
  id: user._id,
  schoolId: user.schoolId,
  role: user.role,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  avatarUrl: user.avatarUrl,
  isClassTeacher: user.isClassTeacher,
  assignedClass: user.assignedClass,
  parentId: user.parentId,
  studentIds: user.studentIds,
});

const buildSchoolPayload = (school) => ({
  id: school._id,
  name: school.name,
  subdomain: school.subdomain,
  settings: school.settings,
  subscriptionStatus: school.subscriptionStatus,
});

const sendTokenResponse = (user, school, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: buildUserPayload(user),
    school: buildSchoolPayload(school),
  });
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * @desc   Login — email + password + subdomain + role
 * @route  POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password, subdomain, role } = req.body;

    if (!email || !password || !subdomain || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, school subdomain, and role.',
      });
    }

    // Step 1 — Resolve tenant by subdomain
    const school = await School.findOne({ subdomain: subdomain.toLowerCase() });
    if (!school) {
      return res.status(401).json({
        success: false,
        message: 'School not found. Please check the subdomain.',
      });
    }

    if (school.subscriptionStatus === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'This school subscription is inactive. Contact support.',
      });
    }

    // Step 2 — Find user scoped to this school + selected role
    const user = await User.findOne({
      email: email.toLowerCase(),
      schoolId: school._id,
      role,
      isActive: true,
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No active account found with that email and role at this school.',
      });
    }

    // Step 3 — Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.',
      });
    }

    sendTokenResponse(user, school, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * @desc   Register a new school with an initial principal account
 * @route  POST /api/auth/register-school
 * @access Public
 */
exports.registerSchool = async (req, res) => {
  try {
    const { schoolName, subdomain, currency, timeZone, firstName, lastName, email, password } = req.body;

    if (!schoolName || !subdomain || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const exists = await School.findOne({ subdomain: subdomain.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'That subdomain is already taken.' });
    }

    const school = await School.create({
      name: schoolName,
      subdomain: subdomain.toLowerCase(),
      settings: { currency: currency || 'KES', timeZone: timeZone || 'Africa/Nairobi' },
      subscriptionStatus: 'trial',
    });

    const principal = await User.create({
      schoolId: school._id,
      role: 'principal',
      email,
      password,
      firstName,
      lastName,
    });

    sendTokenResponse(principal, school, 201, res);
  } catch (err) {
    console.error('Register school error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email or subdomain already in use.' });
    }
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * @desc   Get current logged-in user
 * @route  GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res) => {
  try {
    const school = await School.findById(req.user.schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }
    sendTokenResponse(req.user, school, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc   Look up school info by subdomain (used pre-login for school branding)
 * @route  GET /api/auth/school/:subdomain
 * @access Public
 */
exports.getSchoolBySubdomain = async (req, res) => {
  try {
    const school = await School.findOne({ subdomain: req.params.subdomain.toLowerCase() });
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }
    res.json({ success: true, school: buildSchoolPayload(school) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
