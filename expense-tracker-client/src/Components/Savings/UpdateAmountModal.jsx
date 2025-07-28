import React, { useState } from 'react';
import './UpdateAmountModal.css';

const UpdateAmountModal = ({ savings, onUpdate, onCancel }) => {
    const [amount, setAmount] = useState(savings.amount || 0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/savings/${savings._id}/amount`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: parseFloat(amount) })
            });

            if (!response.ok) {
                throw new Error('Failed to update amount');
            }

            const updatedSavings = await response.json();
            onUpdate(updatedSavings);
        } catch (err) {
            setError('Failed to update amount');
            console.error('Error updating amount:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="update-amount-modal-backdrop" onClick={onCancel}>
            <div className="update-amount-modal" onClick={e => e.stopPropagation()}>
                <div className="update-amount-modal-content">
                    <h2 className="update-amount-title">Update Savings Amount</h2>
                    
                    <div className="savings-info">
                        <h3>{savings.title}</h3>
                        <p className="savings-goal">Goal: {formatCurrency(savings.goalAmount)}</p>
                        <p className="savings-current">Current: {formatCurrency(savings.amount)}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="update-amount-form">
                        <div className="form-group">
                            <label htmlFor="amount">New Amount Saved:</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                                className="update-amount-input"
                            />
                        </div>

                        {error && <div className="update-amount-error">{error}</div>}

                        <div className="update-amount-btn-row">
                            <button 
                                type="submit" 
                                className="update-amount-btn update-amount-btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Amount'}
                            </button>
                            <button 
                                type="button" 
                                className="update-amount-btn update-amount-btn-cancel"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateAmountModal; 