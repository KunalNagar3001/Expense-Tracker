import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#3B82F6", "#22C55E", "#F59E42", "#EF4444", "#A78BFA", "#6366F1", "#F472B6", "#FACC15"
];

const CategoryPieChart = ({ categories, centerLabel }) => {
  const data = {
    labels: categories.map(c => c.label),
    datasets: [
      {
        data: categories.map(c => c.value),
        backgroundColor: COLORS,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div style={{ width: 260, height: 260, margin: "0 auto", position: "relative" }}>
      <Doughnut
        data={data}
        options={{
          cutout: "70%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 24,
          color: "#22223b",
          pointerEvents: "none",
        }}
      >
        ${centerLabel?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}
        <div style={{ fontSize: 14, fontWeight: 400, color: "#6b7280" }}>This Month</div>
      </div>
    </div>
  );
};

export default CategoryPieChart;
