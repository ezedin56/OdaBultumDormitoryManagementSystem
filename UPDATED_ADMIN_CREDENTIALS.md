# 🔐 Updated Admin Credentials

## ✅ Changes Made

### Super Admin Account
**CHANGED FROM:**
- Email: admin@obu.edu.et
- Password: Admin@123
- Role: Super Admin

**CHANGED TO:**
- Email: admin@system.local
- Password: password123
- Role: Super Admin
- **Note:** This matches your existing system admin user (username: admin)

### Standard Admin Accounts

**admin@obu.edu.et** (Changed from Super Admin to Standard Admin)
- Email: admin@obu.edu.et
- Password: Admin@123
- Role: **Admin** (Standard - not Super Admin)
- Permissions: Most features (no admin deletion, no security management)

**john@obu.edu.et** (Standard Admin)
- Email: john@obu.edu.et
- Password: Admin@123
- Role: **Admin** (Standard)
- Permissions: Most features (no admin deletion, no security management)

**jane@obu.edu.et** (Viewer)
- Email: jane@obu.edu.et
- Password: Admin@123
- Role: **Viewer** (Read-only)
- Permissions: View-only access to all modules

---

## 🚀 How to Login

### As Super Admin (Full Access)
1. Go to: http://localhost:5173/login
2. Enter:
   - **Email:** admin@system.local
   - **Password:** password123
3. You'll have full access to everything

### As Standard Admin
1. Go to: http://localhost:5173/login
2. Enter:
   - **Email:** admin@obu.edu.et (or john@obu.edu.et)
   - **Password:** Admin@123
3. You'll have most permissions except:
   - Cannot delete other admins
   - Cannot manage security settings

### As Viewer
1. Go to: http://localhost:5173/login
2. Enter:
   - **Email:** jane@obu.edu.et
   - **Password:** Admin@123
3. You'll have read-only access

---

## 📊 Current Admin Structure

```
┌─────────────────────────────────────────┐
│  Super Admin (admin@system.local)       │
│  - Full system access                   │
│  - All permissions (*)                  │
│  - Can manage everything                │
└─────────────────────────────────────────┘
           │
           ├── Standard Admin (admin@obu.edu.et)
           │   - Most permissions
           │   - Cannot delete admins
           │   - Cannot manage security
           │
           ├── Standard Admin (john@obu.edu.et)
           │   - Most permissions
           │   - Cannot delete admins
           │   - Cannot manage security
           │
           └── Viewer (jane@obu.edu.et)
               - Read-only access
               - Can view all modules
               - Cannot create/edit/delete
```

---

## 🔑 Permission Differences

### Super Admin (admin@system.local)
✅ View/Create/Edit/Delete Admins
✅ Suspend/Activate Admins
✅ Reset Passwords
✅ View/Create/Edit/Delete Roles
✅ View Activity Logs
✅ View Login History
✅ **Manage Security Settings**
✅ All other module permissions

### Standard Admin (admin@obu.edu.et, john@obu.edu.et)
✅ View/Create/Edit Admins
❌ Delete Admins
✅ Suspend/Activate Admins
✅ Reset Passwords
✅ View/Create/Edit/Delete Roles
✅ View Activity Logs
✅ View Login History
❌ **Manage Security Settings**
✅ All other module permissions

### Viewer (jane@obu.edu.et)
✅ View Admins
❌ Create/Edit/Delete Admins
❌ Suspend/Activate Admins
❌ Reset Passwords
✅ View Roles
❌ Create/Edit/Delete Roles
✅ View Activity Logs
✅ View Login History
❌ Manage Security Settings
✅ View-only for other modules

---

## ⚠️ Important Notes

1. **Super Admin Credentials Match System Admin**
   - The Super Admin (admin@system.local / password123) uses the same credentials as your existing system admin user
   - This ensures consistency across the system

2. **admin@obu.edu.et is NO LONGER Super Admin**
   - Changed to Standard Admin role
   - Has most permissions but cannot delete admins or manage security

3. **Security Best Practice**
   - Use Super Admin only when necessary
   - Use Standard Admin for day-to-day operations
   - Use Viewer for read-only access

4. **Password Policy**
   - Super Admin: password123 (matches existing system)
   - Other Admins: Admin@123 (meets security requirements)

---

## 🧪 Test the Changes

1. **Login as Super Admin:**
   ```
   Email: admin@system.local
   Password: password123
   ```
   - Go to Admin Management → Security Settings
   - You should be able to edit security settings

2. **Login as Standard Admin:**
   ```
   Email: admin@obu.edu.et
   Password: Admin@123
   ```
   - Go to Admin Management → Security Settings
   - You should see "Permission denied" or no access

3. **Verify Role Assignment:**
   - Login as Super Admin
   - Go to Admin Management → Admin List
   - Check that admin@obu.edu.et shows "Admin" role (not "Super Admin")

---

## 🔄 If You Need to Reset

```bash
cd backend

# Clear all admin data
npm run clear-admin

# Reseed with updated structure
npm run seed-admin
```

---

## ✅ Summary

- ✅ Super Admin: admin@system.local / password123
- ✅ Standard Admin: admin@obu.edu.et / Admin@123
- ✅ Standard Admin: john@obu.edu.et / Admin@123
- ✅ Viewer: jane@obu.edu.et / Admin@123

**The system is now configured with your preferred admin structure!** 🎉
