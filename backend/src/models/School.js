const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
  },
  subdomain: {
    type: String,
    required: [true, 'Subdomain is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
  },
  settings: {
    currency: { type: String, default: 'KES' },
    timeZone: { type: String, default: 'Africa/Nairobi' },
    logoUrl: { type: String },
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'trial'],
    default: 'trial',
  },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);
