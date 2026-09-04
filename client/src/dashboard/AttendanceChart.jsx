import {
    Bar
} from "react-chartjs-2";

import {

    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend

} from "chart.js";

Chart.register(

    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend

);

function AttendanceChart({ attendance }) {

    let present = 0;
    let absent = 0;

    attendance.forEach(item => {

        if (item.status === "Present")
            present++;

        else
            absent++;

    });

    const data = {

        labels: [

            "Present",
            "Absent"

        ],

        datasets: [

            {

                label: "Attendance",

                data: [

                    present,
                    absent

                ]

            }

        ]

    };

    return <Bar data={data} />;

}

export default AttendanceChart;