import React from 'react';
import './SavingsCard.css';

const SavingsCard = ({ savings, onUpdateAmount, onEdit, onDelete }) => {
    const progress = savings.goalAmount > 0 ? (savings.amount / savings.goalAmount) * 100 : 0;
    const progressPercentage = Math.min(progress, 100);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#10b981';
            case 'Active': return '#1d4ed8';
            case 'Paused': return '#f59e0b';
            default: return '#6b7280';
        }
    };



    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return '#ef4444';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <div className="savings-card">
            <div className="savings-card-header">
                <div className="savings-card-title-section">
                    <h3 className="savings-card-title">{savings.title}</h3>
                    <div className="savings-card-badges">
                        <span
                            className="savings-card-status"
                            style={{ backgroundColor: getStatusColor(savings.status) }}
                        >
                            {savings.status}
                        </span>
                        <span
                            className="savings-card-priority"
                            style={{ backgroundColor: getPriorityColor(savings.priority) }}
                        >
                            {savings.priority}
                        </span>
                    </div>
                </div>
                <div className="savings-card-category">
                    {savings.category}
                </div>
            </div>

            <div className="savings-card-progress">
                <div className="savings-card-progress-info">
                    <span className="savings-card-amount">
                        {formatCurrency(savings.amount)}
                    </span>
                    <span className="savings-card-goal">
                        of {formatCurrency(savings.goalAmount)}
                    </span>
                </div>
                <div className="savings-card-progress-bar">
                    <div
                        className="savings-card-progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div className="savings-card-progress-percentage">
                    {Math.round(progressPercentage)}% Complete
                </div>
            </div>
            <div className="savings-card-last">
                <div className="savings-card-details">
                    <div className="savings-card-detail">
                        <span className="savings-card-label">Target Date:</span>
                        <span className="savings-card-value">{formatDate(savings.targetDate)}</span>
                    </div>
                    {savings.notes && (
                        <div className="savings-card-notes">
                            <span className="savings-card-label">Notes:</span>
                            <span className="savings-card-value">{savings.notes}</span>
                        </div>
                    )}
                </div>

                <div className="savings-card-actions">
                    <button
                        className="savings-card-btn savings-card-btn-primary"
                        onClick={() => onUpdateAmount(savings._id)}
                    >
                        Update Amount
                    </button>
                    <button
                        className="savings-card-btn savings-card-btn-secondary"
                        onClick={() => onEdit(savings)}
                    >
                        Edit
                    </button>
                    <button
                        className="savings-card-btn savings-card-btn-danger"
                        onClick={() => onDelete(savings._id)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SavingsCard; 