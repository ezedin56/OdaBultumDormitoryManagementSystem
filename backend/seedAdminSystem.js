const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Role = require('./models/Role');
const SecuritySettings = require('./models/SecuritySettings');
const { getAllPermissions } = require('./utils/permissions');

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

const seedAdminSystem = async () => {
    try {
        await connectDB();
        
        console.log('🌱 Seeding Admin Management System...\n');
        
        // 1. Create Security Settings
        console.log('📋 Creating default security settings...');
        await SecuritySettings.deleteMany({});
        await SecuritySettings.create({
            passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                passwordExpiryDays: 90
            },
            loginSecurity: {
                maxLoginAttempts: 5,
                lockoutDurationMinutes: 120,
                sessionTimeoutMinutes: 60,
                require2FA: false
            },
            ipRestrictions: {
                enabled: false,
                allowedIPs: [],
                blockedIPs: []
            }
        });
        console.log('✅ Security settings created\n');
        
        // 2. Create Roles
        console.log('👥 Creating default roles...');
        await Role.deleteMany({});
        
        const allPermissions = getAllPermissions();
        
        const superAdminRole = await Role.create({
            name: 'Super Admin',
            description: 'Full system access with all permissions',
            permissions: ['*'],
            isSystemRole: true
        });
        console.log('✅ Super Admin role created');
        
        const adminRole = await Role.create({
            name: 'Admin',
            description: 'Standard admin with most permissions',
            permissions: allPermissions.filter(p => 
                !p.includes('admins.delete') && 
                !p.includes('security.manage') &&
                p !== '*'
            ),
            isSystemRole: true
        });
        console.log('✅ Admin role created');
        
        const viewerRole = await Role.create({
            name: 'Viewer',
            description: 'Read-only access to most modules',
            permissions: allPermissions.filter(p => p.includes('.view')),
            isSystemRole: true
        });
        console.log('✅ Viewer role created\n');
        
        // 3. Create Super Admin User
        console.log('👤 Creating super admin user...');
        await Admin.deleteMany({});
        
        // Check if the existing User model admin exists
        const User = require('./models/User');
        const existingAdmin = await User.findOne({ username: 'admin' });
        
        let superAdminUserId = null;
        if (existingAdmin) {
            superAdminUserId = existingAdmin._id;
            console.log('✅ Found existing admin user (username: admin)');
        }
        
        const superAdmin = await Admin.create({
            fullName: 'System Administrator',
            email: 'admin',
            password: 'password123',
            phone: '+251-911-000-000',
            department: 'IT Department',
            role: superAdminRole._id,
            status: 'Active',
            createdBy: superAdminUserId
        });
        console.log('✅ Super admin created');
        console.log('   Username: admin');
        console.log('   Password: password123');
        console.log('   Note: Login with username "admin" and password "password123"\n');
        
        // 4. Create sample admins
        console.log('👥 Creating sample admins...');
        
        await Admin.create({
            fullName: 'OBU Admin',
            email: 'admin@obu.edu.et',
            password: 'Admin@123',
            phone: '+251-911-111-111',
            department: 'Student Affairs',
            role: adminRole._id,
            status: 'Active',
            createdBy: superAdmin._id
        });
        console.log('✅ Sample admin 1 created (admin@obu.edu.et) - Standard Admin role');
        
        await Admin.create({
            fullName: 'John Doe',
            email: 'john@obu.edu.et',
            password: 'Admin@123',
            phone: '+251-911-222-222',
            department: 'Dormitory Management',
            role: adminRole._id,
            status: 'Active',
            createdBy: superAdmin._id
        });
        console.log('✅ Sample admin 2 created (john@obu.edu.et) - Standard Admin role');
        
        await Admin.create({
            fullName: 'Jane Smith',
            email: 'jane@obu.edu.et',
            password: 'Admin@123',
            phone: '+251-911-333-333',
            department: 'IT Support',
            role: viewerRole._id,
            status: 'Active',
            createdBy: superAdmin._id
        });
        console.log('✅ Sample admin 3 created (jane@obu.edu.et) - Viewer role\n');
        
        console.log('🎉 Admin Management System seeded successfully!\n');
        console.log('📝 Summary:');
        console.log('   - 3 Roles created (Super Admin, Admin, Viewer)');
        console.log('   - 4 Admins created');
        console.log('   - Security settings initialized');
        console.log('\n🔐 Login Credentials:');
        console.log('   Super Admin: admin / password123');
        console.log('   Standard Admin: admin@obu.edu.et / Admin@123');
        console.log('   Standard Admin: john@obu.edu.et / Admin@123');
        console.log('   Viewer: jane@obu.edu.et / Admin@123\n');
        console.log('⚠️  IMPORTANT: Use username "admin" (not email) for Super Admin login\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin system:', error);
        process.exit(1);
    }
};

seedAdminSystem();
