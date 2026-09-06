const express = require('express');
const router = express.Router();
const GovService = require('../models/GovService');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Seed data array for initial population if empty
const DEFAULT_SERVICES = [
  {
    category: 'Police & Emergency',
    name: 'National Emergency Response System',
    number: '112',
    description: 'Unified emergency response for Police, Fire, and Ambulance across India.',
    type: 'Emergency',
    available: '24x7',
    city: 'All-India',
    order: 1
  },
  {
    category: 'Police & Emergency',
    name: 'Police Control Room (PCR)',
    number: '100',
    description: 'Direct line to municipal police control room for immediate dispatch.',
    type: 'Emergency',
    available: '24x7',
    city: 'All-India',
    order: 2
  },
  {
    category: 'Police & Emergency',
    name: 'Women Safety & Distress Helpline',
    number: '1091',
    description: 'Dedicated helpline for women safety, harassment reporting, and emergency police response.',
    type: 'Safety',
    available: '24x7',
    city: 'All-India',
    order: 3
  },
  {
    category: 'Healthcare & Hospitals',
    name: 'National Ambulance Service',
    number: '108',
    description: 'Free emergency medical transportation to nearest government or trauma hospital.',
    type: 'Ambulance',
    available: '24x7',
    city: 'All-India',
    order: 1
  },
  {
    category: 'Healthcare & Hospitals',
    name: 'Maternal & Child Health Ambulance',
    number: '102',
    description: 'Basic life support ambulance dispatch for pregnant women and newborns.',
    type: 'Ambulance',
    available: '24x7',
    city: 'All-India',
    order: 2
  },
  {
    category: 'Healthcare & Hospitals',
    name: 'Tele-MANAS Health & Mental Health Helpline',
    number: '14416',
    description: 'National tele-mental health services and psychological support hotline.',
    type: 'Health',
    available: '24x7',
    city: 'All-India',
    order: 3
  },
  {
    category: 'Fire & Disaster Response',
    name: 'Fire Services Emergency Dispatch',
    number: '101',
    description: 'Immediate fire brigade dispatch for building fires, industrial hazards, and rescue.',
    type: 'Fire',
    available: '24x7',
    city: 'All-India',
    order: 1
  },
  {
    category: 'Fire & Disaster Response',
    name: 'NDRF Disaster Response Control Room',
    number: '1078',
    description: 'National Disaster Response Force for floods, earthquakes, structural collapses.',
    type: 'Disaster',
    available: '24x7',
    city: 'All-India',
    order: 2
  },
  {
    category: 'Cyber Crime Helpline',
    name: 'National Cyber Crime Financial Fraud Helpline',
    number: '1930',
    description: 'Immediate reporting for online banking fraud, UPI scams, and cyber financial crimes to freeze fraudulent transfers.',
    type: 'Cyber',
    available: '24x7',
    city: 'All-India',
    order: 1
  },
  {
    category: 'Cyber Crime Helpline',
    name: 'Cyber Crime Portal Information Helpline',
    number: '1800-11-4930',
    description: 'Assistance for filing official cyber crime complaints on cybercrime.gov.in.',
    type: 'Support',
    available: '09:00 AM - 06:00 PM',
    city: 'All-India',
    order: 2
  },
  {
    category: 'Municipal & Utility Services',
    name: 'Municipal Water Supply & Leakage Helpline',
    number: '1916',
    description: 'Report major water pipe bursts, dirty water contamination, or request emergency tankers.',
    type: 'Water',
    available: '24x7',
    city: 'All-India',
    order: 1
  },
  {
    category: 'Municipal & Utility Services',
    name: 'Electricity Outage & Fault Helpline',
    number: '19123',
    description: 'Report high voltage transformer sparks, power cuts, line faults, and electrical hazards.',
    type: 'Electricity',
    available: '24x7',
    city: 'All-India',
    order: 2
  },
  {
    category: 'Municipal & Utility Services',
    name: 'PWD Road Repair & Pothole Helpline',
    number: '1800-11-0093',
    description: 'Public Works Department line for arterial road repairs, fallen trees, and major potholes.',
    type: 'Roads',
    available: '08:00 AM - 08:00 PM',
    city: 'All-India',
    order: 3
  }
];

// Helper function to seed if empty
async function seedIfNeeded() {
  const count = await GovService.countDocuments();
  if (count === 0) {
    await GovService.insertMany(DEFAULT_SERVICES);
    console.log('✅ Seeded GovService collection with default emergency helplines');
  }
}

// GET /api/gov-services - Public (No auth required)
router.get('/', async (req, res, next) => {
  try {
    await seedIfNeeded();
    const { category, search } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { number: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    const services = await GovService.find(filter).sort({ category: 1, order: 1, name: 1 });
    
    // Group services by category for structured response
    const categoriesMap = {};
    services.forEach(item => {
      if (!categoriesMap[item.category]) {
        categoriesMap[item.category] = {
          category: item.category,
          contacts: []
        };
      }
      categoriesMap[item.category].contacts.push({
        id: item._id,
        name: item.name,
        number: item.number,
        info: item.description,
        type: item.type,
        available: item.available,
        city: item.city
      });
    });

    const result = Object.values(categoriesMap);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/gov-services - Admin only
router.post('/', auth, roleCheck('admin'), async (req, res, next) => {
  try {
    const service = new GovService(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
});

// PUT /api/gov-services/:id - Admin only
router.put('/:id', auth, roleCheck('admin'), async (req, res, next) => {
  try {
    const service = await GovService.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Service entry not found' });
    res.json(service);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/gov-services/:id - Admin only
router.delete('/:id', auth, roleCheck('admin'), async (req, res, next) => {
  try {
    const service = await GovService.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service entry not found' });
    res.json({ message: 'Service entry deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
