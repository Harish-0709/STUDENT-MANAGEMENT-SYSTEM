import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const DEPARTMENT_COLORS = {
    CSE: "#3b82f6",    // Blue
    ECE: "#10b981",    // Emerald
    EEE: "#f59e0b",    // Amber
    MECH: "#ef4444",   // Red
    CIVIL: "#8b5cf6",  // Purple
    IT: "#06b6d4",     // Cyan
    AI: "#ec4899",     // Pink
    AIML: "#ec4899",   // Pink
    DS: "#6366f1",     // Indigo
    CHEM: "#14b8a6",   // Teal
    AUTO: "#f97316",   // Orange
};

const FALLBACK_PALETTE = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#ec4899", "#6366f1", "#f97316", "#14b8a6"
];

function getDepartmentColor(deptName, index) {
    if (!deptName) return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
    const upper = String(deptName).trim().toUpperCase();
    if (DEPARTMENT_COLORS[upper]) return DEPARTMENT_COLORS[upper];
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
                borderRadius: 6,
            }
        ]
    };

    return (
        <div className="bg-white shadow rounded p-5">
            <h2 className="text-xl font-bold mb-4">
                Students by Department
            </h2>
            <Bar data={data} />
        </div>
    );
}

export default DepartmentChart;