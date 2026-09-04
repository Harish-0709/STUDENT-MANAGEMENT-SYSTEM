import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const exportStudentsPDF = (students) => {

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Student Management Report", 14, 20);

    const tableColumn = [

        "Student ID",
        "Name",
        "Department",
        "Year",
        "Email"

    ];

    const tableRows = [];

    students.forEach((student) => {

        tableRows.push([

            student.studentId,
            student.name,
            student.department,
            student.year,
            student.email

        ]);

    });

    autoTable(doc, {

        head: [tableColumn],

        body: tableRows,

        startY: 30

    });

    doc.save("Student_Report.pdf");

};

export default exportStudentsPDF;