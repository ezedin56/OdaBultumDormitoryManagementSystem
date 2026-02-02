const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const Room = require('../models/Room');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
    const students = await Student.find({}).populate('room');
    res.json(students);
});

// @desc    Get student by ID (MongoDB ID)
// @route   GET /api/students/:id
// @access  Private
const getStudentById = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id).populate('room');

    if (student) {
        res.json(student);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Get student by University ID (e.g., UGPR...)
// @route   POST /api/students/lookup
// @access  Public
const getStudentByUniversityId = asyncHandler(async (req, res) => {
    const { studentId } = req.body;

    // Case insensitive search
    const student = await Student.findOne({
        studentId: { $regex: new RegExp(`^${studentId}$`, 'i') }
    }).populate('room');

    if (student) {
        res.json(student);
    } else {
        res.status(404);
        throw new Error('Student placement not found');
    }
});

// @desc    Create new student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
    const { studentId, fullName, gender, department, year, phone } = req.body;

    const studentExists = await Student.findOne({ studentId });

    if (studentExists) {
        res.status(400);
        throw new Error('Student already exists');
    }

    const student = await Student.create({
        studentId,
        fullName,
        gender,
        department,
        year,
        phone,
    });

    if (student) {
        res.status(201).json(student);
    } else {
        res.status(400);
        throw new Error('Invalid student data');
    }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (student) {
        student.fullName = req.body.fullName || student.fullName;
        student.department = req.body.department || student.department;
        student.year = req.body.year || student.year;
        student.phone = req.body.phone || student.phone;

        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (student) {
        await student.deleteOne();
        res.json({ message: 'Student removed' });
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Import students from Excel
// @route   POST /api/students/import
// @access  Private/Admin
const importStudents = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const xlsx = require('xlsx');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
        res.status(400);
        throw new Error('Excel file is empty');
    }

    const importedStudents = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];

        try {
            // Expected columns: studentId, fullName, gender, department, year, phone
            const studentData = {
                studentId: row.studentId || row.StudentID || row['Student ID'],
                fullName: row.fullName || row.FullName || row['Full Name'],
                gender: row.gender || row.Gender,
                department: row.department || row.Department,
                year: parseInt(row.year || row.Year),
                phone: row.phone || row.Phone || '',
            };

            // Validate required fields
            if (!studentData.studentId || !studentData.fullName || !studentData.gender || !studentData.department || !studentData.year) {
                errors.push({ row: i + 2, error: 'Missing required fields', data: row });
                continue;
            }

            // Check if student already exists
            const existingStudent = await Student.findOne({ studentId: studentData.studentId });

            if (existingStudent) {
                // Update existing student
                existingStudent.fullName = studentData.fullName;
                existingStudent.gender = studentData.gender;
                existingStudent.department = studentData.department;
                existingStudent.year = studentData.year;
                existingStudent.phone = studentData.phone;
                await existingStudent.save();
                importedStudents.push({ ...studentData, updated: true });
            } else {
                // Create new student
                const newStudent = await Student.create(studentData);
                importedStudents.push({ ...studentData, updated: false });
            }
        } catch (error) {
            errors.push({ row: i + 2, error: error.message, data: row });
        }
    }

    res.json({
        success: true,
        imported: importedStudents.length,
        errors: errors.length,
        details: { importedStudents, errors }
    });
});

module.exports = {
    getStudents,
    getStudentById,
    getStudentByUniversityId,
    createStudent,
    updateStudent,
    deleteStudent,
    importStudents,
};
