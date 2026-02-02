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

module.exports = {
    getStudents,
    getStudentById,
    getStudentByUniversityId,
    createStudent,
    updateStudent,
    deleteStudent,
};
