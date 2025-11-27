const Mission = require('../models/Mission');
const User = require('../models/User');
const { sendMissionNotification } = require('../services/expoPushService');

exports.getAllMissions = async (req, res) => {
  try {
    // Get all missions, sort by status (unopened first) then by date
    const missions = await Mission.find()
      .sort({ status: 1, 'payload.date': -1 })
      .populate('openedBy', 'username')
      .lean();

    res.json(missions);
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ error: 'Server error while fetching missions' });
  }
};

exports.getMissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const mission = await Mission.findOne({ missionId: id })
      .populate('openedBy', 'username')
      .lean();

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    res.json(mission);
  } catch (error) {
    console.error('Get mission by ID error:', error);
    res.status(500).json({ error: 'Server error while fetching mission' });
  }
};

exports.openMission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mission = await Mission.findOne({ missionId: id });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    if (mission.status !== 'unopened') {
      return res.status(400).json({ 
        error: 'Mission is not in unopened status',
        currentStatus: mission.status
      });
    }

    // Update mission to in_progress
    mission.status = 'in_progress';
    mission.openedAt = new Date();
    mission.openedBy = userId;

    await mission.save();

    const updatedMission = await Mission.findOne({ missionId: id })
      .populate('openedBy', 'username')
      .lean();

    res.json(updatedMission);
  } catch (error) {
    console.error('Open mission error:', error);
    res.status(500).json({ error: 'Server error while opening mission' });
  }
};

exports.updateMission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, collect, refill, maintenance } = req.body;

    // Validate status if provided
    if (status && !['in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be "in_progress" or "completed"' 
      });
    }

    const mission = await Mission.findOne({ missionId: id });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    // Update mission status if provided
    if (status) {
      mission.status = status;
      
      if (status === 'completed') {
        mission.completedAt = new Date();
      }
    }

    // Update collect subtask completion status
    if (collect) {
      if (collect.notes?.completed !== undefined) {
        mission.payload.collect.notes.completed = collect.notes.completed;
      }
      if (collect.coins?.completed !== undefined) {
        mission.payload.collect.coins.completed = collect.coins.completed;
      }
    }

    // Update refill subtask completion status
    if (refill) {
      if (refill.coins?.completed !== undefined) {
        mission.payload.refill.coins.completed = refill.coins.completed;
      }
      if (refill.notes?.completed !== undefined) {
        mission.payload.refill.notes.completed = refill.notes.completed;
      }
    }

    // Update maintenance task completion status
    if (maintenance && Array.isArray(maintenance)) {
      maintenance.forEach(update => {
        if (update.index !== undefined && update.completed !== undefined) {
          const task = mission.payload.maintenance[update.index];
          if (task) {
            task.completed = update.completed;
          }
        }
      });
    }

    await mission.save();

    const updatedMission = await Mission.findOne({ missionId: id })
      .populate('openedBy', 'username')
      .lean();

    res.json(updatedMission);
  } catch (error) {
    console.error('Update mission error:', error);
    res.status(500).json({ error: 'Server error while updating mission' });
  }
};

exports.createMission = async (req, res) => {
  try {
    const { username, ...payload } = req.body;

    // Validate required fields
    if (!payload.id) {
      return res.status(400).json({ error: 'Mission ID is required in payload' });
    }

    if (!username) {
      return res.status(400).json({ error: 'Username is required to assign mission' });
    }

    // Verify user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: `User '${username}' not found` });
    }

    // Check if mission already exists
    const existingMission = await Mission.findOne({ missionId: payload.id });
    if (existingMission) {
      return res.status(409).json({ error: 'Mission with this ID already exists' });
    }

    // Add completed: false to all tasks automatically
    const processedPayload = {
      ...payload,
      collect: {
        notes: {
          amount: payload.collect?.notes?.amount || payload.collect?.noteAmount || 0,
          completed: false
        },
        coins: {
          amount: payload.collect?.coins?.amount || payload.collect?.coinAmount || 0,
          completed: false
        }
      },
      refill: {
        coins: {
          amount: payload.refill?.coins?.amount || 0,
          coinTypes: payload.refill?.coins?.coinTypes || {},
          completed: false
        },
        notes: {
          amount: payload.refill?.notes?.amount || 0,
          noteTypes: payload.refill?.notes?.noteTypes || {},
          completed: false
        }
      },
      maintenance: Array.isArray(payload.maintenance) 
        ? payload.maintenance.map(task => 
            typeof task === 'string' 
              ? { task, completed: false }
              : { task: task.task, completed: false }
          )
        : []
    };

    console.log("🚀 ~ processedPayload:", processedPayload)
    // Create new mission
    const mission = new Mission({
      missionId: payload.id,
      payload: processedPayload,
      status: 'unopened'
    });

    await mission.save();

    // Send push notification to specific user
    try {
      await sendMissionNotification(payload, username);
    } catch (notificationError) {
      console.error('Push notification error:', notificationError);
      // Don't fail the mission creation if notification fails
    }

    res.status(201).json(mission);
  } catch (error) {
    console.error('Create mission error:', error);
    res.status(500).json({ error: 'Server error while creating mission' });
  }
};
