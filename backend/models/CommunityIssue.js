const mongoose = require('mongoose');

const communityIssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Roads', 'Sanitation', 'Electricity', 'Public Safety', 'Water Supply', 'Healthcare', 'Education', 'Other'],
    default: 'Other'
  },
  imageUrl: {
    type: String,
    default: null
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvoteCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Open', 'InProgress', 'Resolved'],
    default: 'Open'
  },
  location: {
    text: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  aiSuggestedDuplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityIssue',
    default: null
  }
}, { timestamps: true });

communityIssueSchema.index({ upvoteCount: -1, createdAt: -1 });

module.exports = mongoose.model('CommunityIssue', communityIssueSchema);
