const User = require('../models/User');

exports.registerPushToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;

    // Validate input
    if (!token) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    // Verify user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if token already exists
    if (!user.pushTokens.includes(token)) {
      user.pushTokens.push(token);
      await user.save();
    }

    res.json({ 
      message: 'Push token registered successfully',
      tokenCount: user.pushTokens.length
    });
  } catch (error) {
    console.error('Push token registration error:', error);
    res.status(500).json({ error: 'Server error during token registration' });
  }
};

exports.removePushToken = async (req, res) => {{
  try {
    const { id } = req.params;
    const { token } = req.body;

    // Validate input
    if (!token) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    // Find user and remove token
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.pushTokens = user.pushTokens.filter(t => t !== token);
    await user.save();

    res.json({ 
      message: 'Push token removed successfully',
      tokenCount: user.pushTokens.length
    });
  } catch (error) {
    console.error('Push token removal error:', error);
    res.status(500).json({ error: 'Server error during token removal' });
  }
}
};
