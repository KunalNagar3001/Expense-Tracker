import React, { useState, useEffect } from 'react';
import './EditSavingsModal.css';

const EditSavingsModal = ({ savings, onUpdate, onCancel }) => {
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

    // Populate form with existing data when component mounts
    useEffect(() => {
        if (savings) {
            setForm({
                title: savings.title || '',
                amount: savings.amount || '',
                category: savings.category || '',
                goalAmount: savings.goalAmount || '',
                targetDate: savings.targetDate ? new Date(savings.targetDate).toISOString().split('T')[0] : '',
                priority: savings.priority || 'Medium',
                status: savings.status || 'Active',
                alerts: {
                    reminderFrequency: savings.alerts?.reminderFrequency || 'Monthly',
                    milestoneAlerts: savings.alerts?.milestoneAlerts !== undefined ? savings.alerts.milestoneAlerts : true,
                    targetDateReminder: savings.alerts?.targetDateReminder !== undefined ? savings.alerts.targetDateReminder : true
                },
                notes: savings.notes || ''
            });
        }
    }, [savings]);

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
            const response = await fetch(`http://localhost:5001/api/savings/${savings._id}`, {
                method: 'PUT',
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
                throw new Error('Failed to update savings goal');
            }
            
            const updatedSavings = await response.json();
            onUpdate(updatedSavings);
        } catch (err) {
            setError('Failed to update savings goal');
            console.error('Error updating savings:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-savings-modal-backdrop" onClick={onCancel}>
            <div className="edit-savings-modal" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="edit-savings-form-inner">
                    <h2 className="edit-savings-title">Edit Savings Goal</h2>
                    
                    <input
                        type="text"
                        name="title"
                        className="edit-savings-input"
                        placeholder="Savings Goal Title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                    
                    <input
                        type="number"
                        name="amount"
                        className="edit-savings-input"
                        placeholder="Current Amount Saved"
                        value={form.amount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                    
                    <select
                        name="category"
                        className="edit-savings-input"
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
                        className="edit-savings-input"
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
                        className="edit-savings-input"
                        value={form.targetDate}
                        onChange={handleChange}
                        required
                    />
                    
                    <select
                        name="priority"
                        className="edit-savings-input"
                        value={form.priority}
                        onChange={handleChange}
                        required
                    >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                    </select>

                    <select
                        name="status"
                        className="edit-savings-input"
                        value={form.status}
                        onChange={handleChange}
                        required
                    >
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Completed">Completed</option>
                    </select>
                    
                    <textarea
                        name="notes"
                        className="edit-savings-textarea"
                        placeholder="Notes (optional)"
                        value={form.notes}
                        onChange={handleChange}
                        rows="3"
                    />
                    
                    <div className="edit-savings-alerts">
                        <h3>Alert Settings</h3>
                        <div className="edit-savings-alert-row">
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
                        <div className="edit-savings-alert-row">
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
                            className="edit-savings-input"
                            value={form.alerts.reminderFrequency}
                            onChange={handleChange}
                        >
                            <option value="Weekly">Weekly Reminders</option>
                            <option value="Monthly">Monthly Reminders</option>
                        </select>
                    </div>
                    
                    {error && <div className="edit-savings-error">{error}</div>}
                    
                    <div className="edit-savings-btn-row">
                        <button type="submit" className="edit-savings-btn edit-savings-btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Savings Goal'}
                        </button>
                        <button type="button" className="edit-savings-btn edit-savings-btn-cancel" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSavingsModal; 