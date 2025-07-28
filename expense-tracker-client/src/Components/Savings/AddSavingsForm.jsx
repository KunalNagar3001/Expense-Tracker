import React, { useState } from 'react';
import './AddSavingsForm.css';

const AddSavingsForm = ({ API_BASE_URL, onSavingsAdded, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '',
    goalAmount: '',
    targetDate: '',
    priority: 'Medium',
    status: 'Active',
    alerts: {
      reminderFrequency: 'Monthly',
      milestoneAlerts: true,
      targetDateReminder: true
    },
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('alerts.')) {
      const alertField = name.split('.')[1];
      setForm(f => ({
        ...f,
        alerts: {
          ...f.alerts,
          [alertField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/savings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount) || 0,
          goalAmount: parseFloat(form.goalAmount)
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add savings goal');
      }
      
      // Reset form
      setForm({
        title: '',
        amount: '',
        category: '',
        goalAmount: '',
        targetDate: '',
        priority: 'Medium',
        status: 'Active',
        alerts: {
          reminderFrequency: 'Monthly',
          milestoneAlerts: true,
          targetDateReminder: true
        },
        notes: ''
      });
      
      if (onSavingsAdded) onSavingsAdded();
    } catch (err) {
      setError('Failed to add savings goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-savings-modal-backdrop" onClick={onCancel}>
      <div className="add-savings-modal" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="add-savings-form-inner">
          <h2 className="add-savings-title">Add New Savings Goal</h2>
          
          <input
            type="text"
            name="title"
            className="add-savings-input"
            placeholder="Savings Goal Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          
          <input
            type="number"
            name="amount"
            className="add-savings-input"
            placeholder="Current Amount Saved"
            value={form.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
          
          <select
            name="category"
            className="add-savings-input"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Category</option>
            <option value="Emergency Fund">Emergency Fund</option>
            <option value="Vacation">Vacation</option>
            <option value="House">House</option>
            <option value="Car">Car</option>
            <option value="Education">Education</option>
            <option value="Wedding">Wedding</option>
            <option value="Retirement">Retirement</option>
            <option value="Other">Other</option>
          </select>
          
          <input
            type="number"
            name="goalAmount"
            className="add-savings-input"
            placeholder="Goal Amount"
            value={form.goalAmount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
          
          <input
            type="date"
            name="targetDate"
            className="add-savings-input"
            value={form.targetDate}
            onChange={handleChange}
            required
          />
          
          <select
            name="priority"
            className="add-savings-input"
            value={form.priority}
            onChange={handleChange}
            required
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          
          <textarea
            name="notes"
            className="add-savings-textarea"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={handleChange}
            rows="3"
          />
          
          <div className="add-savings-alerts">
            <h3>Alert Settings</h3>
            <div className="add-savings-alert-row">
              <label>
                <input
                  type="checkbox"
                  name="alerts.milestoneAlerts"
                  checked={form.alerts.milestoneAlerts}
                  onChange={handleChange}
                />
                Milestone Alerts (25%, 50%, 75%)
              </label>
            </div>
            <div className="add-savings-alert-row">
              <label>
                <input
                  type="checkbox"
                  name="alerts.targetDateReminder"
                  checked={form.alerts.targetDateReminder}
                  onChange={handleChange}
                />
                Target Date Reminder
              </label>
            </div>
            <select
              name="alerts.reminderFrequency"
              className="add-savings-input"
              value={form.alerts.reminderFrequency}
              onChange={handleChange}
            >
              <option value="Weekly">Weekly Reminders</option>
              <option value="Monthly">Monthly Reminders</option>
            </select>
          </div>
          
          {error && <div className="add-savings-error">{error}</div>}
          
          <div className="add-savings-btn-row">
            <button type="submit" className="add-savings-btn add-savings-btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Savings Goal'}
            </button>
            <button type="button" className="add-savings-btn add-savings-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSavingsForm;