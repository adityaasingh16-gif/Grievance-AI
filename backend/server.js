const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const { startSLACron } = require('./services/slaEscalation');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Database connection with automatic in-memory fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grievance_db';

async function startDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB server at:', MONGODB_URI);
  } catch (err) {
    console.log('⚠️ Local MongoDB server not found on 27017.');
    console.log('🚀 Starting automatic in-memory MongoDB instance via mongodb-memory-server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: { port: 27017, dbName: 'grievance_db' }
      });
      const uri = mongod.getUri();
      console.log(`✅ In-Memory MongoDB running at: ${uri}`);
      await mongoose.connect(uri);
    } catch (memErr) {
      console.error('❌ Could not start in-memory MongoDB:', memErr.message);
    }
  }
}

startDatabase();

const path = require('path');

// Static folder for uploaded issue images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/grievances', require('./routes/grievances'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/rag', require('./routes/rag'));
app.use('/api/directory', require('./routes/directory'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/gov-services', require('./routes/govServices'));

// Root status route
app.get('/', (req, res) => res.json({ message: 'GrievanceAI Backend API Operational', status: 'ok', health: '/health' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'backend' }));


// Global Error Handler
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GrievanceAI Backend running on port ${PORT}`);
  startSLACron();
});

