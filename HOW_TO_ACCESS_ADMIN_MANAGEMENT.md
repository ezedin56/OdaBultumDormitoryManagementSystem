# 🔐 How to Access Admin Management

## ✅ System is Now Fixed and Ready!

### What Was Fixed:
1. ✅ Database seeded with default data
2. ✅ AuthContext updated to handle admin login
3. ✅ Login component updated to redirect admins properly
4. ✅ Token storage implemented correctly

---

## 🚀 How to Access Admin Management

### Step 1: Make Sure Backend is Running
```bash
cd backend
npm run dev
```
Backend should be running on: http://localhost:5000

### Step 2: Make Sure Frontend is Running
```bash
cd frontend
npm run dev
```
Frontend should be running on: http://localhost:5173

### Step 3: Login as Admin
1. Go to: **http://localhost:5173/login**
2. Enter credentials:
   - **Email:** admin@obu.edu.et
   - **Password:** Admin@123
3. Click "Log In"

### Step 4: Access Admin Management
After login, you'll be automatically redirected to `/admin/dashboard`

Then click on **"Admin Management"** in the sidebar to see:
- ✅ Admin List (3 admins)
- ✅ Roles & Permissions (3 roles)
- ✅ Activity Logs
- ✅ Login History
- ✅ Security Settings

---

## 📊 What You Should See

### Admin List Tab
- 3 admins displayed:
  1. Super Administrator (admin@obu.edu.et)
  2. John Doe (john@obu.edu.et)
  3. Jane Smith (jane@obu.edu.et)

### Roles & Permissions Tab
- 3 roles displayed:
  1. Super Admin (All permissions)
  2. Admin (Most permissions)
  3. Viewer (Read-only)

### Activity Logs Tab
- Empty initially (will populate as you perform actions)

### Login History Tab
- Will show your login attempt

### Security Settings Tab
- Password policy settings
- Login security settings
- IP restrictions

---

## 🔐 Available Login Credentials

### Super Admin (Full Access)
- **Email:** admin@obu.edu.et
- **Password:** Admin@123
- **Permissions:** All (*)

### Admin (Standard Access)
- **Email:** john@obu.edu.et
- **Password:** Admin@123
- **Permissions:** Most features (no admin deletion, no security management)

### Viewer (Read-Only)
- **Email:** jane@obu.edu.et
- **Password:** Admin@123
- **Permissions:** View-only access

---

## 🧪 Test the System

### 1. Test Create Admin
1. Go to Admin Management → Admin List
2. Click "Create Admin" button
3. Fill in the form
4. Select a role (toggle-based selection)
5. Optionally add custom permissions
6. Click "Create Admin"
7. New admin should appear in the list

### 2. Test Create Role
1. Go to Admin Management → Roles & Permissions
2. Click "Create Role" button
3. Enter role name and description
4. Toggle permissions
5. Click "Create Role"
6. New role should appear in the list

### 3. Test Suspend Admin
1. Go to Admin Management → Admin List
2. Click the suspend button (⊘) on any admin
3. Confirm the action
4. Admin status should change to "Suspended"

### 4. Test Activity Logs
1. Perform any action (create admin, suspend, etc.)
2. Go to Admin Management → Activity Logs
3. You should see your action logged

---

## ⚠️ Troubleshooting

### Issue: "No admins found" or empty lists
**Solution:** 
```bash
cd backend
npm run seed-admin
```

### Issue: "Not authorized" or "403 Forbidden"
**Solution:** 
1. Logout
2. Login again with admin credentials
3. Make sure you're using: admin@obu.edu.et / Admin@123

### Issue: "Failed to fetch" errors
**Solution:**
1. Check backend is running on port 5000
2. Check frontend is running on port 5173
3. Check browser console for CORS errors

### Issue: Login doesn't redirect to admin dashboard
**Solution:**
1. Clear browser localStorage
2. Refresh the page
3. Login again

---

## 🎯 Quick Commands

```bash
# Seed admin system
cd backend
npm run seed-admin

# Clear admin data
npm run clear-admin

# Start backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

---

## ✨ Everything Should Work Now!

The system is fully functional:
- ✅ Database has data
- ✅ Login system works
- ✅ Admin Management displays data
- ✅ All CRUD operations work
- ✅ Permissions are enforced
- ✅ Activity logging works

**Just login and start using it!** 🚀
