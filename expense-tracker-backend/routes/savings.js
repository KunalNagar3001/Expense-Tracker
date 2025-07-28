import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Savings from '../Savings.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// GET /api/savings - Get all savings goals for a user
router.get('/savings', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const savings = await Savings.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    res.json(savings);
  } catch (error) {
    console.error('Error fetching savings:', error);
    res.status(500).json({ error: 'Failed to fetch savings' });
  }
});

// GET /api/savings/summary - Get savings summary for dashboard
router.get('/savings/summary', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const [totalSavings, activeSavings, completedSavings, categoryTotals] = await Promise.all([
      // Total savings across all goals
      Savings.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$amount' }, totalGoal: { $sum: '$goalAmount' } } }
      ]),
      // Active savings goals
      Savings.countDocuments({ userId, status: 'Active' }),
      // Completed savings goals
      Savings.countDocuments({ userId, status: 'Completed' }),
      // Category totals
      Savings.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, goal: { $sum: '$goalAmount' } } },
        { $sort: { total: -1 } }
      ])
    ]);

    const summary = {
      totalSaved: totalSavings[0]?.total || 0,
      totalGoal: totalSavings[0]?.totalGoal || 0,
      activeGoals: activeSavings,
      completedGoals: completedSavings,
      progress: totalSavings[0]?.totalGoal > 0 
        ? Math.round((totalSavings[0].total / totalSavings[0].totalGoal) * 100) 
        : 0,
      categoryBreakdown: categoryTotals.map(cat => ({
        category: cat._id,
        saved: cat.total,
        goal: cat.goal,
        progress: cat.goal > 0 ? Math.round((cat.total / cat.goal) * 100) : 0
      }))
    };
    res.json(summary);
  } catch (error) {
    console.error('Error fetching savings summary:', error);
    res.status(500).json({ error: 'Failed to fetch savings summary' });
  }
});

// GET /api/savings/:id - Get a specific savings goal
router.get('/savings/:id', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const savingsId = new mongoose.Types.ObjectId(req.params.id);
    
    const savings = await Savings.findOne({ _id: savingsId, userId });
    if (!savings) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    res.json(savings);
  } catch (error) {
    console.error('Error fetching savings goal:', error);
    res.status(500).json({ error: 'Failed to fetch savings goal' });
  }
});

// POST /api/savings - Create a new savings goal
router.post('/savings', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const {
      title,
      amount = 0,
      category,
      goalAmount,
      targetDate,
      priority = 'Medium',
      status = 'Active',
      alerts = {},
      notes = ''
    } = req.body;

    const newSavings = new Savings({
      userId,
      title,
      amount,
      category,
      goalAmount,
      targetDate,
      priority,
      status,
      alerts: {
        reminderFrequency: alerts.reminderFrequency || 'Monthly',
        milestoneAlerts: alerts.milestoneAlerts !== undefined ? alerts.milestoneAlerts : true,
        targetDateReminder: alerts.targetDateReminder !== undefined ? alerts.targetDateReminder : true
      },
      notes
    });

    const savedSavings = await newSavings.save();
    res.status(201).json(savedSavings);
  } catch (error) {
    console.error('Error creating savings goal:', error);
    res.status(500).json({ error: 'Failed to create savings goal' });
  }
});

// PUT /api/savings/:id - Update a savings goal
router.put('/savings/:id', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const savingsId = new mongoose.Types.ObjectId(req.params.id);
    
    const savings = await Savings.findOne({ _id: savingsId, userId });
    if (!savings) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    const updatedSavings = await Savings.findByIdAndUpdate(
      savingsId,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.json(updatedSavings);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ error: 'Failed to update savings goal' });
  }
});

// PATCH /api/savings/:id/amount - Update savings amount (for adding money to goal)
router.patch('/savings/:id/amount', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const savingsId = new mongoose.Types.ObjectId(req.params.id);
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const savings = await Savings.findOne({ _id: savingsId, userId });
    if (!savings) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    // Update the amount
    savings.amount = amount;
    
    // Auto-update status to completed if goal is reached
    if (amount >= savings.goalAmount && savings.status === 'Active') {
      savings.status = 'Completed';
    }
    
    // Auto-update status back to active if amount is reduced below goal
    if (amount < savings.goalAmount && savings.status === 'Completed') {
      savings.status = 'Active';
    }

    const updatedSavings = await savings.save();
    res.json(updatedSavings);
  } catch (error) {
    console.error('Error updating savings amount:', error);
    res.status(500).json({ error: 'Failed to update savings amount' });
  }
});

// DELETE /api/savings/:id - Delete a savings goal
router.delete('/savings/:id', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const savingsId = new mongoose.Types.ObjectId(req.params.id);
    
    const savings = await Savings.findOneAndDelete({ _id: savingsId, userId });
    if (!savings) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    
    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ error: 'Failed to delete savings goal' });
  }
});

export default router; 