const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  pushTokens: [
    {
      type: String
    }
  ]
}, {
  timestamps: true
});

// Index for faster lookups
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
