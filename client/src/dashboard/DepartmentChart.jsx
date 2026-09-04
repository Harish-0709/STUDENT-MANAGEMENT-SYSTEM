import {
    Pie
} from "react-chartjs-2";

import {
    Chart,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

Chart.register(
    ArcElement,
    Tooltip,
    Legend
);

// Map of standard department codes to distinct, modern HSL/HEX colors
const DEPARTMENT_COLORS = {
    CSE: "#3b82f6",    // Blue
    ECE: "#10b981",    // Emerald / Green
    EEE: "#f59e0b",    // Amber / Yellow
    MECH: "#ef4444",   // Red / Rose
    CIVIL: "#8b5cf6",  // Purple / Violet
    IT: "#06b6d4",     // Cyan
    AI: "#ec4899",     // Pink
    AIML: "#ec4899",   // Pink
    DS: "#6366f1",     // Indigo
    CHEM: "#14b8a6",   // Teal
    AUTO: "#f97316",   // Orange
};

// Fallback palette for non-standard or dynamic department names
const FALLBACK_PALETTE = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#ec4899", "#6366f1", "#f97316", "#14b8a6"
];

function getDepartmentColor(deptName, index) {
    if (!deptName) return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
    const upper = String(deptName).trim().toUpperCase();
    if (DEPARTMENT_COLORS[upper]) {
        return DEPARTMENT_COLORS[upper];
    }
    return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
}

function DepartmentChart({ students = [] }) {
    const departments = {};

    students.forEach(student => {
        const dept = student.department || "Unassigned";
        departments[dept] = (departments[dept] || 0) + 1;
    });

    const labels = Object.keys(departments);
    const dataValues = Object.values(departments);
    const backgroundColors = labels.map((dept, idx) => getDepartmentColor(dept, idx));

    const data = {
        labels: labels,
        datasets: [
            {
                label: "Students",
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: "#ffffff",
                borderWidth: 2,
                hoverOffset: 8,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    font: {
                        family: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
                        size: 12,
                        weight: 500
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || "";
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return ` ${label}: ${value} student${value !== 1 ? "s" : ""} (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <div style={{ height: "280px", position: "relative", padding: "8px 0" }}>
            <Pie data={data} options={options} />
        </div>
    );
}

export default DepartmentChart;