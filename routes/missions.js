const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const authMiddleware = require('../middleware/auth');

// All mission routes require authentication
router.use(authMiddleware);

router.get('/', missionController.getAllMissions);
router.get('/:id', missionController.getMissionById);
router.post('/:id/open', missionController.openMission);
router.post('/:id/update', missionController.updateMission);
router.post('/', missionController.createMission);

module.exports = router;
