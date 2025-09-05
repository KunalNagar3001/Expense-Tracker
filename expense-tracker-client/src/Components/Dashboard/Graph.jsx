import React, { useState, useEffect } from 'react';
import './Graph.css';

const Graph = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    thisMonth: 0,
    vsLastMonth: 0,
    sixMonthAvg: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = 'http://localhost:5001';

  // Fetch monthly spending data from API
  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/allexpenses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const expenses = await response.json();
      
      // Process expenses to get monthly totals
      const monthlyTotals = processExpensesToMonthlyData(expenses);
      
      // If no real data, use sample data
      if (monthlyTotals.length === 0) {
        const sampleData = [
          { month: 'Jan', amount: 450 },
          { month: 'Feb', amount: 520 },
          { month: 'Mar', amount: 680 },
          { month: 'Apr', amount: 420 },
          { month: 'May', amount: 580 },
          { month: 'Jun', amount: 750 },
          { month: 'Jul', amount: 644 }
        ];
        setMonthlyData(sampleData);
        
        setSummaryStats({
          thisMonth: 644,
          vsLastMonth: -106,
          sixMonthAvg: 579
        });
      } else {
        setMonthlyData(monthlyTotals);
        
        // Calculate summary statistics
        if (monthlyTotals.length > 0) {
          const currentMonth = monthlyTotals[monthlyTotals.length - 1].amount;
          const lastMonth = monthlyTotals.length > 1 ? monthlyTotals[monthlyTotals.length - 2].amount : 0;
          const sixMonthAvg = monthlyTotals.slice(-6).reduce((sum, item) => sum + item.amount, 0) / Math.min(6, monthlyTotals.length);
          
          setSummaryStats({
            thisMonth: currentMonth,
            vsLastMonth: currentMonth - lastMonth,
            sixMonthAvg: Math.round(sixMonthAvg)
          });
        }
      }
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      setError('Failed to load spending data');
    } finally {
      setLoading(false);
    }
  };

  // Process expenses to monthly data
  const processExpensesToMonthlyData = (expenses) => {
    console.log('Processing expenses:', expenses.length);
    
    const monthlyMap = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthName,
          amount: 0,
          year: date.getFullYear(),
          monthNum: date.getMonth()
        };
      }
      
      monthlyMap[monthKey].amount += parseFloat(expense.amount) || 0;
    });
    
    // Convert to array and sort by date
    const monthlyArray = Object.values(monthlyMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthNum - b.monthNum;
    });
    
    console.log('Monthly data:', monthlyArray);
    
    // Get last 7 months of data
    const result = monthlyArray.slice(-7);
    console.log('Final monthly data:', result);
    return result;
  };

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get dynamic scale based on data
  const getScaleValues = () => {
    if (monthlyData.length === 0) return { min: 0, max: 800, step: 100 };
    
    const maxAmount = Math.max(...monthlyData.map(item => item.amount));
    const minAmount = Math.min(...monthlyData.map(item => item.amount));
    
    // Add some padding
    const padding = (maxAmount - minAmount) * 0.1;
    const adjustedMax = maxAmount + padding;
    const adjustedMin = Math.max(0, minAmount - padding);
    
    // Round to nice numbers
    const range = adjustedMax - adjustedMin;
    const step = Math.ceil(range / 6 / 50) * 50; // Round step to nearest 50
    const max = Math.ceil(adjustedMax / step) * step;
    const min = Math.floor(adjustedMin / step) * step;
    
    return { min, max, step };
  };

  const getYAxisValues = () => {
    const { min, max, step } = getScaleValues();
    const values = [];
    for (let i = min; i <= max; i += step) {
      values.push(i);
    }
    return values;
  };

  // Convert data value to SVG coordinate (0-100 scale)
  const getYPosition = (value) => {
    const { min, max } = getScaleValues();
    const range = max - min;
    
    if (range === 0) return 50; // Fallback for single value
    
    // Invert Y coordinate (SVG 0,0 is top-left, we want 0 at bottom)
    const normalizedValue = (value - min) / range;
    return 100 - (normalizedValue * 100);
  };

  const getXPosition = (index) => {
    if (monthlyData.length <= 1) return 50;
    // Distribute points evenly across the width with some padding
    const padding = 5; // 5% padding on each side
    const usableWidth = 100 - (padding * 2);
    return padding + (index / (monthlyData.length - 1)) * usableWidth;
  };

  const generatePath = () => {
    if (monthlyData.length === 0) return '';
    
    const points = monthlyData.map((item, index) => {
      const x = getXPosition(index);
      const y = getYPosition(item.amount);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const generateAreaPath = () => {
    if (monthlyData.length === 0) return '';
    
    const points = monthlyData.map((item, index) => {
      const x = getXPosition(index);
      const y = getYPosition(item.amount);
      return `${x},${y}`;
    });
    
    // Start from bottom-left, go through all data points, then back to bottom-right
    const firstX = getXPosition(0);
    const lastX = getXPosition(monthlyData.length - 1);
    const bottomY = getYPosition(0); // Bottom of the chart
    
    return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
  };

  if (loading) {
    return (
      <div className="graph-container">
        <div className="graph-header">
          <h2>Monthly Spending Trend</h2>
        </div>
        <div className="graph-loading">
          <p>Loading spending data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="graph-container">
        <div className="graph-header">
          <h2>Monthly Spending Trend</h2>
        </div>
        <div className="graph-error">
          <p>{error}</p>
          <button onClick={fetchMonthlyData} className="graph-retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <div className="graph-container">
        <div className="graph-header">
          <h2>Monthly Spending Trend</h2>
        </div>
        <div className="graph-empty">
          <p>No spending data available</p>
          <p>Add some expenses to see your spending trends</p>
        </div>
      </div>
    );
  }

  const yAxisValues = getYAxisValues();

  return (
    <div className="graph-container">
      <div className="graph-header">
        <h2>Monthly Spending Trend</h2>
      </div>
      
      {/* Summary Statistics Cards */}
      <div className="graph-summary-cards">
        <div className="summary-card">
          <div className="summary-value">{formatCurrency(summaryStats.thisMonth)}</div>
          <div className="summary-label">This Month</div>
        </div>
        <div className="summary-card">
          <div className={`summary-value ${summaryStats.vsLastMonth >= 0 ? 'positive' : 'negative'}`}>
            {summaryStats.vsLastMonth >= 0 ? '+' : ''}{formatCurrency(summaryStats.vsLastMonth)}
          </div>
          <div className="summary-label">vs Last Month</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{formatCurrency(summaryStats.sixMonthAvg)}</div>
          <div className="summary-label">6-Month Avg</div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        <div className="chart-y-axis">
          {yAxisValues.reverse().map((value, index) => (
            <div key={index} className="y-axis-label">
              {formatCurrency(value)}
            </div>
          ))}
        </div>
        
        <div className="chart-main">
          <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05"/>
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {yAxisValues.map((value, index) => (
              <line
                key={index}
                x1="0"
                y1={getYPosition(value)}
                x2="100"
                y2={getYPosition(value)}
                className="grid-line"
                strokeWidth="0.2"
              />
            ))}
            
            {/* Area fill */}
            <path
              d={generateAreaPath()}
              fill="url(#area-gradient)"
              opacity="0.8"
            />
            
            {/* Line */}
            <path
              d={generatePath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {monthlyData.map((item, index) => (
              <g key={index}>
                <circle
                  cx={getXPosition(index)}
                  cy={getYPosition(item.amount)}
                  r="2"
                  fill="#3b82f6"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                {/* Hover tooltip */}
                <circle
                  cx={getXPosition(index)}
                  cy={getYPosition(item.amount)}
                  r="6"
                  fill="transparent"
                  className="data-point-hover"
                >
                  <title>{`${item.month}: ${formatCurrency(item.amount)}`}</title>
                </circle>
              </g>
            ))}
          </svg>
          
          {/* X-axis labels */}
          <div className="chart-x-axis">
            {monthlyData.map((item, index) => (
              <div 
                key={index} 
                className="x-axis-label"
                style={{
                  left: `${getXPosition(index)}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {item.month}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graph;