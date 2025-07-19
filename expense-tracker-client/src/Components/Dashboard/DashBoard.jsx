import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import './dashboard.css';
import { useNavigate } from 'react-router-dom';
import AddExpenseForm from './AddExpenseForm';

const Dashboard = ({ user, onLogout }) => {
  if (!user) return null;
  console.log('Dashboard user:', user);
  
  const [expenses, setExpenses] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalExpenses: 0,
    monthlyTotal: 0,
    weeklyTotal: 0,
    todayTotal: 0,
    topCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);
  const [allExpensesLoading, setAllExpensesLoading] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', amount: '', category: '', date: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('all'); // 'all', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  // API base URL - adjust this to match your backend
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const handleLogout = () => {
    console.log('Dashboard handleLogout called');
    if (onLogout) onLogout();
    // navigate('/') to let parent handle view change
  };

  // API call functions
  const fetchExpenseSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/expenses/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch expense summary');
      }
      
      const data = await response.json();
      setSummaryData(data);
    } catch (err) {
      console.error('Error fetching expense summary:', err);
      setError('Failed to load expense summary');
      // Fallback to mock data if API fails
      setSummaryData({
        totalExpenses: 171.0,
        monthlyTotal: 171.0,
        weeklyTotal: 171.0,
        todayTotal: 130.50,
        topCategories: [
          { category: 'Food & Dining', amount: 98.00 },
          { category: 'Transportation', amount: 45.00 },
          { category: 'Entertainment', amount: 28.00 }
        ]
      });
    }
  };

  const fetchRecentExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/expenses/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent expenses');
      }
      
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching recent expenses:', err);
      setError('Failed to load recent expenses');
      // Fallback to mock data if API fails
      const mockExpenses = [
        { id: 1, description: 'Groceries', amount: 85.50, category: 'Food', date: '2025-07-01' },
        { id: 2, description: 'Gas', amount: 45.00, category: 'Transportation', date: '2025-07-01' },
        { id: 3, description: 'Coffee', amount: 12.50, category: 'Food', date: '2025-06-30' },
        { id: 4, description: 'Movie tickets', amount: 28.00, category: 'Entertainment', date: '2025-06-29' },
      ];
      setExpenses(mockExpenses);
    }
  };

  const fetchAllExpenses = async () => {
    setAllExpensesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/allexpenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch all expenses');
      }
      const data = await response.json();
      setAllExpenses(data);
    } catch (err) {
      setAllExpenses([]); // fallback or error handling
    } finally {
      setAllExpensesLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchExpenseSummary(),
        fetchRecentExpenses()
      ]);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const SummaryCard = ({ title, amount, icon: Icon, trend, trendValue }) => (
    <div className="dashboard-summary-card">
      <div className="dashboard-summary-card-header">
        <div>
          <p className="dashboard-summary-title">{title}</p>
          <p className="dashboard-summary-amount">${amount.toFixed(2)}</p>
          {trend && (
            <div className={`dashboard-summary-trend ${trend === 'up' ? 'dashboard-trend-up' : 'dashboard-trend-down'}`}> 
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="dashboard-summary-trend-value">{trendValue}% from last period</span>
            </div>
          )}
        </div>
        <div className="dashboard-summary-icon-wrapper">
          <Icon className="dashboard-summary-icon" />
        </div>
      </div>
    </div>
  );

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete expense');
      loadDashboardData();
      if (viewAll) fetchAllExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpenseId(expense._id || expense.id);
    setEditForm({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date ? expense.date.slice(0, 10) : ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };

  const handleEditSubmit = async (expenseId) => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error('Failed to update expense');
      setEditingExpenseId(null);
      loadDashboardData();
      if (viewAll) fetchAllExpenses();
    } catch (err) {
      alert('Failed to update expense');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingExpenseId(null);
  };

  const RecentExpenseItem = ({ expense }) => {
    const isEditing = editingExpenseId === (expense._id || expense.id);
    if (isEditing) {
      return (
        <div className="dashboard-recent-expense-item">
          <div className="dashboard-recent-expense-info">
            <input
              type="text"
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              className="add-expense-input"
              style={{ marginBottom: 4, width: '100%' }}
            />
            <input
              type="number"
              name="amount"
              value={editForm.amount}
              onChange={handleEditChange}
              className="add-expense-input"
              style={{ marginBottom: 4, width: '100%' }}
            />
            <input
              type="text"
              name="category"
              value={editForm.category}
              onChange={handleEditChange}
              className="add-expense-input"
              style={{ marginBottom: 4, width: '100%' }}
            />
            <input
              type="date"
              name="date"
              value={editForm.date}
              onChange={handleEditChange}
              className="add-expense-input"
              style={{ marginBottom: 4, width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button onClick={() => handleEditSubmit(expense._id || expense.id)} className="dashboard-add-expense-btn" disabled={editLoading} style={{ marginBottom: 4 }}>
              {editLoading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleEditCancel} className="dashboard-logout-btn" style={{ background: 'none', color: 'gray' }}>
              Cancel
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="dashboard-recent-expense-item">
        <div className="dashboard-recent-expense-info">
          <h4 className="dashboard-recent-expense-title">{expense.description}</h4>
          <p className="dashboard-recent-expense-category">
            {expense.category} • {formatDate(expense.date)}
          </p>
        </div>
        <div className="dashboard-recent-expense-amount">
          <p>${expense.amount.toFixed(2)}</p>
          <button onClick={() => handleEditClick(expense)} className="dashboard-view-all-btn" style={{ marginRight: 8 }}>Edit</button>
          <button onClick={() => handleDeleteExpense(expense._id || expense.id)} className="dashboard-logout-btn" style={{ background: 'none', color: 'red' }}>Delete</button>
        </div>
      </div>
    );
  };

  const CategoryBar = ({ category, amount, maxAmount }) => {
    const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
    const colors = ['blue', 'green', 'purple', 'orange', 'red'];
    const colorIndex = summaryData.topCategories.findIndex(cat => cat.category === category);
    const color = colors[colorIndex % colors.length];
    
    return (
      <div className="dashboard-category-item">
        <div className="dashboard-top-category-row">
          <span className="dashboard-top-category-label">{category}</span>
          <span className="dashboard-top-category-amount">${amount.toFixed(2)}</span>
        </div>
        <div className="dashboard-top-category-bar-bg">
          <div 
            className={`dashboard-top-category-bar-${color}`} 
            style={{width: `${percentage}%`}}
          ></div>
        </div>
      </div>
    );
  };

  const categories = [
    'Food',
    'Transport',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Health',
    'Other',
  ];

  const getFilteredExpenses = () => {
    if (expenseFilter === 'week') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0,0,0,0);
      return allExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= startOfWeek && expDate <= now;
      });
    } else if (expenseFilter === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return allExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= startOfMonth && expDate <= now;
      });
    } else if (expenseFilter === 'date' && selectedDate) {
      return allExpenses.filter(exp => {
        // Compare only the date part
        return exp.date && exp.date.slice(0, 10) === selectedDate;
      });
    } else if (expenseFilter === 'category' && selectedCategory) {
      return allExpenses.filter(exp => exp.category === selectedCategory);
    }
    return allExpenses;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <RefreshCw className="dashboard-loading-icon" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && expenses.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={handleRefresh} className="dashboard-retry-btn">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header - Keeping original styling */}
      <div className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="dashboard-header-row">
            <div>
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">Welcome back! Here's your expense overview.</p>
            </div>
            <button className="dashboard-add-expense-btn" onClick={() => setShowAddExpenseForm((prev) => !prev)}>
              <PlusCircle size={20} />
              Add Expense
            </button>
            <button onClick={handleRefresh} className="dashboard-refresh-btn" style={{ marginLeft: '0.5rem' }}>
              <RefreshCw size={16} />
            </button>
            {/* Show user name to the left of logout button */}
            <span style={{ marginLeft: '1rem', fontWeight: 'bold', color: "black" }}>{user?.name}</span>
            <button className="dashboard-logout-btn" onClick={handleLogout} style={{ marginLeft: '1rem' }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Show Add Expense Form if toggled */}
      {showAddExpenseForm && (
        <AddExpenseForm
          API_BASE_URL={API_BASE_URL}
          onExpenseAdded={() => {
            setShowAddExpenseForm(false);
            loadDashboardData();
          }}
          onCancel={() => setShowAddExpenseForm(false)}
        />
      )}

      {/* Main Content */}
      <div className="dashboard-main-content">
        {/* Summary Cards */}
        <div className="dashboard-summary-cards">
          <SummaryCard 
            title="Today's Expenses" 
            amount={summaryData.todayTotal} 
            icon={DollarSign}
            trend="up"
            trendValue="15"
          />
          <div onClick={() => {
            fetchAllExpenses();
            setExpenseFilter('week');
            setViewAll(true);
          }} style={{ cursor: 'pointer', boxShadow: expenseFilter === 'week' && viewAll ? '0 0 0 2px #2563eb' : undefined }}>
            <SummaryCard 
              title="This Week" 
              amount={summaryData.weeklyTotal} 
              icon={Calendar}
              trend="down"
              trendValue="8"
            />
          </div>
          <div onClick={() => {
            fetchAllExpenses();
            setExpenseFilter('month');
            setViewAll(true);
          }} style={{ cursor: 'pointer', boxShadow: expenseFilter === 'month' && viewAll ? '0 0 0 2px #2563eb' : undefined }}>
            <SummaryCard 
              title="This Month" 
              amount={summaryData.monthlyTotal} 
              icon={BarChart3}
              trend="up"
              trendValue="23"
            />
          </div>
          <SummaryCard 
            title="Total Expenses" 
            amount={summaryData.totalExpenses} 
            icon={TrendingUp}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-main-grid">
          {viewAll ? (
            <div className="dashboard-all-expenses">
              <div className="dashboard-all-expenses-header">
                <h2>{expenseFilter === 'week' ? 'This Week\'s Expenses' : expenseFilter === 'month' ? 'This Month\'s Expenses' : expenseFilter === 'date' && selectedDate ? `Expenses on ${selectedDate}` : expenseFilter === 'category' && selectedCategory ? `Expenses in ${selectedCategory}` : 'All Expenses'}</h2>
                <button className="dashboard-back-btn" onClick={() => { setViewAll(false); setExpenseFilter('all'); setSelectedDate(''); setSelectedCategory(''); }}>
                  Back to Dashboard
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
                <button
                  className="dashboard-view-all-btn"
                  onClick={() => { if (selectedDate) setExpenseFilter('date'); }}
                  disabled={!selectedDate}
                >
                  Search by Date
                </button>
                {expenseFilter === 'date' && selectedDate && (
                  <button
                    className="dashboard-view-all-btn"
                    style={{ color: 'red' }}
                    onClick={() => { setExpenseFilter('all'); setSelectedDate(''); }}
                  >
                    Clear Date Filter
                  </button>
                )}
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  className="dashboard-view-all-btn"
                  onClick={() => { if (selectedCategory) setExpenseFilter('category'); }}
                  disabled={!selectedCategory}
                >
                  Search by Category
                </button>
                {expenseFilter === 'category' && selectedCategory && (
                  <button
                    className="dashboard-view-all-btn"
                    style={{ color: 'red' }}
                    onClick={() => { setExpenseFilter('all'); setSelectedCategory(''); }}
                  >
                    Clear Category Filter
                  </button>
                )}
              </div>
              <div className="dashboard-all-expenses-list">
                {allExpensesLoading ? (
                  <div className="dashboard-loading">
                    <RefreshCw className="dashboard-loading-icon" />
                    <p>Loading all expenses...</p>
                  </div>
                ) : getFilteredExpenses().length > 0 ? (
                  getFilteredExpenses().map(expense => (
                    <RecentExpenseItem key={expense._id || expense.id} expense={expense} />
                  ))
                ) : (
                  <div className="dashboard-no-expenses">
                    <p>No expenses yet. Add your first expense to get started!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Recent Expenses */}
              <div className="dashboard-recent-expenses">
                <div className="dashboard-recent-expenses-header">
                  <div className="dashboard-recent-expenses-row">
                    <h2 className="dashboard-recent-expenses-title">Recent Expenses</h2>
                    <button className="dashboard-view-all-btn" onClick={() => {
                      fetchAllExpenses();
                      setViewAll(true);
                    }}>
                      View All
                    </button>
                  </div>
                </div>
                <div className="dashboard-recent-expenses-list">
                  {expenses.length > 0 ? (
                    expenses.slice(0, 5).map(expense => (
                      <RecentExpenseItem key={expense._id || expense.id} expense={expense} />
                    ))
                  ) : (
                    <div className="dashboard-no-expenses">
                      <p>No expenses yet. Add your first expense to get started!</p>
                      <button className="dashboard-add-first-expense-btn">
                        <PlusCircle size={16} />
                        Add First Expense
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions & Categories */}
              <div className="dashboard-quick-actions-categories">
                {/* Quick Actions */}
                <div className="dashboard-quick-actions">
                  <h3 className="dashboard-quick-actions-title">Quick Actions</h3>
                  <div className="dashboard-quick-actions-list">
                    <button className="dashboard-quick-action-btn">
                      <div className="dashboard-quick-action-inner">
                        <PlusCircle className="dashboard-quick-action-icon" />
                        <span className="dashboard-quick-action-label">Add New Expense</span>
                      </div>
                    </button>
                    <button className="dashboard-quick-action-btn">
                      <div className="dashboard-quick-action-inner">
                        <BarChart3 className="dashboard-quick-action-icon-green" />
                        <span className="dashboard-quick-action-label">View Analytics</span>
                      </div>
                    </button>
                    <button className="dashboard-quick-action-btn">
                      <div className="dashboard-quick-action-inner">
                        <Calendar className="dashboard-quick-action-icon-purple" />
                        <span className="dashboard-quick-action-label">Monthly Report</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Top Categories */}
                <div className="dashboard-top-categories">
                  <h3 className="dashboard-top-categories-title">Top Categories</h3>
                  <div className="dashboard-top-categories-list">
                    {summaryData.topCategories.length > 0 ? (
                      summaryData.topCategories.map((category, index) => (
                        <CategoryBar
                          key={category.category}
                          category={category.category}
                          amount={category.amount}
                          maxAmount={summaryData.topCategories[0]?.amount || 0}
                        />
                      ))
                    ) : (
                      <div className="dashboard-no-categories">
                        <p>No expense categories yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;