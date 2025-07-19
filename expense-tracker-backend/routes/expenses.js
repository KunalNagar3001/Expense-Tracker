import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Expense from '../Expense.js';

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

// GET /api/expenses/summary - Get expense summary for dashboard
router.get('/expenses/summary', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - 6);
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    const [todayExpenses, weekExpenses, monthExpenses, totalExpenses, categoryTotals] = await Promise.all([
      // Today's expenses
      Expense.aggregate([
        { $match: { userId, date: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // This week's expenses
      Expense.aggregate([
        { $match: { userId, date: { $gte: weekStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // This month's expenses
      Expense.aggregate([
        { $match: { userId, date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Total expenses
      Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Category totals
      Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ])
    ]);

    const summary = {
      todayTotal: todayExpenses[0]?.total || 0,
      weeklyTotal: weekExpenses[0]?.total || 0,
      monthlyTotal: monthExpenses[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      topCategories: (categoryTotals || []).map(cat => ({
        category: cat._id,
        amount: cat.total
      }))
    };
    res.json(summary);
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    res.status(500).json({ error: 'Failed to fetch expense summary' });
  }
});

// GET /api/expenses/recent - Get recent expenses
router.get('/expenses/recent', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const recentExpenses = await Expense.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .exec();
    res.json(recentExpenses);
  } catch (error) {
    console.error('Error fetching recent expenses:', error);
    res.status(500).json({ error: 'Failed to fetch recent expenses' });
  }
});

// GET /api/allexpenses - Get ALL expenses for the user (fixed route)
router.get('/allexpenses', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const allExpenses = await Expense.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .exec();
    
    console.log(`Found ${allExpenses.length} expenses for user ${userId}`);
    res.json(allExpenses);
  } catch (error) {
    console.error('Error fetching all expenses:', error);
    res.status(500).json({ error: 'Failed to fetch all expenses' });
  }
});

// POST /api/expenses - Create new expense
router.post('/expenses', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { description, amount, category, date } = req.body;
    
    if (!description || !amount || !category || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    
    const newExpense = new Expense({
      userId,
      description: description.trim(),
      amount: parseFloat(amount),
      category: category.trim(),
      date: new Date(date),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newExpense.save();
    res.status(201).json({
      message: 'Expense added successfully',
      expense: newExpense
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// PUT /api/expenses/:id - Update an expense
router.put('/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { id } = req.params;
    const { description, amount, category, date } = req.body;

    if (!description || !amount || !category || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    expense.description = description.trim();
    expense.amount = parseFloat(amount);
    expense.category = category.trim();
    expense.date = new Date(date);
    expense.updatedAt = new Date();

    await expense.save();
    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete('/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;