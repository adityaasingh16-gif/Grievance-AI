const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityIssue',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Compound unique index to enforce exactly one vote per user per issue
voteSchema.index({ issueId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
