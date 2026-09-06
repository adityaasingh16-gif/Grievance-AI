const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// POST /api/rag/query
router.post('/query', authMiddleware, roleCheck(['officer', 'admin']), async (req, res) => {
  try {
    const { question, department } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const response = await axios.post(`${ML_SERVICE_URL}/rag-query`, {
      question,
      department: department || req.user.department || null
    });

    res.json(response.data);
  } catch (err) {
    console.error('RAG Query Error:', err.message);
    res.status(500).json({
      answer: "Failed to connect to AI assistant engine. Please verify Python ML service status.",
      sources: [],
      confidence: 0
    });
  }
});

module.exports = router;
