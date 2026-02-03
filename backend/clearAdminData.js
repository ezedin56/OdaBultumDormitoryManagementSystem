const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Role = require('./models/Role');
const ActivityLog = require('./models/ActivityLog');
const LoginHistory = require('./models/LoginHistory');
const SecuritySettings = require('./models/SecuritySettings');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const clearAdminData = async () => {
    try {
        await connectDB();
        
        console.log('🗑️  Clearing Admin Management System Data...\n');
        
        // Delete all admins
        const adminCount = await Admin.countDocuments();
        await Admin.deleteMany({});
        console.log(`✅ Deleted ${adminCount} admin(s)`);
        
        // Delete all roles
        const roleCount = await Role.countDocuments();
        await Role.deleteMany({});
        console.log(`✅ Deleted ${roleCount} role(s)`);
        
        // Delete all activity logs
        const activityCount = await ActivityLog.countDocuments();
        await ActivityLog.deleteMany({});
        console.log(`✅ Deleted ${activityCount} activity log(s)`);
        
        // Delete all login history
        const loginCount = await LoginHistory.countDocuments();
        await LoginHistory.deleteMany({});
        console.log(`✅ Deleted ${loginCount} login history record(s)`);
        
        // Delete security settings
        const settingsCount = await SecuritySettings.countDocuments();
        await SecuritySettings.deleteMany({});
        console.log(`✅ Deleted ${settingsCount} security settings`);
        
        console.log('\n🎉 All admin management data cleared successfully!\n');
        console.log('📝 Summary:');
        console.log(`   - ${adminCount} Admins removed`);
        console.log(`   - ${roleCount} Roles removed`);
        console.log(`   - ${activityCount} Activity logs removed`);
        console.log(`   - ${loginCount} Login history records removed`);
        console.log(`   - ${settingsCount} Security settings removed`);
        console.log('\n💡 The admin management system is now empty.');
        console.log('   Run "npm run seed-admin" to recreate default data.\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing admin data:', error);
        process.exit(1);
    }
};

clearAdminData();
