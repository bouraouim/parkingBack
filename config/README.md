# Configuration Files

This folder contains configuration files for the backend server.

## Expo Push Notifications

The application uses Expo's free push notification service. No additional configuration is needed - push notifications work out of the box with Expo Go and standalone builds.

### How it works:
1. The app requests permission for push notifications
2. Expo generates a unique push token for the device
3. The app sends the push token to the backend via `/api/users/:id/push-token`
4. Backend uses Expo Push API to send notifications to registered devices

No Firebase or FCM setup required!
