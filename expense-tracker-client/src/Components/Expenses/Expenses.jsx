import React, { useState, useEffect } from 'react';
import Sidebar from '../Dashboard/Sidebar';
import { PlusCircle, RefreshCw, Edit2, Trash2, Download } from 'lucide-react';
import './Expenses.css';
import AddExpenseForm from '../Dashboard/AddExpenseForm';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [allExpensesLoading, setAllExpensesLoading] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', amount: '', category: '', date: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expenseFilter, setExpenseFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);

  useEffect(() => {
    fetchAllExpenses();
  }, []);

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
      if (!response.ok) throw new Error('Failed to fetch all expenses');
      const data = await response.json();
      console.log(data);
      setAllExpenses(data);
    } catch (err) {
      setAllExpenses([]);
    } finally {
      setAllExpensesLoading(false);
    }
  };

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
      fetchAllExpenses();
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
      fetchAllExpenses();
    } catch (err) {
      alert('Failed to update expense');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingExpenseId(null);
  };

  // CSV Export function
  const exportToCSV = () => {
    if (allExpenses.length === 0) {
      alert('No expenses to export');
      return;
    }

    // CSV Headers
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    
    // Convert expenses to CSV format
    const csvContent = [
      headers.join(','),
      ...allExpenses.map(expense => {
        const date = new Date(expense.date).toLocaleDateString('en-US');
        const description = expense.description.includes(',') || expense.description.includes('"') 
          ? `"${expense.description.replace(/"/g, '""')}"` 
          : expense.description;
        const category = expense.category;
        const amount = Number(expense.amount).toFixed(2);
        
        return [date, description, category, amount].join(',');
      })
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const categoryColors = {
    Food: { bg: '#fde68a', color: '#b45309' },
    Investment: { bg: '#bbf7d0', color: '#166534' },
    Transportation: { bg: '#bfdbfe', color: '#1e40af' },
    Entertainment: { bg: '#fbcfe8', color: '#be185d' },
    // Add more as needed
  };

  function CategoryBadge({ category }) {
    const { bg, color } = categoryColors[category] || { bg: '#e5e7eb', color: '#374151' };
    return (
      <span
        style={{
          background: bg,
          color,
          borderRadius: 12,
          padding: '2px 12px',
          fontSize: 14,
          fontWeight: 500,
          marginLeft: 8,
          display: 'inline-block',
          minWidth: 90,
          textAlign: 'center',
        }}
      >
        {category}
      </span>
    );
  }

  const getFilteredExpenses = () => {
    if (expenseFilter === 'week') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
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
      return allExpenses.filter(exp => exp.date && exp.date.slice(0, 10) === selectedDate);
    } else if (expenseFilter === 'category' && selectedCategory) {
      return allExpenses.filter(exp => exp.category === selectedCategory);
    }
    return allExpenses;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const ExpenseRow = ({ expense }) => {
    const isEditing = editingExpenseId === (expense._id || expense.id);
    if (isEditing) {
      return (
        <div className="recent-expense-item">
          <div className="recent-expense-info">
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
            <button onClick={() => handleEditSubmit(expense._id || expense.id)} className="add-expense-btn" disabled={editLoading} style={{ marginBottom: 4 }}>
              {editLoading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleEditCancel} className="logout-btn" style={{ background: 'none', color: 'gray' }}>
              Cancel
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="expense-row" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f3f4f6', padding: '18px 0px', gap: 8
      }}>
        <div style={{ flex: 2, minWidth: 180 }}>
          <div style={{color: '#111827', fontWeight: 600, fontSize: 17 }}>{expense.description}</div>
         {/* <div style={{ color: '#6b7280', fontSize: 14 }}>{expense.note || expense.details || expense.subtitle || ''}</div> */}
        </div>
        <div style={{ flex: 1, minWidth: 120, display: 'flex', justifyContent: 'center' }}>
          <CategoryBadge category={expense.category} />
        </div>
        <div style={{ color: '#6b7280', fontSize: 15, minWidth: 110, textAlign: 'center', flex: 1 }}>
          {formatDate(expense.date)}
        </div>
        <div style={{ color: '#111827', fontWeight: 700, fontSize: 18, minWidth: 110, textAlign: 'right', flex: 1 }}>
          ${Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', gap: 16, minWidth: 60, justifyContent: 'flex-end', flex: 0.5 }}>
          <Edit2
            size={20}
            style={{ cursor: 'pointer', color: '#2563eb' }}
            onClick={() => handleEditClick(expense)}
          />
          <Trash2
            size={20}
            style={{ cursor: 'pointer', color: '#ef4444' }}
            onClick={() => handleDeleteExpense(expense._id || expense.id)}
          />
        </div>
      </div>
    );
  };

  const filteredExpenses = getFilteredExpenses();
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="Expenses Header" style={{ display: 'flex', width: '100%' }}>
      <Sidebar />
      <div >
        <div className="all-expenses">
          <div className="all-expenses-header">
            <p>Track Control of your finances, One Expense at a time !!!</p>
            <div className="expense-header-buttons">
            <button
              className="add-expense-btn"
          
              onClick={() => setShowAddExpenseForm(true)}
            >
              + Add Expense
            </button>
            <button
              className="view-all-btn"
              style={{  display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={exportToCSV}
              disabled={allExpensesLoading || allExpenses.length === 0}
            >
              <Download size={16} />
              Export CSV
            </button>
            </div>
            {/* <h2>{expenseFilter === 'week' ? 'This Week\'s Expenses' : expenseFilter === 'month' ? 'This Month\'s Expenses' : expenseFilter === 'date' && selectedDate ? `Expenses on ${selectedDate}` : expenseFilter === 'category' && selectedCategory ? `Expenses in ${selectedCategory}` : 'All Expenses'}</h2> */}
          </div>
          <div className="filters-bar">
            <div className="filters-row">
              <button className="filter-btn" onClick={() => { setExpenseFilter('all'); setCurrentPage(1); }}>
                All Expenses
              </button>
              <button className="filter-btn" onClick={() => { setExpenseFilter('week'); setCurrentPage(1); }}>
                This Week
              </button>
              <button className="filter-btn" onClick={() => { setExpenseFilter('month'); setCurrentPage(1); }}>
                This Month
              </button>
            </div>
            <div className="filters-row">
              <div className="filter-control">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="filter-input"
                />
                <button
                  className="view-all-btn"
                  onClick={() => { if (selectedDate) setExpenseFilter('date'); setCurrentPage(1); }}
                  disabled={!selectedDate}
                >
                  Search by Date
                </button>
                {expenseFilter === 'date' && selectedDate && (
                  <button
                    className="view-all-btn clear-btn"
                    onClick={() => { setExpenseFilter('all'); setSelectedDate(''); setCurrentPage(1); }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="filter-control">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="filter-input"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  className="view-all-btn"
                  onClick={() => { if (selectedCategory) setExpenseFilter('category'); setCurrentPage(1); }}
                  disabled={!selectedCategory}
                >
                  Search by Category
                </button>
                {expenseFilter === 'category' && selectedCategory && (
                  <button
                    className="view-all-btn clear-btn"
                    onClick={() => { setExpenseFilter('all'); setSelectedCategory(''); setCurrentPage(1); }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          {showAddExpenseForm && (
            <AddExpenseForm
              API_BASE_URL={API_BASE_URL}
              onExpenseAdded={() => {
                setShowAddExpenseForm(false);
                fetchAllExpenses();
              }}
              onCancel={() => setShowAddExpenseForm(false)}
            />
          )}
          <div className="all-expenses-list">
            {/* Table Header Row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '2px solid #e5e7eb', padding: '10px 10px', fontWeight: 600, color: '#374151', background: '#f9fafb', fontSize: 15
            }}>
              <div style={{ flex: 2, minWidth: 180 }}>Description</div>
              <div style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>Category</div>
              <div style={{ flex: 1, minWidth: 110, textAlign: 'center' }}>Date</div>
              <div style={{ flex: 1, minWidth: 110, textAlign: 'right' }}>Amount</div>
              <div style={{ flex: 0.5, minWidth: 60, textAlign: 'right' }}>Actions</div>
            </div>
            {/* Expense Rows */}
            {allExpensesLoading ? (
              <div className="loading">
                <RefreshCw className="loading-icon" />
                <p>Loading all expenses...</p>
              </div>
            ) : paginatedExpenses.length > 0 ? (
              paginatedExpenses.map(expense => (
                <ExpenseRow key={expense._id || expense.id} expense={expense} />
              ))
            ) : (
              <div className="no-expenses">
                <p>No expenses yet. Add your first expense to get started!</p>
              </div>
            )}
          </div>
          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <span style={{ color: '#6b7280', fontSize: 14 }}>
              Showing {filteredExpenses.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage + 1)} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} results
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', marginLeft: 12 }}
            >{'<'}</button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: currentPage === idx + 1 ? '#2563eb' : '#fff',
                  color: currentPage === idx + 1 ? '#fff' : '#111827',
                  fontWeight: 500,
                }}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}
            >{'>'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;