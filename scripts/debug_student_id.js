const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';

const TARGET_ID = 'RU0001/18'; // The ID from the screenshot

async function debugSpecificStudent() {
    try {
        console.log(`🔍 Searching for student: "${TARGET_ID}"...`);

        // 1. Try exact lookup via the public endpoint
        try {
            const res = await axios.post(`${BASE_URL}/students/lookup`, { studentId: TARGET_ID });
            console.log('✅ Found via Lookup Endpoint:', res.data);
        } catch (e) {
            console.log('❌ Lookup Endpoint returned error:', e.response?.data || e.message);
        }

        // 2. Try fetching ALL students and searching manually (to catch whitespace/format issues)
        console.log('\n2. Fetching all students to check for partial matches...');
        const allRes = await axios.get(`${BASE_URL}/students`);
        const allStudents = allRes.data;

        const strictMatch = allStudents.find(s => s.studentId === TARGET_ID);
        const looseMatch = allStudents.find(s => s.studentId.trim().toLowerCase() === TARGET_ID.toLowerCase());
        const partialMatch = allStudents.find(s => s.studentId.includes('RU0001'));

        if (strictMatch) {
            console.log('✅ Found EXACT match in DB list:', strictMatch);
        } else if (looseMatch) {
            console.log('⚠️ Found LOOSE match (case/whitespace diff):', looseMatch);
            console.log(`   DB Value: '${looseMatch.studentId}' vs Input: '${TARGET_ID}'`);
        } else if (partialMatch) {
            console.log('⚠️ Found PARTIAL match:', partialMatch);
            console.log(`   DB Value: '${partialMatch.studentId}'`);
        } else {
            console.log('❌ Student absolutely NOT found in DB list.');
            // Print a few IDs to see format
            console.log('   Sample IDs in DB:', allStudents.slice(0, 3).map(s => s.studentId));
        }

    } catch (error) {
        console.error('❌ Script Error:', error.message);
    }
}

debugSpecificStudent();
