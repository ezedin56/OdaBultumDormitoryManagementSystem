const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const Room = require('../models/Room');
const SystemSettings = require('../models/SystemSettings');

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

// @desc    Get student by University ID (e.g., OBU/001/2023)
// @route   POST /api/students/lookup
// @access  Public
const getStudentByUniversityId = asyncHandler(async (req, res) => {
    const { studentId } = req.body;

    // Check if system is in maintenance mode
    const settings = await SystemSettings.findOne();
    if (settings && settings.maintenanceMode) {
        res.status(503);
        throw new Error('System is currently under maintenance. Dorm placement lookup is temporarily unavailable. Please try again later.');
    }

    // Case insensitive search
    const student = await Student.findOne({
        studentId: { $regex: new RegExp(`^${studentId}`, 'i') }
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

// @desc    Delete all students
// @route   DELETE /api/students/bulk/all
// @access  Private/Admin
const deleteAllStudents = asyncHandler(async (req, res) => {
    console.log('🗑️ Deleting all students...');
    
    const result = await Student.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} students`);
    
    res.json({ 
        success: true,
        message: `Successfully deleted ${result.deletedCount} students`,
        deletedCount: result.deletedCount 
    });
});

// @desc    Import students from Excel or CSV
// @route   POST /api/students/import
// @access  Private/Admin
const importStudents = asyncHandler(async (req, res) => {
    console.log('📥 Import request received');
    
    if (!req.file) {
        console.log('❌ No file uploaded');
        res.status(400);
        throw new Error('No file uploaded');
    }

    console.log('📄 File details:', {
        name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
    });

    const xlsx = require('xlsx');
    let data;

    try {
        // Check file extension
        const fileName = req.file.originalname.toLowerCase();
        
        if (fileName.endsWith('.csv')) {
            console.log('📊 Processing CSV file');
            // Handle CSV file
            const csvContent = req.file.buffer.toString('utf-8');
            const workbook = xlsx.read(csvContent, { type: 'string' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
        } else {
            console.log('📊 Processing Excel file');
            // Handle Excel file
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            console.log('📋 Sheet name:', sheetName);
            const sheet = workbook.Sheets[sheetName];
            data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
        }
        
        console.log('✅ File parsed successfully');
        console.log('📊 Total rows found:', data.length);
        
        if (data.length > 0) {
            console.log('📋 First row columns:', Object.keys(data[0]));
            console.log('📋 First row sample:', data[0]);
        }
    } catch (parseError) {
        console.error('❌ Parse error:', parseError);
        res.status(400);
        throw new Error('Failed to parse file: ' + parseError.message);
    }

    if (!data || data.length === 0) {
        console.log('❌ No data found in file');
        res.status(400);
        throw new Error('File is empty or has no valid data');
    }

    const importedStudents = [];
    const errors = [];
    
    console.log('🔄 Starting to process rows...');

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        console.log(`\n--- Processing Row ${i + 1} ---`);
        console.log('Raw row data:', JSON.stringify(row, null, 2));

        try {
            // More flexible column name matching (case-insensitive, with spaces/underscores)
            const getColumnValue = (row, ...possibleNames) => {
                for (const name of possibleNames) {
                    // Try exact match
                    if (row[name] !== undefined && row[name] !== '') return row[name];
                    
                    // Try case-insensitive match
                    const key = Object.keys(row).find(k => 
                        k.toLowerCase().replace(/[_\s]/g, '') === name.toLowerCase().replace(/[_\s]/g, '')
                    );
                    if (key && row[key] !== undefined && row[key] !== '') return row[key];
                }
                return null;
            };

            const studentData = {
                studentId: getColumnValue(row, 'ID', 'studentId', 'StudentID', 'Student ID', 'student_id', 'id', 'Student Id', 'STUDENT ID'),
                fullName: getColumnValue(row, 'English Name', 'English name', 'english name', 'ENGLISH NAME', 'fullName', 'FullName', 'Full Name', 'full_name', 'Name', 'name', 'FULL NAME', 'Student Name', 'StudentName', 'student_name', 'STUDENT NAME'),
                gender: getColumnValue(row, 'S', 's', 'gender', 'Gender', 'Sex', 'sex', 'GENDER', 'SEX'),
                department: getColumnValue(row, 'Dept', 'dept', 'DEPT', 'department', 'Department', 'DEPARTMENT'),
                year: getColumnValue(row, 'Year', 'year', 'YEAR', 'Level', 'level', 'LEVEL', 'Year Level', 'year_level'),
                phone: getColumnValue(row, 'phone', 'Phone', 'PhoneNumber', 'Phone Number', 'phone_number', 'Contact', 'contact', 'PHONE', 'CONTACT', 'Mobile', 'mobile', 'Tel', 'tel'),
                listNumber: getColumnValue(row, 'No', 'no', 'NO', 'Number', 'number', 'NUMBER', 'List Number', 'list_number', 'ListNumber', 'LIST NUMBER', 'List No', 'list_no', 'LIST NO', '#', 'S/N', 's/n', 'SN', 'sn', 'Serial', 'serial', 'SERIAL', 'Order', 'order', 'ORDER'),
            };

            // Check if fullName is empty, try to construct from separate name columns
            if (!studentData.fullName) {
                const firstName = getColumnValue(row, 'First Name', 'FirstName', 'first_name', 'firstname', 'FIRST NAME', 'First name', 'first name', 'Given Name', 'given_name', 'GIVEN NAME');
                const middleName = getColumnValue(row, 'Middle Name', 'MiddleName', 'middle_name', 'middlename', 'MIDDLE NAME', 'Middle name', 'middle name', 'Father Name', 'father_name', 'FATHER NAME', 'Fathers Name', 'fathers_name');
                const lastName = getColumnValue(row, 'Last Name', 'LastName', 'last_name', 'lastname', 'LAST NAME', 'Last name', 'last name', 'Surname', 'surname', 'SURNAME', 'Family Name', 'family_name', 'FAMILY NAME', 'Grand Father Name', 'grandfather_name', 'GRAND FATHER NAME');
                
                // Construct full name from parts
                const nameParts = [firstName, middleName, lastName].filter(part => part && part.trim());
                if (nameParts.length > 0) {
                    studentData.fullName = nameParts.join(' ');
                    console.log(`✅ Constructed full name from parts: ${studentData.fullName}`);
                }
            }

            console.log(`Row ${i + 1} extracted:`, studentData);

            // Validate required fields
            if (!studentData.studentId || !studentData.fullName || !studentData.gender || !studentData.department || !studentData.year) {
                console.log(`❌ Row ${i + 2}: Missing required fields`);
                errors.push({ 
                    row: i + 2, 
                    error: 'Missing required fields (need: ID, Name, Gender, Department, Year)', 
                    data: row,
                    extracted: studentData 
                });
                continue;
            }

            // Parse year - handle '1st', '2nd', '3rd', '4th', '5th' or just numbers
            let yearValue = String(studentData.year).toLowerCase().trim();
            if (yearValue.includes('1st') || yearValue.includes('1') || yearValue === 'first') {
                studentData.year = 1;
            } else if (yearValue.includes('2nd') || yearValue.includes('2') || yearValue === 'second') {
                studentData.year = 2;
            } else if (yearValue.includes('3rd') || yearValue.includes('3') || yearValue === 'third') {
                studentData.year = 3;
            } else if (yearValue.includes('4th') || yearValue.includes('4') || yearValue === 'fourth') {
                studentData.year = 4;
            } else if (yearValue.includes('5th') || yearValue.includes('5') || yearValue === 'fifth') {
                studentData.year = 5;
            } else if (yearValue.includes('6th') || yearValue.includes('6') || yearValue === 'sixth') {
                studentData.year = 6;
            } else if (yearValue.includes('7th') || yearValue.includes('7') || yearValue === 'seventh') {
                studentData.year = 7;
            } else {
                studentData.year = parseInt(yearValue);
            }
            
            if (isNaN(studentData.year) || studentData.year < 1 || studentData.year > 7) {
                console.log(`❌ Row ${i + 2}: Invalid year: ${yearValue}`);
                errors.push({ row: i + 2, error: `Invalid year value: ${yearValue}`, data: row });
                continue;
            }

            // Convert phone to string (optional field)
            studentData.phone = studentData.phone ? String(studentData.phone) : '';

            // Parse list number (optional field)
            if (studentData.listNumber) {
                const listNum = parseInt(studentData.listNumber);
                if (!isNaN(listNum) && listNum > 0) {
                    studentData.listNumber = listNum;
                    console.log(`✅ List number: ${listNum}`);
                } else {
                    console.log(`⚠️ Invalid list number: ${studentData.listNumber}, skipping`);
                    studentData.listNumber = null;
                }
            } else {
                studentData.listNumber = null;
            }

            // Normalize gender (accept M/F or Male/Female)
            const genderStr = String(studentData.gender).toUpperCase();
            if (genderStr.startsWith('M') || genderStr === 'M') {
                studentData.gender = 'M';
            } else if (genderStr.startsWith('F') || genderStr === 'F') {
                studentData.gender = 'F';
            } else {
                console.log(`❌ Row ${i + 2}: Invalid gender: ${studentData.gender}`);
                errors.push({ row: i + 2, error: 'Invalid gender (must be M/F or Male/Female)', data: row });
                continue;
            }

            // Check if student already exists
            const existingStudent = await Student.findOne({ studentId: studentData.studentId });

            if (existingStudent) {
                console.log(`🔄 Updating existing student: ${studentData.studentId}`);
                // Update existing student
                existingStudent.fullName = studentData.fullName;
                existingStudent.gender = studentData.gender;
                existingStudent.department = studentData.department;
                existingStudent.year = studentData.year;
                existingStudent.phone = studentData.phone;
                if (studentData.listNumber !== null) {
                    existingStudent.listNumber = studentData.listNumber;
                }
                await existingStudent.save();
                importedStudents.push({ ...studentData, updated: true });
            } else {
                console.log(`✅ Creating new student: ${studentData.studentId}`);
                // Create new student
                await Student.create(studentData);
                importedStudents.push({ ...studentData, updated: false });
            }
        } catch (error) {
            console.error(`❌ Error processing row ${i + 2}:`, error);
            errors.push({ row: i + 2, error: error.message, data: row });
        }
    }

    console.log(`✅ Import complete: ${importedStudents.length} imported, ${errors.length} errors`);
    
    if (errors.length > 0) {
        console.log('\n❌ ERRORS FOUND:');
        errors.slice(0, 5).forEach(err => {
            console.log(`Row ${err.row}:`, err.error);
            console.log('Data:', err.data);
            if (err.extracted) {
                console.log('Extracted:', err.extracted);
            }
        });
        if (errors.length > 5) {
            console.log(`... and ${errors.length - 5} more errors`);
        }
    }

    res.json({
        success: true,
        imported: importedStudents.length,
        errors: errors.length,
        details: { importedStudents, errors }
    });
});

// @desc    Generate PDF report for students by gender
// @route   GET /api/students/report/pdf
// @access  Private/Admin
const generatePDFReport = asyncHandler(async (req, res) => {
    try {
        const PDFDocument = require('pdfkit');
        const { gender, department, building, block, roomNumber, year } = req.query;
        
        console.log('PDF Report Request - Filters:', { gender, department, building, block, roomNumber, year });
        
        // Build query based on filters
        const query = {};
        if (gender) query.gender = gender;
        if (department) query.department = department;
        if (year) query.year = parseInt(year);
        
        console.log('Student Query:', query);
        
        // Fetch students with room population
        let students = await Student.find(query).populate('room').sort({ listNumber: 1, studentId: 1 });
        
        console.log(`Found ${students.length} students before room filtering`);
        
        // Apply room-based filters after population
        if (building || block || roomNumber) {
            students = students.filter(student => {
                if (!student.room) return false;
                if (building && student.room.building !== building) return false;
                if (block && student.room.block !== block) return false;
                if (roomNumber && student.room.roomNumber !== roomNumber) return false;
                return true;
            });
        }
        
        console.log(`Found ${students.length} students after room filtering`);
        
        // Sort students by room assignment: building → block → room number → list number
        students.sort((a, b) => {
            // Students without rooms go to the end
            if (!a.room && !b.room) return 0;
            if (!a.room) return 1;
            if (!b.room) return -1;
            
            // Sort by building
            const buildingCompare = (a.room.building || '').localeCompare(b.room.building || '');
            if (buildingCompare !== 0) return buildingCompare;
            
            // Sort by block
            const blockCompare = (a.room.block || '').localeCompare(b.room.block || '');
            if (blockCompare !== 0) return blockCompare;
            
            // Sort by room number (convert to number if possible)
            const roomA = parseInt(a.room.roomNumber) || a.room.roomNumber;
            const roomB = parseInt(b.room.roomNumber) || b.room.roomNumber;
            if (typeof roomA === 'number' && typeof roomB === 'number') {
                if (roomA !== roomB) return roomA - roomB;
            } else {
                const roomCompare = String(roomA).localeCompare(String(roomB));
                if (roomCompare !== 0) return roomCompare;
            }
            
            // Finally sort by list number, then student ID
            if (a.listNumber && b.listNumber) {
                if (a.listNumber !== b.listNumber) return a.listNumber - b.listNumber;
            } else if (a.listNumber) {
                return -1;
            } else if (b.listNumber) {
                return 1;
            }
            
            return (a.studentId || '').localeCompare(b.studentId || '');
        });
        
        if (students.length === 0) {
            console.log('No students found matching filters');
            return res.status(404).json({ message: 'No students found matching the filters' });
        }

        // Build report title based on filters
        let reportTitle = 'Student Dorm Assignment Report';
        const filters = [];
        if (gender) filters.push(gender === 'M' ? 'Male' : 'Female');
        if (department) filters.push(department);
        if (building) filters.push(`Building: ${building}`);
        if (block) filters.push(`Block: ${block}`);
        if (roomNumber) filters.push(`Room: ${roomNumber}`);
        if (year) filters.push(`Year ${year}`);
        if (filters.length > 0) reportTitle += ` (${filters.join(', ')})`;

        // Create a new PDF document
        const doc = new PDFDocument({ 
            margin: 50, 
            size: 'A4',
            bufferPages: true
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=students_${gender || 'all'}_report.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Function to add header on each page
        const addHeader = (isFirstPage = false) => {
            const currentY = doc.y;
            doc.fontSize(18).font('Helvetica-Bold').text('ODA BULTUM UNIVERSITY', { align: 'center' });
            doc.fontSize(14).font('Helvetica-Bold').text('STUDENT DORM ASSIGNMENT', { align: 'center' });
            if (isFirstPage) {
                doc.moveDown(0.3);
                doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
            }
            doc.moveDown(1);
            return doc.y;
        };
        
        // Add header on first page
        addHeader(true);
        
        // Table setup
        let yPosition = doc.y;
        const rowHeight = 25;
        const colWidths = [40, 150, 100, 120, 100];
        const colPositions = [50, 90, 240, 340, 460];
        
        // Draw table header
        doc.fontSize(10).font('Helvetica-Bold');
        doc.rect(50, yPosition, 510, rowHeight).fillAndStroke('#3b82f6', '#3b82f6');
        doc.fillColor('white');
        doc.text('No.', colPositions[0], yPosition + 8, { width: colWidths[0], align: 'center' });
        doc.text('Student Name', colPositions[1], yPosition + 8, { width: colWidths[1] });
        doc.text('Student ID', colPositions[2], yPosition + 8, { width: colWidths[2] });
        doc.text('Department', colPositions[3], yPosition + 8, { width: colWidths[3] });
        doc.text('Room Number', colPositions[4], yPosition + 8, { width: colWidths[4] });
        
        yPosition += rowHeight;
        
        // Draw table rows
        doc.font('Helvetica').fillColor('black');
        
        students.forEach((student, index) => {
            // Check if we need a new page
            if (yPosition > 720) {
                doc.addPage();
                
                // Add header on new page
                addHeader(false);
                yPosition = doc.y;
                
                // Redraw table header on new page
                doc.fontSize(10).font('Helvetica-Bold');
                doc.rect(50, yPosition, 510, rowHeight).fillAndStroke('#3b82f6', '#3b82f6');
                doc.fillColor('white');
                doc.text('No.', colPositions[0], yPosition + 8, { width: colWidths[0], align: 'center' });
                doc.text('Student Name', colPositions[1], yPosition + 8, { width: colWidths[1] });
                doc.text('Student ID', colPositions[2], yPosition + 8, { width: colWidths[2] });
                doc.text('Department', colPositions[3], yPosition + 8, { width: colWidths[3] });
                doc.text('Room Number', colPositions[4], yPosition + 8, { width: colWidths[4] });
                
                yPosition += rowHeight;
                doc.font('Helvetica').fillColor('black');
            }
            
            const roomNumber = student.room ? `${student.room.building}-${student.room.roomNumber}` : 'Not Assigned';
            
            // Alternate row colors
            if (index % 2 === 0) {
                doc.rect(50, yPosition, 510, rowHeight).fillAndStroke('#f9fafb', '#e5e7eb');
            } else {
                doc.rect(50, yPosition, 510, rowHeight).stroke('#e5e7eb');
            }
            
            doc.fillColor('black').fontSize(9);
            doc.text(index + 1, colPositions[0], yPosition + 8, { width: colWidths[0], align: 'center' });
            doc.text(student.fullName || 'N/A', colPositions[1], yPosition + 8, { width: colWidths[1], ellipsis: true });
            doc.text(student.studentId || 'N/A', colPositions[2], yPosition + 8, { width: colWidths[2], ellipsis: true });
            doc.text(student.department || 'N/A', colPositions[3], yPosition + 8, { width: colWidths[3], ellipsis: true });
            doc.text(roomNumber, colPositions[4], yPosition + 8, { width: colWidths[4], ellipsis: true });
            
            yPosition += rowHeight;
        });
        
        // Add footer
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica-Bold').text(`Total Students: ${students.length}`, { align: 'center' });
        doc.fontSize(8).font('Helvetica').text(`© ${new Date().getFullYear()} Oda Bultum University - Dormitory Management System`, { align: 'center' });
        
        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ message: 'Error generating PDF: ' + error.message });
    }
});

// @desc    Generate CSV report for students by gender
// @route   GET /api/students/report/csv
// @access  Private/Admin
const generateCSVReport = asyncHandler(async (req, res) => {
    const { gender, department, building, block, roomNumber, year } = req.query;
    
    // Build query based on filters
    const query = {};
    if (gender) query.gender = gender;
    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    
    // Fetch students with room population
    let students = await Student.find(query).populate('room').sort({ listNumber: 1, studentId: 1 });
    
    // Apply room-based filters after population
    if (building || block || roomNumber) {
        students = students.filter(student => {
            if (!student.room) return false;
            if (building && student.room.building !== building) return false;
            if (block && student.room.block !== block) return false;
            if (roomNumber && student.room.roomNumber !== roomNumber) return false;
            return true;
        });
    }
    
    // Sort students by room assignment: building → block → room number → list number
    students.sort((a, b) => {
        // Students without rooms go to the end
        if (!a.room && !b.room) return 0;
        if (!a.room) return 1;
        if (!b.room) return -1;
        
        // Sort by building
        const buildingCompare = (a.room.building || '').localeCompare(b.room.building || '');
        if (buildingCompare !== 0) return buildingCompare;
        
        // Sort by block
        const blockCompare = (a.room.block || '').localeCompare(b.room.block || '');
        if (blockCompare !== 0) return blockCompare;
        
        // Sort by room number (convert to number if possible)
        const roomA = parseInt(a.room.roomNumber) || a.room.roomNumber;
        const roomB = parseInt(b.room.roomNumber) || b.room.roomNumber;
        if (typeof roomA === 'number' && typeof roomB === 'number') {
            if (roomA !== roomB) return roomA - roomB;
        } else {
            const roomCompare = String(roomA).localeCompare(String(roomB));
            if (roomCompare !== 0) return roomCompare;
        }
        
        // Finally sort by list number, then student ID
        if (a.listNumber && b.listNumber) {
            if (a.listNumber !== b.listNumber) return a.listNumber - b.listNumber;
        } else if (a.listNumber) {
            return -1;
        } else if (b.listNumber) {
            return 1;
        }
        
        return (a.studentId || '').localeCompare(b.studentId || '');
    });
    
    if (students.length === 0) {
        res.status(404);
        throw new Error('No students found matching the filters');
    }

    // Create CSV content
    let csv = 'No.,Student Name,Student ID,Department,Room Number\n';
    
    students.forEach((student, index) => {
        const roomNum = student.room ? `${student.room.building}-${student.room.roomNumber}` : 'Not Assigned';
        csv += `${index + 1},"${student.fullName}","${student.studentId}","${student.department}","${roomNum}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=students_${gender || 'all'}_report.csv`);
    res.send(csv);
});

module.exports = {
    getStudents,
    getStudentById,
    getStudentByUniversityId,
    createStudent,
    updateStudent,
    deleteStudent,
    deleteAllStudents,
    importStudents,
    generatePDFReport,
    generateCSVReport,
};
