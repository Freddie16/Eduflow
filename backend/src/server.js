require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('../config/database');

const app = express();

// Connect to MongoDB
connectDB();

// ── CORS must be first — before helmet, before everything ─────────────────────
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};

app.use(cors(corsOptions));

// Explicitly handle preflight for every route
app.options('*', cors(corsOptions));

// ── Other middleware ───────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, require('./routes/auth'));
app.use('/api/users',                   require('./routes/users'));
app.use('/api/classes',                 require('./routes/classes'));
app.use('/api/lessons',                 require('./routes/lessons'));
app.use('/api/exams',                   require('./routes/exams'));
app.use('/api/attendance',              require('./routes/attendance'));
app.use('/api/finance',                 require('./routes/finance'));
app.use('/api/reminders',               require('./routes/reminders'));
app.use('/api/dashboard',               require('./routes/dashboard'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EduFlow API is running', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 EduFlow API running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT expires in: ${process.env.JWT_EXPIRES_IN || '7d'}\n`);
});

module.exports = app;