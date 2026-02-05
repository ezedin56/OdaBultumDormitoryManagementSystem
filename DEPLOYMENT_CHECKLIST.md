# ✅ DEPLOYMENT CHECKLIST

## Pre-Deployment (Already Done ✅)
- [x] Created `backend/.env.production` **with your MongoDB URI**
- [x] Updated `backend/server.js` with CORS
- [x] Created `frontend/.env.production`
- [x] Created `frontend/src/config/api.js`
- [x] Updated `frontend/src/services/api.js`
- [x] Updated `frontend/vite.config.js`
- [x] **MongoDB Atlas already configured and ready!**

---

## MongoDB Atlas (Already Done ✅)

Your MongoDB database is already set up:
- ✅ Cluster: cluster0.7vzla2y.mongodb.net
- ✅ Database: obudms
- ✅ User: mbb75303_db_user
- ✅ Connection string configured in `.env.production`

**Only verify:**
- [ ] Go to https://cloud.mongodb.com
- [ ] Log in to your account
- [ ] Network Access → Verify 0.0.0.0/0 is allowed

---

## Render.com Deployment

### Step 1: Create Account
- [ ] Go to https://render.com
- [ ] Sign up with GitHub
- [ ] Authorize Render

### Step 2: Deploy Backend
- [ ] New + → Web Service
- [ ] Connect repository
- [ ] Configure:
  ```
  Name: obudms-backend
  Region: Frankfurt (EU Central)
  Branch: master
  Root Directory: backend
  Build Command: npm install
  Start Command: npm start
  Instance Type: Free
  ```
- [ ] Add Environment Variables (copy from `backend/.env.production`):
  ```
  PORT=5000
  MONGO_URI=mongodb+srv://mbb75303_db_user:3N51QVF56yBBe0Bz@cluster0.7vzla2y.mongodb.net/obudms?retryWrites=true&w=majority&appName=Cluster0
  JWT_SECRET=54f9f7651a29afb144bf25e55b7ab10ca79e6d0b680a86f3e86d598dac44d434eef9f0253a9087adf72f9210b4865ed338fa2d934175d458c00af4ffdbafe430
  NODE_ENV=production
  ALLOWED_ORIGIN=https://obudms-frontend.onrender.com
  ```
- [ ] Create Web Service
- [ ] Wait for deployment
- [ ] Test: Visit `https://obudms-backend.onrender.com`

### Step 3: Deploy Frontend
- [ ] New + → Static Site
- [ ] Connect repository
- [ ] Configure:
  ```
  Name: obudms-frontend
  Branch: master
  Root Directory: frontend
  Build Command: npm install && npm run build
  Publish Directory: dist
  ```
- [ ] Add Environment Variable:
  ```
  VITE_API_URL=https://obudms-backend.onrender.com
  ```
- [ ] Create Static Site
- [ ] Wait for deployment

### Step 4: Update CORS
- [ ] Backend → Environment
- [ ] Update `ALLOWED_ORIGIN` to actual frontend URL
- [ ] Save (auto-redeploys)

---

## Database Seeding

### Option A: Render Shell
- [ ] Backend service → Shell tab
- [ ] Run: `node seedAdminSystem.js`
- [ ] Run: `node seeder.js`

### Option B: Local
- [ ] Update local `.env` with production MONGO_URI
- [ ] Run: `cd backend && node seedAdminSystem.js`
- [ ] Run: `node seeder.js`
- [ ] Restore local `.env`

---

## Testing

- [ ] Visit frontend URL
- [ ] Login with: `admin` / `password123`
- [ ] Change admin password
- [ ] Test student import
- [ ] Test room allocation
- [ ] Test student portal
- [ ] Test reports generation
- [ ] Test all admin features

---

## Post-Deployment

- [ ] Change default admin password
- [ ] Set up monitoring alerts
- [ ] Configure custom domain (optional)
- [ ] Schedule regular backups
- [ ] Document admin procedures
- [ ] Train staff

---

## URLs to Save

```
Frontend: https://obudms-frontend.onrender.com
Backend:  https://obudms-backend.onrender.com
MongoDB:  (Atlas Dashboard)
```

---

## Important Credentials

```
MongoDB Atlas (Already Configured):
- Cluster: cluster0.7vzla2y.mongodb.net
- Database: obudms
- Username: mbb75303_db_user
- Password: 3N51QVF56yBBe0Bz

Default Admin (Change After First Login):
- Username: admin
- Password: password123

JWT Secret (in .env.production):
- 54f9f7651a29afb144bf25e55b7ab10ca79e6d0b680a86f3e86d598dac44d434eef9f0253a9087adf72f9210b4865ed338fa2d934175d458c00af4ffdbafe430
```

---

## Support Resources

- Render Docs: https://render.com/docs
- MongoDB Docs: https://docs.atlas.mongodb.com
- Project Repo: [Your GitHub URL]

---

**Estimated Time:** 20-30 minutes (MongoDB already done!)
**Cost:** FREE (or $7/month for always-on backend)
