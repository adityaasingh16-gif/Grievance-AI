const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const DIRECTORY_DATA = [
  {
    category: 'Police & Emergency',
    description: 'Immediate police response, law enforcement, local stations, and public safety helplines.',
    contacts: [
      { id: 'p1', name: 'National Emergency Response System', number: '112', type: 'Emergency', available: '24x7 Hotline', info: 'Unified emergency response for Police, Fire, and Ambulance across India.' },
      { id: 'p2', name: 'Police Control Room (PCR)', number: '100', type: 'Emergency', available: '24x7 Hotline', info: 'Direct line to municipal police control room for immediate dispatch.' },
      { id: 'p3', name: 'Women Safety & Distress Helpline', number: '1091', type: 'Safety', available: '24x7 Hotline', info: 'Dedicated helpline for women safety, harassment reporting, and instant police support.' },
      { id: 'p4', name: 'Senior Citizen Helpline', number: '14567', type: 'Support', available: '08:00 AM - 08:00 PM', info: 'Assistance for senior citizens regarding safety, legal support, and abuse prevention.' }
    ]
  },
  {
    category: 'Healthcare & Hospitals',
    description: 'Emergency ambulance dispatch, trauma centres, and major government hospitals.',
    contacts: [
      { id: 'h1', name: 'National Ambulance Service', number: '102', type: 'Ambulance', available: '24x7 Dispatch', info: 'Free emergency medical transportation to nearest government hospital.' },
      { id: 'h2', name: 'CATES Trauma Emergency Ambulance', number: '1099', type: 'Trauma', available: '24x7 Dispatch', info: 'Advanced life support ambulances equipped for major road accidents and cardiac emergencies.' },
      { id: 'h3', name: 'AIIMS Emergency & Trauma Centre', number: '011-26588700', type: 'Hospital', available: '24x7 Casualty', info: 'All India Institute of Medical Sciences emergency desk and level-1 trauma care.' },
      { id: 'h4', name: 'National Health Helpline (Tele-MANAS)', number: '14416', type: 'Health', available: '24x7 Helpline', info: 'Tele-consultation, health guidelines, and mental health support service.' }
    ]
  },
  {
    category: 'Fire & Disaster Response',
    description: 'Fire brigades, building collapses, chemical hazards, and NDRF disaster response.',
    contacts: [
      { id: 'f1', name: 'Fire Services Emergency', number: '101', type: 'Fire', available: '24x7 Dispatch', info: 'Immediate fire brigade dispatch for building fires, industrial accidents, and rescue operations.' },
      { id: 'f2', name: 'NDRF Disaster Response Control Room', number: '1078', type: 'Disaster', available: '24x7 Control', info: 'National Disaster Response Force for floods, earthquakes, structural collapses, and severe storms.' },
      { id: 'f3', name: 'State Disaster Management Authority (SDMA)', number: '1070', type: 'Disaster', available: '24x7 Emergency', info: 'State-level relief coordination during natural disasters and severe weather alerts.' }
    ]
  },
  {
    category: 'Cyber Crime Helpline',
    description: 'Online financial fraud, identity theft, cyberstalking, and digital security reporting.',
    contacts: [
      { id: 'c1', name: 'National Cyber Crime Helpline', number: '1930', type: 'Cyber', available: '24x7 Toll Free', info: 'Immediate reporting for online banking fraud, UPI scams, and cyber financial crimes to freeze fraudulent transfers.' },
      { id: 'c2', name: 'Cyber Crime Reporting Portal Helpline', number: '1800-11-4930', type: 'Support', available: '09:00 AM - 06:00 PM', info: 'Assistance for filing official cyber crime complaints on cybercrime.gov.in.' }
    ]
  },
  {
    category: 'Municipal & Utility Services',
    description: 'Water pipeline leaks, electricity power outages, road maintenance, and sanitation.',
    contacts: [
      { id: 'm1', name: 'Municipal Water Supply & Tanker Control', number: '1916', type: 'Water', available: '24x7 Support', info: 'Report major water pipe bursts, dirty water contamination, or request emergency water tankers.' },
      { id: 'm2', name: 'Electricity Power Outage & Fault Helpline', number: '19123', type: 'Electricity', available: '24x7 Support', info: 'Report high voltage transformer sparks, power cuts, line faults, and electrical hazards.' },
      { id: 'm3', name: 'PWD Road Maintenance & Pothole Helpline', number: '1800-11-0093', type: 'Roads', available: '08:00 AM - 08:00 PM', info: 'Public Works Department line for arterial road repairs, fallen trees, and major potholes.' },
      { id: 'm4', name: 'Swachh Bharat Sanitation & Waste Helpline', number: '1969', type: 'Sanitation', available: '07:00 AM - 09:00 PM', info: 'Report skipped municipal garbage collection and illegal waste dumping.' }
    ]
  }
];

// GET /api/directory - Fetch all official emergency contacts
router.get('/', authMiddleware, (req, res) => {
  res.json(DIRECTORY_DATA);
});

module.exports = router;
