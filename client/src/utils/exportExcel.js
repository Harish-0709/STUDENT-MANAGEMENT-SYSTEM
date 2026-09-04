import * as XLSX from "xlsx";

const exportStudentsExcel = (students) => {

    const data = students.map((student) => ({

        "Student ID": student.studentId,
        "Name": student.name,
        "Department": student.department,
        "Year": student.year,
        "Email": student.email

    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Students"
    );

    XLSX.writeFile(
        workbook,
        "Student_Report.xlsx"
    );

};

export default exportStudentsExcel;