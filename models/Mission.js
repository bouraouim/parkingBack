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
        amount: Number,
        completed: {
          type: Boolean,
          default: false
        }
      },
      coins: {
        amount: Number,
        completed: {
          type: Boolean,
          default: false
        }
      }
    },
    refill: {
      coins: {
        amount: Number,
        coinTypes: mongoose.Schema.Types.Mixed,
        completed: {
          type: Boolean,
          default: false
        }
      },
      notes: {
        amount: Number,
        noteTypes: mongoose.Schema.Types.Mixed,
        completed: {
          type: Boolean,
          default: false
        }
      }
    },
    maintenance: [
      {
        task: {
          en: {
            type: String,
            required: true
          },
          fr: {
            type: String,
            required: true
          }
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
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    default: ''
  },
  openedAt: {
    type: Date
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
