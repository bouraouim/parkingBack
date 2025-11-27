require('dotenv').config();
const mongoose = require('mongoose');
const Mission = require('../models/Mission');

async function createSampleMission() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    const sampleMission = {
      id: 'mission-001',
      date: new Date().toISOString().split('T')[0],
      cashier: 'John Doe',
      machineName: 'Machine A1',
      collect: {
        notes: {
          amount: 500,
          completed: false
        },
        coins: {
          amount: 200,
          completed: false
        }
      },
      refill: {
        coins: {
          amount: 100,
          coinTypes: {
            '1': 50,
            '2': 50
          },
          completed: false
        },
        notes: {
          amount: 500,
          noteTypes: {
            '10': 30,
            '20': 20
          },
          completed: false
        }
      },
      maintenance: [
        { task: 'Clean screen', completed: false },
        { task: 'Check printer', completed: false }
      ],
      qrCode: 'QR12345'
    };

    // Check if mission already exists
    const existingMission = await Mission.findOne({ missionId: sampleMission.id });
    if (existingMission) {
      console.log('✗ Mission already exists:', sampleMission.id);
      await mongoose.connection.close();
      return;
    }

    const mission = new Mission({
      missionId: sampleMission.id,
      payload: sampleMission,
      status: 'unopened'
    });

    await mission.save();
    console.log('✓ Sample mission created successfully');
    console.log('  Mission ID:', sampleMission.id);
    console.log('  Status:', mission.status);
    
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('✗ Error creating sample mission:', error.message);
    process.exit(1);
  }
}

createSampleMission();
