const axios = require('axios');

const testAdminLogin = async () => {
    try {
        console.log('🧪 Testing Admin Login...\n');
        
        // Test 1: Login with username "admin"
        console.log('Test 1: Login with username "admin"');
        try {
            const response = await axios.post('http://localhost:5000/api/admin/auth/login', {
                email: 'admin',
                password: 'password123'
            });
            
            if (response.data.success) {
                console.log('✅ SUCCESS: Logged in as Super Admin');
                console.log('   Admin Name:', response.data.admin.fullName);
                console.log('   Role:', response.data.admin.role.name);
                console.log('   Token:', response.data.token.substring(0, 20) + '...');
            }
        } catch (error) {
            console.log('❌ FAILED:', error.response?.data?.message || error.message);
        }
        
        console.log('\n---\n');
        
        // Test 2: Login with email format
        console.log('Test 2: Login with email "admin@obu.edu.et"');
        try {
            const response = await axios.post('http://localhost:5000/api/admin/auth/login', {
                email: 'admin@obu.edu.et',
                password: 'Admin@123'
            });
            
            if (response.data.success) {
                console.log('✅ SUCCESS: Logged in as Standard Admin');
                console.log('   Admin Name:', response.data.admin.fullName);
                console.log('   Role:', response.data.admin.role.name);
                console.log('   Token:', response.data.token.substring(0, 20) + '...');
            }
        } catch (error) {
            console.log('❌ FAILED:', error.response?.data?.message || error.message);
        }
        
        console.log('\n---\n');
        
        // Test 3: Invalid credentials
        console.log('Test 3: Invalid credentials (should fail)');
        try {
            const response = await axios.post('http://localhost:5000/api/admin/auth/login', {
                email: 'admin',
                password: 'wrongpassword'
            });
            
            console.log('❌ UNEXPECTED: Login should have failed');
        } catch (error) {
            console.log('✅ EXPECTED FAILURE:', error.response?.data?.message || error.message);
        }
        
        console.log('\n🎉 All tests completed!\n');
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
};

testAdminLogin();
