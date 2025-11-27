const axios = require('axios');
const User = require('../models/User');

// Expo Push Notification Service
const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

// Send mission notification to specific user by username using Expo Push
const sendMissionNotification = async (missionPayload, username) => {
  try {
    // Get user by username
    const user = await User.findOne({ username });
    console.log("🚀 ~ sendMissionNotification ~ user:", user)

    if (!user) {
      console.log(`User not found: ${username}`);
      return;
    }

    if (!user.pushTokens || user.pushTokens.length === 0) {
      console.log(`No push tokens found for user: ${username}`);
      return;
    }

    // Filter valid Expo push tokens (they start with ExponentPushToken[...])
    const expoPushTokens = user.pushTokens.filter(token => 
      token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')
    );

    if (expoPushTokens.length === 0) {
      console.log(`No valid Expo push tokens for user: ${username}`);
      return;
    }

    // Prepare Expo push messages
    const messages = expoPushTokens.map(token => ({
      to: token,
      sound: 'default',
      title: 'New Mission',
      body: `Machine: ${missionPayload.machineName || 'Unknown'} - ${missionPayload.cashier || 'Unknown cashier'}`,
      data: {
        id: missionPayload.id,
        payload: JSON.stringify(missionPayload)
      },
      priority: 'high',
      channelId: 'missions',
        vibrate: [0, 250, 250, 250],

    }));

    // Send to Expo Push API
    const response = await axios.post(EXPO_PUSH_API, messages, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      }
    });

    const results = response.data.data;
    let successCount = 0;
    let failureCount = 0;
    const failedTokens = [];

    results.forEach((result, idx) => {
      if (result.status === 'ok') {
        successCount++;
      } else {
        failureCount++;
        failedTokens.push(expoPushTokens[idx]);
        console.error('Failed to send to token:', expoPushTokens[idx], result.message);
      }
    });

    console.log(`Expo push notification sent to ${username}. Success: ${successCount}, Failure: ${failureCount}`);

    // Remove invalid tokens
    if (failedTokens.length > 0) {
      user.pushTokens = user.pushTokens.filter(t => !failedTokens.includes(t));
      await user.save();
      console.log(`Removed ${failedTokens.length} invalid tokens from ${username}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error sending Expo push notification:', error.response?.data || error.message);
    throw error;
  }
};

// Send to all users with push tokens
const sendBroadcastNotification = async (missionPayload) => {
  try {
    const users = await User.find({ 'pushTokens.0': { $exists: true } });
    
    const results = await Promise.allSettled(
      users.map(user => sendMissionNotification(missionPayload, user.username))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Broadcast complete. Success: ${successful}, Failed: ${failed}`);
    return { successful, failed };
  } catch (error) {
    console.error('Error in broadcast notification:', error);
    throw error;
  }
};

// Initialize function (for compatibility with existing code)
const initializeExpoPush = () => {
  console.log('Using Expo Push Notifications (no Firebase/FCM needed)');
};

module.exports = {
  initializeExpoPush,
  sendMissionNotification,
  sendBroadcastNotification
};
