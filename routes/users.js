const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// All user routes require authentication
router.use(authMiddleware);

router.post('/:id/push-token', userController.registerPushToken);
router.delete('/:id/push-token', userController.removePushToken);

module.exports = router;
