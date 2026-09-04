const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./database/students.db", (err) => {
    if (err) {
        console.log("Database Connection Error:", err.message);
    } else {
        console.log("SQLite Database Connected");
    }
});

db.serialize(() => {
    // USERS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT
        )
    `);

    // ADMINS TABLE (for backward compatibility)
    db.run(`
        CREATE TABLE IF NOT EXISTS admins(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);

    // STUDENTS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS students(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId TEXT,
            name TEXT,
            department TEXT,
            year INTEGER,
            email TEXT,
            photo TEXT
        )
    `);

    // ATTENDANCE TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS attendance(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER,
            date TEXT,
            status TEXT,
            FOREIGN KEY(studentId) REFERENCES students(id)
        )
    `);

    // MARKS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS marks(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER,
            subject TEXT,
            marks INTEGER,
            FOREIGN KEY(studentId) REFERENCES students(id)
        )
    `);

    // LEAVES TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS leaves(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER,
            fromDate TEXT,
            toDate TEXT,
            reason TEXT,
            status TEXT DEFAULT 'Pending',
            FOREIGN KEY(studentId) REFERENCES students(id)
        )
    `);

    // ANNOUNCEMENTS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS announcements(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            message TEXT,
            createdAt TEXT
        )
    `);

    // FEES TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS fees(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER,
            semester INTEGER,
            totalFee INTEGER,
            paidAmount INTEGER,
            balance INTEGER,
            status TEXT,
            FOREIGN KEY(studentId) REFERENCES students(id)
        )
    `);

    // TIMETABLE TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS timetable(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department TEXT,
            year INTEGER,
            day TEXT,
            period1 TEXT,
            period2 TEXT,
            period3 TEXT,
            period4 TEXT,
            period5 TEXT,
            period6 TEXT
        )
    `);

    // BOOKS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS books(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bookName TEXT,
            author TEXT,
            isbn TEXT,
            quantity INTEGER
        )
    `);

    // EXAMS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS exams(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT,
            department TEXT,
            year INTEGER,
            examDate TEXT,
            examTime TEXT,
            hall TEXT
        )
    `);

    // ROOMS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS rooms(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roomNo TEXT UNIQUE,
            capacity INTEGER,
            rows INTEGER,
            columns INTEGER
        )
    `);

    // ALLOCATIONS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS allocations(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            examId INTEGER,
            studentId INTEGER,
            roomNo TEXT,
            rowNo INTEGER,
            columnNo INTEGER,
            FOREIGN KEY(examId) REFERENCES exams(id),
            FOREIGN KEY(studentId) REFERENCES students(id)
        )
    `);

    // EXAM PARTICIPANTS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS exam_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            examId INTEGER,
            department TEXT,
            year INTEGER,
            FOREIGN KEY(examId) REFERENCES exams(id)
        )
    `);

    // ASSIGNMENTS TABLE
    db.run(`
        CREATE TABLE IF NOT EXISTS assignments(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            subject TEXT,
            department TEXT,
            year INTEGER,
            dueDate TEXT,
            description TEXT
        )
    `);

    // SEED DEFAULT USERS (ADMIN, FACULTY, STUDENT)
    const seedUsers = async () => {
        const usersToSeed = [
            { username: "admin", pass: "admin123", role: "Admin" },
            { username: "faculty", pass: "faculty123", role: "Faculty" },
            { username: "student", pass: "student123", role: "Student" },
        ];

        for (const u of usersToSeed) {
            const row = await new Promise((res) => db.get("SELECT * FROM users WHERE username = ?", [u.username], (e, r) => res(r)));
            if (!row) {
                const hash = await bcrypt.hash(u.pass, 10);
                db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [u.username, hash, u.role]);
                console.log(`Seeded default ${u.role} user: ${u.username}`);
            }
        }
    };
    seedUsers();

    // SEED INITIAL STUDENTS IF NONE EXIST
    db.get("SELECT COUNT(*) as count FROM students", [], (err, row) => {
        if (!err && row && row.count === 0) {
            const defaultStudents = [
                ["STU2024001", "Alex Johnson", "CSE", 3, "alex.johnson@edu.com"],
                ["STU2024002", "Priya Sharma", "ECE", 2, "priya.sharma@edu.com"],
                ["STU2024003", "Rahul Verma", "CSE", 3, "rahul.verma@edu.com"],
                ["STU2024004", "Sneha Patel", "EEE", 1, "sneha.patel@edu.com"],
                ["STU2024005", "Michael Chen", "MECH", 4, "michael.chen@edu.com"],
            ];
            defaultStudents.forEach(s => {
                db.run("INSERT INTO students (studentId, name, department, year, email) VALUES (?, ?, ?, ?, ?)", s);
            });
            console.log("Seeded default students");
        }
    });

    // SEED INITIAL ROOMS IF NONE EXIST
    db.get("SELECT COUNT(*) as count FROM rooms", [], (err, row) => {
        if (!err && row && row.count === 0) {
            db.run("INSERT INTO rooms (roomNo, capacity, rows, columns) VALUES ('A101', 30, 5, 6)");
            db.run("INSERT INTO rooms (roomNo, capacity, rows, columns) VALUES ('B202', 36, 6, 6)");
            db.run("INSERT INTO rooms (roomNo, capacity, rows, columns) VALUES ('C303', 40, 8, 5)");
            console.log("Seeded default rooms");
        }
    });

    // SEED INITIAL ANNOUNCEMENTS IF NONE EXIST
    db.get("SELECT COUNT(*) as count FROM announcements", [], (err, row) => {
        if (!err && row && row.count === 0) {
            db.run("INSERT INTO announcements (title, message, createdAt) VALUES (?, ?, ?)", [
                "Mid-Term Examination Schedule",
                "Mid-term examinations will commence from next Monday. Please check the Exam Schedule section for your hall and timing details.",
                new Date().toISOString().split("T")[0]
            ]);
            db.run("INSERT INTO announcements (title, message, createdAt) VALUES (?, ?, ?)", [
                "Annual Tech Symposium 2026",
                "Registrations for the Annual Tech Symposium are now open. All departments are encouraged to submit project abstracts by Friday.",
                new Date().toISOString().split("T")[0]
            ]);
        }
    });

    // SEED INITIAL BOOKS IF NONE EXIST
    db.get("SELECT COUNT(*) as count FROM books", [], (err, row) => {
        if (!err && row && row.count === 0) {
            db.run("INSERT INTO books (bookName, author, isbn, quantity) VALUES ('Data Structures and Algorithms', 'Robert Lafore', '978-0672324536', 15)");
            db.run("INSERT INTO books (bookName, author, isbn, quantity) VALUES ('Operating System Concepts', 'Silberschatz & Galvin', '978-1118063330', 10)");
            db.run("INSERT INTO books (bookName, author, isbn, quantity) VALUES ('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0134610993', 8)");
            db.run("INSERT INTO books (bookName, author, isbn, quantity) VALUES ('Database System Concepts', 'Abraham Silberschatz', '978-0073523323', 12)");
        }
    });
});

module.exports = db;