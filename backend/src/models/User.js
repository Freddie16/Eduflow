const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  role: {
    type: String,
    enum: ['principal', 'deputy', 'teacher', 'student', 'parent'],
    required: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  avatarUrl: { type: String },
  isClassTeacher: { type: Boolean, default: false },
  assignedClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null,
  },
  // For students: reference to their parent
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // For parents: list of their children
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Compound unique index: email must be unique per school
userSchema.index({ email: 1, schoolId: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
