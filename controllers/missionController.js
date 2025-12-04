const Mission = require('../models/Mission');
const User = require('../models/User');
const { sendMissionNotification } = require('../services/expoPushService');

exports.getAllMissions = async (req, res) => {
  try {
    const { username, page = 1, limit = 10 } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: `User '${username}' not found` });
    }

    // Convert to numbers and validate
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ error: 'Page and limit must be positive numbers' });
    }

    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const totalMissions = await Mission.countDocuments({ assignedTo: user._id });

    // Get paginated missions for the specified user, sort by status (unopened first) then by date
    const missions = await Mission.find({ assignedTo: user._id })
      .sort({'createdAt': -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('assignedTo', 'username')
      .lean();

    res.json({
      missions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalMissions,
        totalPages: Math.ceil(totalMissions / limitNum),
        hasNextPage: pageNum < Math.ceil(totalMissions / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ error: 'Server error while fetching missions' });
  }
};

exports.getMissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const mission = await Mission.findOne({ missionId: id })
      .populate('assignedTo', 'username')
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

    await mission.save();

    const updatedMission = await Mission.findOne({ missionId: id })
      .populate('assignedTo', 'username')
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
    const { collect, refill, maintenance, comment } = req.body;

    const mission = await Mission.findOne({ missionId: id });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    // Update comment if provided
    if (comment !== undefined) {
      mission.comment = comment;
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

    // Determine status based on task completion
    let allTasksCompleted = true;
    let anyTaskCompleted = false;

    // Check collect tasks
    if (mission.payload.collect) {
      if (mission.payload.collect.notes && mission.payload.collect.notes.amount) {
        if (mission.payload.collect.notes.completed) {
          anyTaskCompleted = true;
        } else {
          allTasksCompleted = false;
        }
      }
      if (mission.payload.collect.coins && mission.payload.collect.coins.amount) {
        if (mission.payload.collect.coins.completed) {
          anyTaskCompleted = true;
        } else {
          allTasksCompleted = false;
        }
      }
    }

    // Check refill tasks
    if (mission.payload.refill) {
      if (mission.payload.refill.coins && mission.payload.refill.coins.amount) {
        if (mission.payload.refill.coins.completed) {
          anyTaskCompleted = true;
        } else {
          allTasksCompleted = false;
        }
      }
      if (mission.payload.refill.notes && mission.payload.refill.notes.amount) {
        if (mission.payload.refill.notes.completed) {
          anyTaskCompleted = true;
        } else {
          allTasksCompleted = false;
        }
      }
    }

    // Check maintenance tasks
    if (mission.payload.maintenance && mission.payload.maintenance.length > 0) {
      mission.payload.maintenance.forEach(task => {
        if (task.completed) {
          anyTaskCompleted = true;
        } else {
          allTasksCompleted = false;
        }
      });
    }

    // Update status based on completion
    if (allTasksCompleted) {
      mission.status = 'completed';
      mission.completedAt = new Date();
    } else if (anyTaskCompleted || mission.status === 'in_progress') {
      mission.status = 'in_progress';
    }

    await mission.save();

    const updatedMission = await Mission.findOne({ missionId: id })
      .populate('assignedTo', 'username')
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

    // Validate that payload has at least one mission type (collect, refill, or maintenance)
    if (!payload.collect && !payload.refill && (!Array.isArray(payload.maintenance) || payload.maintenance.length === 0)) {
      return res.status(400).json({ 
        error: 'Mission must have at least one task type: collect, refill, or maintenance' 
      });
    }

    // Add completed: false to all tasks automatically
    const processedPayload = {
      ...payload
    };

    // Add completed flag for collect tasks if they exist
    if (payload.collect) {
      processedPayload.collect = {};
      if (payload.collect.notes || payload.collect.noteAmount !== undefined) {
        processedPayload.collect.notes = {
          amount: payload.collect.notes?.amount || payload.collect.noteAmount,
          completed: false
        };
      }
      if (payload.collect.coins || payload.collect.coinAmount !== undefined) {
        processedPayload.collect.coins = {
          amount: payload.collect.coins?.amount || payload.collect.coinAmount,
          completed: false
        };
      }
    }

    // Add completed flag for refill tasks if they exist
    if (payload.refill) {
      processedPayload.refill = {};
      if (payload.refill.coins) {
        processedPayload.refill.coins = {
          amount: payload.refill.coins.amount,
          coinTypes: payload.refill.coins.coinTypes || {},
          completed: false
        };
      }
      if (payload.refill.notes) {
        processedPayload.refill.notes = {
          amount: payload.refill.notes.amount,
          noteTypes: payload.refill.notes.noteTypes || {},
          completed: false
        };
      }
    }

    // Add completed flag for maintenance tasks if they exist
    if (Array.isArray(payload.maintenance) && payload.maintenance.length > 0) {
      processedPayload.maintenance = payload.maintenance.map(task => 
        typeof task === 'string' 
          ? { task, completed: false }
          : { task: task.task, completed: false }
      );
    }

    // Create new mission
    const mission = new Mission({
      missionId: payload.id,
      payload: processedPayload,
      status: 'unopened',
      assignedTo: user._id
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
