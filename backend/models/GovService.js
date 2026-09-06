const mongoose = require('mongoose');

const govServiceSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'Police & Emergency',
      'Healthcare & Hospitals',
      'Fire & Disaster Response',
      'Cyber Crime Helpline',
      'Municipal & Utility Services',
      'Other'
    ]
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'General'
  },
  available: {
    type: String,
    default: '24x7'
  },
  city: {
    type: String,
    default: 'All-India'
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('GovService', govServiceSchema);
