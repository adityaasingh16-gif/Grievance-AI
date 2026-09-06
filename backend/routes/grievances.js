const express = require('express');
const router = express.Router();
const axios = require('axios');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
const Department = require('../models/Department');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const SLA_HOURS = {
  'Critical': 24,
  'High': 72,
  'Medium': 168,
  'Low': 360
};

// GET /api/grievances/community - Public community feed sorted by upvoteCount (highest first)
router.get('/community', authMiddleware, async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { rawText: { $regex: search, $options: 'i' } },
        { 'location.text': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOption = sort === 'newest' ? { createdAt: -1 } : { upvoteCount: -1, createdAt: -1 };

    const grievances = await Grievance.find(filter)
      .sort(sortOption)
      .populate('citizenId', 'name');

    // Add hasUpvoted flag for requesting user
    const results = grievances.map(g => {
      const gObj = g.toObject();
      gObj.hasUpvoted = req.user ? g.upvotes.some(id => id.toString() === req.user._id.toString()) : false;
      return gObj;
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/grievances/:id/upvote - Upvote or toggle upvote (restricted to 1 vote per user)
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance issue not found' });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = grievance.upvotes.findIndex(id => id.toString() === userIdStr);

    let hasUpvoted = false;
    if (existingIndex > -1) {
      // Remove upvote
      grievance.upvotes.splice(existingIndex, 1);
      hasUpvoted = false;
    } else {
      // Add upvote
      grievance.upvotes.push(req.user._id);
      hasUpvoted = true;
    }

    grievance.upvoteCount = grievance.upvotes.length;

    // Dynamically adjust priority if upvotes reach high counts
    if (grievance.upvoteCount > 25 && grievance.priority !== 'Critical') {
      grievance.priority = 'Critical';
    } else if (grievance.upvoteCount > 10 && grievance.priority === 'Low') {
      grievance.priority = 'High';
    }

    await grievance.save();

    res.json({
      message: hasUpvoted ? 'Upvoted successfully' : 'Upvote removed',
      upvoteCount: grievance.upvoteCount,
      hasUpvoted,
      priority: grievance.priority
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/grievances - Submit a new complaint
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, rawText, locationText, imageUrl } = req.body;
    if (!rawText || rawText.trim().length < 10) {
      return res.status(400).json({ error: 'Complaint text must be at least 10 characters long' });
    }

    let classification = { category: 'Water Supply', department: 'Water Supply', subcategory: 'Pipeline Leakage', confidence: 0.85, keywords: ['water'], language: 'en' };
    let priorityInfo = { priority: 'Medium', score: 50, reasoning: 'Standard priority' };
    let entities = { location: locationText || null, affectedCount: null, duration: null };
    let similarInfo = { similarIds: [], clusterId: null, isDuplicate: false, parentId: null };
    let summaryText = '';

    try {
      const [classRes, prioRes, entRes, simRes, sumRes] = await Promise.allSettled([
        axios.post(`${ML_SERVICE_URL}/classify`, { text: rawText }),
        axios.post(`${ML_SERVICE_URL}/priority-score`, { text: rawText }),
        axios.post(`${ML_SERVICE_URL}/extract-entities`, { text: rawText }),
        axios.post(`${ML_SERVICE_URL}/find-similar`, { text: rawText, topK: 5 }),
        axios.post(`${ML_SERVICE_URL}/summarize`, { text: rawText })
      ]);

      if (classRes.status === 'fulfilled') classification = classRes.value.data;
      if (prioRes.status === 'fulfilled') priorityInfo = prioRes.value.data;
      if (entRes.status === 'fulfilled') entities = entRes.value.data;
      if (simRes.status === 'fulfilled') similarInfo = simRes.value.data;
      if (sumRes.status === 'fulfilled') summaryText = sumRes.value.data.summary;
    } catch (mlErr) {
      console.warn('ML Service fallback:', mlErr.message);
    }

    const slaHours = SLA_HOURS[priorityInfo.priority] || 72;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    let assignedOfficer = await User.findOne({ 
      role: 'officer', 
      department: classification.department 
    });

    if (!assignedOfficer) {
      assignedOfficer = await User.findOne({ role: 'officer' });
    }

    const grievance = new Grievance({
      citizenId: req.user._id,
      citizenName: req.user.name,
      title: title || rawText.slice(0, 50) + '...',
      rawText,
      imageUrl: imageUrl || '',
      language: classification.language || 'en',
      category: classification.category,
      department: classification.department,
      subcategory: classification.subcategory,
      priority: priorityInfo.priority,
      priorityScore: priorityInfo.score,
      upvotes: [req.user._id], // Creator automatically upvotes their issue
      upvoteCount: 1,
      location: {
        text: locationText || entities.location || ''
      },
      status: assignedOfficer ? 'Assigned' : 'Categorized',
      assignedOfficerId: assignedOfficer ? assignedOfficer._id : null,
      assignedOfficerName: assignedOfficer ? assignedOfficer.name : '',
      slaDeadline,
      aiExplanation: {
        keywords: classification.keywords || [],
        confidence: classification.confidence || 0.85,
        classificationMethod: 'Multilingual Sentence-Transformers'
      },
      aiSummary: summaryText || rawText.slice(0, 150) + '...',
      isDuplicate: similarInfo.isDuplicate || false,
      clusterId: similarInfo.clusterId || null,
      parentId: similarInfo.parentId || null
    });

    await grievance.save();

    res.status(201).json({
      message: 'Grievance submitted and processed successfully',
      grievance
    });
  } catch (err) {
    console.error('Submission Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/grievances/my - Citizen's submitted grievances
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const grievances = await Grievance.find({ citizenId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('similarGrievanceIds', 'rawText status createdAt');
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/grievances/assigned - Officer's assigned grievances with filtering
router.get('/assigned', authMiddleware, roleCheck(['officer', 'admin']), async (req, res) => {
  try {
    const { status, priority, department } = req.query;
    const filter = {};

    if (req.user.role === 'officer' && req.user.department) {
      filter.department = req.user.department;
    } else if (department) {
      filter.department = department;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const grievances = await Grievance.find(filter).sort({ upvoteCount: -1, createdAt: -1 });
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/grievances/:id - Grievance details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('citizenId', 'name email phone')
      .populate('assignedOfficerId', 'name email')
      .populate('similarGrievanceIds', 'rawText status priority createdAt');

    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const gObj = grievance.toObject();
    gObj.hasUpvoted = req.user ? grievance.upvotes.some(id => id.toString() === req.user._id.toString()) : false;

    res.json(gObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/grievances/:id/resolve - Mark grievance as resolved
router.put('/:id/resolve', authMiddleware, roleCheck(['officer', 'admin']), async (req, res) => {
  try {
    const { resolutionText } = req.body;
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    grievance.status = 'Resolved';
    grievance.resolutionText = resolutionText || 'Resolved by department official';
    grievance.resolvedAt = new Date();
    await grievance.save();

    res.json({ message: 'Grievance resolved successfully', grievance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
