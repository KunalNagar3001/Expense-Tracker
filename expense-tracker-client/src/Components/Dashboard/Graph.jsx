import React, { useState, useEffect } from 'react';
import './Graph.css';

const Graph = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    thisMonth: 0,
    vsLastMonth: 0,
    sixMonthAvg: 0
  });
  const API_BASE_URL = 'http://localhost:5001';

  // Sample data for demonstration - replace with actual API call
  const sampleData = [
    { month: 'Jan', amount: 680 },
    { month: 'Feb', amount: 520 },
    { month: 'Mar', amount: 740 },
    { month: 'Apr', amount: 580 },
    { month: 'May', amount: 600 },
    { month: 'Jun', amount: 620 },
    { month: 'Jul', amount: 540 }
  ];

  useEffect(() => {
    // For now, using sample data
    // TODO: Replace with actual API call to fetch monthly spending data
    setMonthlyData(sampleData);
    
    // Calculate summary statistics
    const currentMonth = sampleData[sampleData.length - 1].amount;
    const lastMonth = sampleData[sampleData.length - 2].amount;
    const sixMonthAvg = sampleData.slice(-6).reduce((sum, item) => sum + item.amount, 0) / 6;
    
    setSummaryStats({
      thisMonth: currentMonth,
      vsLastMonth: currentMonth - lastMonth,
      sixMonthAvg: Math.round(sixMonthAvg)
    });
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMaxValue = () => {
    return Math.max(...monthlyData.map(item => item.amount));
  };

  const getMinValue = () => {
    return Math.min(...monthlyData.map(item => item.amount));
  };

  const getYAxisValues = () => {
    const max = getMaxValue();
    const min = getMinValue();
    const range = max - min;
    const step = Math.ceil(range / 8 / 100) * 100; // Round to nearest 100
    
    const values = [];
    for (let i = 0; i <= 8; i++) {
      values.push(i * step);
    }
    return values;
  };

  const getYPosition = (value) => {
    const max = getMaxValue();
    const min = getMinValue();
    const range = max - min;
    return 100 - ((value - min) / range) * 100;
  };

  const getXPosition = (index) => {
    return (index / (monthlyData.length - 1)) * 100;
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
    
    // Add bottom points to close the area
    const bottomPoints = monthlyData.map((item, index) => {
      const x = getXPosition(index);
      return `${x},100`;
    }).reverse();
    
    return `M ${points.join(' L ')} L ${bottomPoints.join(' L ')} Z`;
  };

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
          {getYAxisValues().map((value, index) => (
            <div key={index} className="y-axis-label">
              {formatCurrency(value)}
            </div>
          ))}
        </div>
        
        <div className="chart-main">
          <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {getYAxisValues().map((value, index) => (
              <line
                key={index}
                x1="0"
                y1={getYPosition(value)}
                x2="100"
                y2={getYPosition(value)}
                className="grid-line"
              />
            ))}
            
            {/* Area fill */}
            <path
              d={generateAreaPath()}
              className="chart-area"
            />
            
            {/* Line */}
            <path
              d={generatePath()}
              className="chart-line"
              fill="none"
            />
            
            {/* Data points */}
            {monthlyData.map((item, index) => (
              <circle
                key={index}
                cx={getXPosition(index)}
                cy={getYPosition(item.amount)}
                r="2"
                className="data-point"
              />
            ))}
          </svg>
          
          {/* X-axis labels */}
          <div className="chart-x-axis">
            {monthlyData.map((item, index) => (
              <div key={index} className="x-axis-label">
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