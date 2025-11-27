const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  missionId: {
    type: String,
    required: true,
    unique: true
  },
  payload: {
    date: {
      type: String,
      required: true
    },
    cashier: {
      type: String,
      required: true
    },
    machineName: {
      type: String,
      required: true
    },
    collect: {
      notes: {
        amount: {
          type: Number,
          required: true
        },
        completed: {
          type: Boolean,
          default: false
        }
      },
      coins: {
        amount: {
          type: Number,
          required: true
        },
        completed: {
          type: Boolean,
          default: false
        }
      }
    },
    refill: {
      coins: {
        amount: {
          type: Number,
          required: true
        },
        coinTypes: {
          type: mongoose.Schema.Types.Mixed,
          required: true
        },
        completed: {
          type: Boolean,
          default: false
        }
      },
      notes: {
        amount: {
          type: Number,
          required: true
        },
        noteTypes: {
          type: mongoose.Schema.Types.Mixed,
          required: true
        },
        completed: {
          type: Boolean,
          default: false
        }
      }
    },
    maintenance: [
      {
        task: {
          type: String,
          required: true
        },
        completed: {
          type: Boolean,
          default: false
        }
      }
    ],
    qrCode: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['unopened', 'in_progress', 'completed'],
    default: 'unopened'
  },
  openedAt: {
    type: Date
  },
  openedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
missionSchema.index({ missionId: 1 });
missionSchema.index({ status: 1 });

module.exports = mongoose.model('Mission', missionSchema);
