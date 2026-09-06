const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/auth'); // optional auth check
const CommunityIssue = require('../models/CommunityIssue');
const Vote = require('../models/Vote');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'issue-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware to extract user from optional JWT header without throwing on missing token
const softAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    req.user = decoded;
  } catch (e) {
    req.user = null;
  }
  next();
};

// GET /api/issues - Public paginated feed with vote sort
router.get('/', softAuth, async (req, res, next) => {
  try {
    const { category, search, sort = 'votes', page = 1, limit = 20 } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'location.text': { $regex: q, $options: 'i' } }
      ];
    }

    let sortOption = { upvoteCount: -1, createdAt: -1 };
    if (sort === 'new') {
      sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CommunityIssue.countDocuments(query);
    const issues = await CommunityIssue.find(query)
      .populate('reportedBy', 'name role')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Determine vote status for current user if logged in
    let userVotedIssueIds = new Set();
    if (req.user && req.user.id) {
      const issueIds = issues.map(i => i._id);
      const userVotes = await Vote.find({
        userId: req.user.id,
        issueId: { $in: issueIds }
      });
      userVotedIssueIds = new Set(userVotes.map(v => v.issueId.toString()));
    }

    const formattedIssues = issues.map(issue => ({
      _id: issue._id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      imageUrl: issue.imageUrl,
      reportedBy: issue.reportedBy ? issue.reportedBy.name : 'Anonymous Citizen',
      upvoteCount: issue.upvoteCount,
      status: issue.status,
      location: issue.location,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      hasVoted: userVotedIssueIds.has(issue._id.toString())
    }));

    res.json({
      issues: formattedIssues,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/issues/:id - Single issue detail
router.get('/:id', softAuth, async (req, res, next) => {
  try {
    const issue = await CommunityIssue.findById(req.params.id).populate('reportedBy', 'name role');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    let hasVoted = false;
    if (req.user && req.user.id) {
      const vote = await Vote.findOne({ issueId: issue._id, userId: req.user.id });
      hasVoted = !!vote;
    }

    res.json({
      ...issue.toObject(),
      reportedBy: issue.reportedBy ? issue.reportedBy.name : 'Anonymous Citizen',
      hasVoted
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/issues - Create issue (Auth required)
router.post('/', auth, upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, category, locationText, lat, lng } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const newIssue = new CommunityIssue({
      title,
      description,
      category: category || 'Other',
      imageUrl,
      reportedBy: req.user.id,
      upvoteCount: 0,
      status: 'Open',
      location: {
        text: locationText || '',
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null
      }
    });

    await newIssue.save();
    res.status(201).json(newIssue);
  } catch (err) {
    next(err);
  }
});

// POST /api/issues/:id/vote - Toggle upvote (Auth required)
router.post('/:id/vote', auth, async (req, res, next) => {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;

    const issue = await CommunityIssue.findById(issueId);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const existingVote = await Vote.findOne({ issueId, userId });

    let hasVoted = false;
    if (existingVote) {
      // Toggle off: remove vote & decrement
      await Vote.deleteOne({ _id: existingVote._id });
      issue.upvoteCount = Math.max(0, issue.upvoteCount - 1);
      hasVoted = false;
    } else {
      // Toggle on: add vote & increment
      try {
        await Vote.create({ issueId, userId });
        issue.upvoteCount += 1;
        hasVoted = true;
      } catch (voteErr) {
        // Handle race condition / duplicate index key error smoothly
        if (voteErr.code === 11000) {
          hasVoted = true;
        } else {
          throw voteErr;
        }
      }
    }

    await issue.save();

    res.json({
      issueId: issue._id,
      upvoteCount: issue.upvoteCount,
      hasVoted
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/issues/:id/vote-status - Check if user has voted
router.get('/:id/vote-status', auth, async (req, res, next) => {
  try {
    const vote = await Vote.findOne({ issueId: req.params.id, userId: req.user.id });
    res.json({ hasVoted: !!vote });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
