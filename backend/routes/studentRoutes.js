const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, getStudentByUniversityId, createStudent, updateStudent, deleteStudent, importStudents, generatePDFReport, generateCSVReport } = require('../controllers/studentController');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.route('/').get(getStudents).post(createStudent);
router.route('/import').post(upload.single('file'), (req, res, next) => {
    console.log('🔍 Import route hit');
    console.log('📦 Request body:', req.body);
    console.log('📎 File:', req.file ? 'File received' : 'No file');
    if (req.file) {
        console.log('📄 File details:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    }
    next();
}, importStudents);
router.route('/lookup').post(getStudentByUniversityId);
router.route('/report/pdf').get(generatePDFReport);
router.route('/report/csv').get(generateCSVReport);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);

module.exports = router;
