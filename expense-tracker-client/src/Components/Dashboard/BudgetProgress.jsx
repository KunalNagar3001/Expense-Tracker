import React from "react";

const COLORS = {
  "Food & Dining": "#3B82F6",
  "Transportation": "#22C55E",
  "Entertainment": "#F59E42",
  "Shopping": "#EF4444",
  "Utilities": "#A78BFA",
};

const BudgetProgress = ({ budgets }) => (
  <div>
    {budgets.map(({ label, spent, budget }) => {
      const percent = Math.min((spent / budget) * 100, 100);
      return (
        <div key={label || "Unknown"} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 500 }}>
            <span style={{ color: 'black', fontSize: 16 }}>{label || "Unknown"}</span>
            <span style={{ color: 'black', fontSize: 16 }}>₹{spent.toFixed(2)} / ₹{budget.toFixed(2)}</span>
          </div>
          <div style={{ background: "#E5E7EB", borderRadius: 8, height: 8, marginTop: 6 }}>
            <div
              style={{
                width: `${percent}%`,
                background: COLORS[label] || "#6366F1",
                height: 8,
                borderRadius: 8,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

export default BudgetProgress;
