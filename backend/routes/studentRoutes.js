const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, getStudentByUniversityId, createStudent, updateStudent, deleteStudent, importStudents } = require('../controllers/studentController');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.route('/').get(getStudents).post(createStudent);
router.route('/import').post(upload.single('file'), importStudents);
router.route('/lookup').post(getStudentByUniversityId);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);

module.exports = router;
