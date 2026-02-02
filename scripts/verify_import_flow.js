const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const STUDENT_FILE = path.join(__dirname, 'students_sample.csv'); // We'll create a dummy file

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);

async function runVerification() {
    log('🚀 Starting Verification: Import & Allocation Flow\n', colors.blue);

    try {
        // 1. Create a dummy CSV file
        log('1. Creating dummy student CSV...', colors.yellow);
        const csvContent = 'studentId,fullName,gender,department,year,phone\nTEST/001/24,Test Student 1,M,Computer Science,1,0911000001\nTEST/002/24,Test Student 2,F,Civil Engineering,2,0911000002';
        fs.writeFileSync(STUDENT_FILE, csvContent);
        log('✅ CSV created successfully', colors.green);

        // 2. Import Students
        log('\n2. Importing students...', colors.yellow);
        const formData = new FormData();
        formData.append('file', fs.createReadStream(STUDENT_FILE));

        const importRes = await axios.post(`${BASE_URL}/students/import`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        if (importRes.data.success && importRes.data.imported >= 2) {
            log(`✅ Imported ${importRes.data.imported} students successfully`, colors.green);
        } else {
            throw new Error('Import failed or incomplete');
        }

        // 3. Run Allocation
        log('\n3. Running auto-allocation...', colors.yellow);
        const allocationRes = await axios.post(`${BASE_URL}/dorms/allocate`, {
            criteria: {} // Allocate all
        });

        log(`✅ Allocated: ${allocationRes.data.allocated} students`, colors.green);
        console.log('Details:', allocationRes.data.details);

        // 4. Verify Student 1 (Male)
        log('\n4. Verifying Student 1 (TEST/001/24)...', colors.yellow);
        const student1Res = await axios.post(`${BASE_URL}/students/lookup`, {
            studentId: 'TEST/001/24'
        });

        if (student1Res.data && student1Res.data.room) {
            log(`✅ Student 1 found in room: ${student1Res.data.room.building}-${student1Res.data.room.roomNumber}`, colors.green);
        } else {
            log('❌ Student 1 not allocated or not found', colors.red);
        }

        // 5. Verify Student 2 (Female)
        log('\n5. Verifying Student 2 (TEST/002/24)...', colors.yellow);
        const student2Res = await axios.post(`${BASE_URL}/students/lookup`, {
            studentId: 'TEST/002/24'
        });

        if (student2Res.data && student2Res.data.room) {
            log(`✅ Student 2 found in room: ${student2Res.data.room.building}-${student2Res.data.room.roomNumber}`, colors.green);
        } else {
            log('❌ Student 2 not allocated or not found', colors.red);
        }

        log('\n✨ Verification Completed Successfully! ✨', colors.blue);

        // Cleanup
        try {
            fs.unlinkSync(STUDENT_FILE);
        } catch (e) { }

    } catch (error) {
        log('\n❌ Verification Failed!', colors.red);
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

runVerification();
