const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Category = require('./models/Category');
const Grievance = require('./models/Grievance');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grievance_db';

const departmentsData = [
  { name: 'Water Supply', slaHours: 48, description: 'Handles drinking water supply, pipeline leaks, dirty water quality' },
  { name: 'Electricity', slaHours: 24, description: 'Manages power outages, transformers, billing errors' },
  { name: 'Roads & Infrastructure', slaHours: 72, description: 'Fixes potholes, streetlights, drainage overflow' },
  { name: 'Sanitation', slaHours: 24, description: 'Garbage collection, illegal dumping, public hygiene' },
  { name: 'Public Transport', slaHours: 48, description: 'Buses, metro routes, overcrowding, fare issues' },
  { name: 'Healthcare', slaHours: 24, description: 'Hospitals, staff shortages, medicine availability' },
  { name: 'Education', slaHours: 72, description: 'School buildings, teacher attendance, mid-day meals' },
  { name: 'Corruption & Misconduct', slaHours: 24, description: 'Bribe demands, nepotism, misuse of official funds' }
];

const categoriesData = [
  {
    name: 'Water Supply',
    department: 'Water Supply',
    subcategories: [
      { name: 'Pipeline Leakage', keywords: ['leak', 'burst', 'pipe', 'pani'] },
      { name: 'No Water Supply', keywords: ['no water', 'dry', 'cut', 'supply'] },
      { name: 'Water Quality', keywords: ['dirty', 'smell', 'color', 'contaminated'] }
    ]
  },
  {
    name: 'Electricity',
    department: 'Electricity',
    subcategories: [
      { name: 'Frequent Cuts', keywords: ['power cut', 'outage', 'light', 'bijli'] },
      { name: 'Transformer Issue', keywords: ['transformer', 'fire', 'spark', 'blast'] },
      { name: 'Billing Dispute', keywords: ['bill', 'meter', 'overcharge'] }
    ]
  },
  {
    name: 'Roads & Infrastructure',
    department: 'Roads & Infrastructure',
    subcategories: [
      { name: 'Potholes', keywords: ['pothole', 'road', 'sadak', 'crater'] },
      { name: 'Street Lights', keywords: ['dark', 'street light', 'lamp'] },
      { name: 'Drainage', keywords: ['drain', 'overflow', 'sewer'] }
    ]
  },
  {
    name: 'Sanitation',
    department: 'Sanitation',
    subcategories: [
      { name: 'Missed Collection', keywords: ['kachra', 'garbage', 'waste'] },
      { name: 'Illegal Dumping', keywords: ['dumping', 'litter', 'dirty'] }
    ]
  }
];

async function connectDatabase() {
  try {
    console.log('Attempting MongoDB connection to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB server.');
  } catch (err) {
    console.log('⚠️ Local MongoDB server not found on 27017.');
    console.log('🚀 Automatically starting an in-memory MongoDB instance via mongodb-memory-server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: { port: 27017, dbName: 'grievance_db' }
      });
      const uri = mongod.getUri();
      console.log(`✅ In-Memory MongoDB running at: ${uri}`);
      await mongoose.connect(uri);
    } catch (memErr) {
      console.error('❌ Failed to start auto in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
}

async function seed() {
  try {
    await connectDatabase();

    await User.deleteMany({});
    await Department.deleteMany({});
    await Category.deleteMany({});
    await Grievance.deleteMany({});

    console.log('Cleared existing collection data.');

    await Department.insertMany(departmentsData);
    await Category.insertMany(categoriesData);
    console.log('Departments & Categories seeded.');

    const passwordHash = await bcrypt.hash('admin123', 10);
    const officerPass = await bcrypt.hash('officer123', 10);
    const citizenPass = await bcrypt.hash('citizen123', 10);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@grievance.ai',
      passwordHash,
      role: 'admin'
    });

    const waterOfficer = await User.create({
      name: 'Rakesh Sharma (Water Officer)',
      email: 'water@grievance.ai',
      passwordHash: officerPass,
      role: 'officer',
      department: 'Water Supply'
    });

    const electricityOfficer = await User.create({
      name: 'Anil Kumar (Electricity Officer)',
      email: 'electricity@grievance.ai',
      passwordHash: officerPass,
      role: 'officer',
      department: 'Electricity'
    });

    const citizen = await User.create({
      name: 'Priya Verma',
      email: 'citizen@grievance.ai',
      passwordHash: citizenPass,
      role: 'citizen',
      phone: '+91 9876543210'
    });

    console.log('\n=============================================');
    console.log('🎉 DEMO ACCOUNTS CREATED SUCCESSFULLY:');
    console.log(' - Admin:     admin@grievance.ai / admin123');
    console.log(' - Officer:   water@grievance.ai / officer123');
    console.log(' - Citizen:   citizen@grievance.ai / citizen123');
    console.log('=============================================\n');

    // Create initial sample grievances with titles, upvotes and image placeholders
    await Grievance.create([
      {
        citizenId: citizen._id,
        citizenName: citizen.name,
        title: 'Critical Water Pipeline Burst in Sector 12',
        rawText: 'There is a major water pipeline burst near Sector 12 Main Road. Clean drinking water is flowing on the road for the last 2 days and 50 households have no supply.',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=600&q=80',
        language: 'en',
        category: 'Water Supply',
        department: 'Water Supply',
        subcategory: 'Pipeline Leakage',
        priority: 'Critical',
        priorityScore: 95,
        upvotes: [citizen._id, admin._id, waterOfficer._id],
        upvoteCount: 38,
        location: { text: 'Sector 12 Main Road, Dwarka, New Delhi' },
        status: 'Assigned',
        assignedOfficerId: waterOfficer._id,
        assignedOfficerName: waterOfficer.name,
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        aiExplanation: {
          keywords: ['water', 'pipeline', 'burst', 'supply'],
          confidence: 0.94,
          classificationMethod: 'SentenceTransformers + Rule hybrid'
        },
        aiSummary: 'Major water pipeline burst in Sector 12 impacting 50 households.'
      },
      {
        citizenId: citizen._id,
        citizenName: citizen.name,
        title: 'Smoking Transformer & Power Cut in Sector 4',
        rawText: 'Bijli pichle 6 ghante se nahi aa rahi hai Sector 4 me. Transformer se dhua nikal raha hai emergency help chahiye.',
        imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
        language: 'hinglish',
        category: 'Electricity',
        department: 'Electricity',
        subcategory: 'Transformer Issue',
        priority: 'Critical',
        priorityScore: 92,
        upvotes: [citizen._id, electricityOfficer._id],
        upvoteCount: 24,
        location: { text: 'Sector 4, Rohini, New Delhi' },
        status: 'Assigned',
        assignedOfficerId: electricityOfficer._id,
        assignedOfficerName: electricityOfficer.name,
        slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
        aiExplanation: {
          keywords: ['bijli', 'transformer', 'dhua', 'emergency'],
          confidence: 0.96,
          classificationMethod: 'Multilingual E5 Classifier'
        },
        aiSummary: 'Frequent power outage and smoking transformer in Sector 4.'
      },
      {
        citizenId: citizen._id,
        citizenName: citizen.name,
        title: 'Dangerous Potholes on MG Road near Metro Pillar 145',
        rawText: 'Huge deep potholes on the MG Road stretch near the metro pillar 145 causing bad traffic jams and minor two-wheeler slips.',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
        language: 'en',
        category: 'Roads & Infrastructure',
        department: 'Roads & Infrastructure',
        subcategory: 'Potholes',
        priority: 'High',
        priorityScore: 78,
        upvotes: [citizen._id],
        upvoteCount: 15,
        location: { text: 'MG Road, Metro Pillar 145, Gurugram' },
        status: 'Submitted',
        slaDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
        aiExplanation: {
          keywords: ['potholes', 'road', 'traffic'],
          confidence: 0.88,
          classificationMethod: 'Multilingual E5 Classifier'
        },
        aiSummary: 'Potholes causing traffic near MG Road metro pillar 145.'
      },
      {
        citizenId: citizen._id,
        citizenName: citizen.name,
        title: 'Uncollected Garbage Pile near Public Park Gate 2',
        rawText: 'Kachra pichle 4 din se nahi uthaya gaya hai park gate 2 ke paas. Badboo aane lagi hai aur insects fail rahe hain.',
        imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        language: 'hinglish',
        category: 'Sanitation',
        department: 'Sanitation',
        subcategory: 'Missed Collection',
        priority: 'Medium',
        priorityScore: 60,
        upvotes: [citizen._id],
        upvoteCount: 9,
        location: { text: 'Public Park Gate 2, Lajpat Nagar, Delhi' },
        status: 'Submitted',
        slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        aiExplanation: {
          keywords: ['kachra', 'badboo', 'sanitation'],
          confidence: 0.89,
          classificationMethod: 'Multilingual Classifier'
        },
        aiSummary: 'Uncollected garbage accumulating near park gate.'
      }
    ]);

    console.log('✅ Sample grievances seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
