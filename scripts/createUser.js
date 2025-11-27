require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createUser(username, password) {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('✗ User already exists:', username);
      await mongoose.connection.close();
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      username,
      passwordHash,
      fcmTokens: []
    });
    
    await user.save();
    console.log('✓ User created successfully');
    console.log('  Username:', username);
    console.log('  ID:', user._id);
    
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('✗ Error creating user:', error.message);
    process.exit(1);
  }
}

// Get username and password from command line arguments
const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log('Usage: node createUser.js <username> <password>');
  console.log('Example: node createUser.js worker1 password123');
  process.exit(1);
}

createUser(username, password);
