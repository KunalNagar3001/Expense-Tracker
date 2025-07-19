import React, { useState } from 'react';
import './AddExpenseForm.css';

const AddExpenseForm = ({ API_BASE_URL, onExpenseAdded, onCancel }) => {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        throw new Error('Failed to add expense');
      }
      setForm({ description: '', amount: '', category: '', date: '' });
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      setError('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-expense-modal-backdrop" onClick={onCancel}>
      <div className="add-expense-modal" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="add-expense-form-inner">
          <input
            type="text"
            name="description"
            className="add-expense-input"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="amount"
            className="add-expense-input"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
          <select
            name="category"
            className="add-expense-input"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Health">Health</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="date"
            name="date"
            className="add-expense-input"
            value={form.date}
            onChange={handleChange}
            required
          />
          <div className="add-expense-btn-row">
            <button type="submit" className="add-expense-btn add-expense-btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
            <button type="button" className="add-expense-btn add-expense-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
          </div>
          {error && <div className="add-expense-error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddExpenseForm;
