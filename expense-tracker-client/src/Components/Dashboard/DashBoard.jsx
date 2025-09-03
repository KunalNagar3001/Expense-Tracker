import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, BarChart3, RefreshCw, TrendingUp } from 'lucide-react';
import './dashboard.css';
import { useNavigate } from 'react-router-dom';
import AddExpenseForm from './AddExpenseForm';
import Sidebar from './Sidebar';
import CategoryPieChart from './CategoryPieChart';
import BudgetProgress from './BudgetProgress';
import SavingCard from './SavingCard';
import Graph from './Graph';

const Dashboard = ({ user: propUser, onLogout }) => {
  const user = propUser || JSON.parse(localStorage.getItem('user'));
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
  // API base URL - adjust this to match your backend
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const [categorySummary, setCategorySummary] = useState([]);
  const budgets = {
    "Food & Dining": 600,
    "Transportation": 400,
    "Entertainment": 200,
    "Shopping": 250,
    "Utilities": 300,
  };

  useEffect(() => {
    const fetchCategorySummary = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/expenses/categories-summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // console.log(data);
        setCategorySummary(data);
      }
    };
    fetchCategorySummary();
  }, []);

  const pieData = categorySummary.map(cat => ({
    label: cat.category,
    value: cat.total
  }));
  const PIE_COLORS = ["#3B82F6", "#22C55E", "#F59E42", "#EF4444", "#A78BFA", "#6366F1", "#F472B6", "#FACC15"];
  const budgetProgress = categorySummary.map(cat => ({
    label: cat.category || cat._id,
    spent: cat.total,
    budget: budgets[cat.category || cat._id] || 0
  }));

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

  // To pass the `expenses` state as a prop to the Analytics page, you need to:
  // 1. Fetch and store recent expenses in Dashboard (already done with fetchRecentExpenses and setExpenses).
  // 2. When navigating to Analytics, pass the `expenses` state as a prop.
  //    - If you render <Analytics /> directly in Dashboard, do: <Analytics recentExpenses={expenses} />
  //    - If you use React Router, you can pass it via the `state` prop in <Link> or use a context/global state.
  //    - Or, you can use a wrapper route that injects the prop.
  //
  // Example (if rendering directly in Dashboard):
  //   <Analytics recentExpenses={expenses} />
  //
  // Example (if using React Router v6+ and want to pass via navigation):
  //   import { useNavigate } from 'react-router-dom';
  //   const navigate = useNavigate();
  //   // When navigating:
  //   navigate('/analytics', { state: { recentExpenses: expenses } });
  //
  //   // In Analytics.jsx, use:
  //   import { useLocation } from 'react-router-dom';
  //   const { state } = useLocation();
  //   const recentExpenses = state?.recentExpenses;
  //
  // The fetchRecentExpenses function itself remains unchanged:
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

  const SummaryCard = ({ title, amount, icon: Icon, trend, trendValue }) => (
    <div className="dashboard-summary-card">
      <div className="dashboard-summary-card-header">
        <div>
          <p className="dashboard-summary-title">{title}</p>
          <p className="dashboard-summary-amount">${amount.toFixed(2)}</p>
          <div className="dashboard-summary-icon-wrapper">
            <Icon className="dashboard-summary-icon" />
          </div>
        </div>
      </div>
    </div>
  );

  const monthlyTotal = summaryData.monthlyTotal || pieData.reduce((sum, c) => sum + c.value, 0);

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
    <div className="dashboard-layout">
      <Sidebar recentExpenses={expenses} />
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-inner">
            <div className="dashboard-header-row">
              <div>
                <h1 className="dashboard-title">Welcome back {user?.name}!</h1>
                <p className="dashboard-subtitle"> Here's your expense overview.</p>
              </div>
              <div className="dashboard-header-actions">
                <span className="dashboard-user-name">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>
        {/* Main dashboard content goes here */}
        <div className="dashboard-container">
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
              <div style={{ cursor: 'pointer' }}>
                <SummaryCard
                  title="This Week"
                  amount={summaryData.weeklyTotal}
                  icon={Calendar}
                  trend="down"
                  trendValue="8"
                />
              </div>
              <div style={{ cursor: 'pointer' }}>
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
                {/* Pie Chart Card */}
                <div className="dashboard-card">
                  <h3 className="dashboard-card-title">Expense Categories</h3>
                  <CategoryPieChart categories={pieData} centerLabel={monthlyTotal} />
                  <div style={{ marginTop: 16 }}>
                    {pieData.map((cat, i) => (
                      <div key={cat.label || i} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                        <span style={{
                          display: "inline-block",
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: PIE_COLORS[i % PIE_COLORS.length],
                          marginRight: 8,
                        }} />
                        <span className="categories-info">{cat.label || "Unknown"}</span>
                        <span className="categories-info-amt" >
                          ${typeof cat.value === 'number' ? cat.value.toFixed(2) : cat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <SavingCard />
                <Graph/>
                {/* Budget Progress Card */}
                <div className="dashboard-card">
                  <h3 className="dashboard-card-title">Budget Progress</h3>
                  <BudgetProgress budgets={budgetProgress} />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;