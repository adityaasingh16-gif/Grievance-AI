const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  citizenName: { type: String },
  title: { type: String, default: '' },
  rawText: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  language: { type: String, default: 'en' },
  category: { type: String, default: 'Uncategorized' },
  department: { type: String, default: 'General Administration' },
  subcategory: { type: String, default: null },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  priorityScore: { type: Number, default: 50 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  upvoteCount: { type: Number, default: 0, index: true },
  location: {
    text: { type: String, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  status: { 
    type: String, 
    enum: ['Submitted', 'Categorized', 'Assigned', 'InProgress', 'Resolved', 'Escalated'], 
    default: 'Submitted' 
  },
  embeddingId: { type: String, default: null },
  similarGrievanceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grievance' }],
  isDuplicate: { type: Boolean, default: false },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', default: null },
  clusterId: { type: String, default: null },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedOfficerName: { type: String, default: '' },
  slaDeadline: { type: Date },
  escalationLevel: { type: Number, default: 0 },
  aiExplanation: {
    keywords: [{ type: String }],
    confidence: { type: Number, default: 0.8 },
    similarityScore: { type: Number, default: 0 },
    classificationMethod: { type: String, default: 'Multilingual-E5 / Rule Hybrid' }
  },
  aiSummary: { type: String, default: '' },
  resolutionText: { type: String, default: '' },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Grievance', grievanceSchema);
