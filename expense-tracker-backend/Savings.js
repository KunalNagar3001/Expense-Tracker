import mongoose from 'mongoose';

const savingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  category: { 
    type: String, 
    required: true,
    enum: ['Emergency Fund', 'Vacation', 'House', 'Car', 'Education', 'Wedding', 'Retirement', 'Other']
  },
  goalAmount: { type: Number, required: true },
  targetDate: { type: Date, required: true },
  priority: { 
    type: String, 
    required: true,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: { 
    type: String, 
    required: true,
    enum: ['Active', 'Completed', 'Paused'],
    default: 'Active'
  },
  alerts: {
    reminderFrequency: { 
      type: String, 
      enum: ['Weekly', 'Monthly'],
      default: 'Monthly'
    },
    milestoneAlerts: { 
      type: Boolean, 
      default: true 
    },
    targetDateReminder: { 
      type: Boolean, 
      default: true 
    }
  },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'Savings' });

// Update the updatedAt field before saving
savingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt field before updating
savingsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Savings = mongoose.model('Savings', savingsSchema);

export default Savings; 