import React, { useState, useEffect } from "react";
import "./savingCard.css";

const SavingCard = () => {
  const [savings, setSavings] = useState([]);
  const API_BASE_URL = 'http://localhost:5001';

  const fetchSavings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/savings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Savings');
      }

      const data = await response.json();
      setSavings(data);
    } catch (error) {
      console.error('Error fetching savings:', error);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  return (
    <div className="savingd-container">
      <div className="savingd-header-container">
        <div className="savingd-header">
          Saving Goals 
        </div>
        <div className="savingd-header-active">
        {savings.filter(saving => saving.status === 'Active').length} Active
        </div>
      </div>
      {savings
        .filter(saving => saving.status === 'Active') // Only show active goals
        .slice(0, 2) // Show only first 2 cards
        .map((saving) => {
          // Calculate progress for each individual savings goal
          const progress = saving.goalAmount > 0 ? (saving.amount / saving.goalAmount) * 100 : 0;
          const progressPercentage = Math.min(progress, 100); // Cap at 100%

          return (
            <div key={saving._id} className="savingd-card-container">
              <div className="savingd-cards">
                <h3>{saving.title}</h3>
                <div className="savingd-card-progressbar">
                  <div
                    className="savingd-card-progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="savingd-card-info">
                  <span>₹{saving.amount} / ₹{saving.goalAmount}</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="savingd-card-date">
                  Target: {new Date(saving.targetDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}

      {/* Show message if no active savings goals */}
      {savings.filter(saving => saving.status === 'Active').length === 0 && (
        <div className="savingd-empty">
          <p>No active savings goals</p>
        </div>
      )}
    </div>
  );
};

export default SavingCard;