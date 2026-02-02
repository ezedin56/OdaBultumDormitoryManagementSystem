# ODA BULTUM UNIVERSITY - DORMITORY MANAGEMENT SYSTEM

A comprehensive web-based dormitory management system built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🎯 Features

- **Student Management**: Register, view, edit, and delete student records
- **Room Allocation**: Manage dormitory rooms and assign students based on gender and capacity
- **Maintenance Requests**: Track and manage maintenance issues reported by students
- **Dashboard Analytics**: Real-time statistics on occupancy, students, and maintenance
- **Role-Based Access**: Different views for Admin, Student, and Maintenance staff
- **Responsive Design**: Modern UI with a custom CSS design system

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React 18+ (Vite)
- React Router v6
- Axios for API calls
- Lucide Icons
- Custom CSS (No frameworks)

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or connection URI)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/obudms
JWT_SECRET=obudms_secret_key_12345
NODE_ENV=development
```

Seed the database:
```bash
node seeder.js
```

Start the backend server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `password123`

**Maintenance Login:**
- Username: `maintenance`
- Password: `password123`

## 📁 Project Structure

```
odabultumdormitorymanagementsystem/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── dormController.js
│   │   └── maintenanceController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Room.js
│   │   └── MaintenanceRequest.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── dormRoutes.js
│   │   └── maintenanceRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env
│   ├── server.js
│   ├── seeder.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout/
    │   │       └── AdminLayout.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Admin/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Students.jsx
    │   │   │   ├── Dorms.jsx
    │   │   │   └── Maintenance.jsx
    │   │   └── Auth/
    │   │       └── Login.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    └── package.json
```

## 🎨 Design System

The system uses a custom CSS Variable-based design system with:
- HSL color palette for easy customization
- Consistent spacing and typography
- Reusable utility classes
- Smooth transitions and micro-animations

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Dormitories
- `GET /api/dorms` - Get all rooms
- `GET /api/dorms/:id` - Get room by ID
- `POST /api/dorms` - Create room
- `PUT /api/dorms/:id` - Update room
- `DELETE /api/dorms/:id` - Delete room
- `POST /api/dorms/:id/assign` - Assign student to room

### Maintenance
- `GET /api/maintenance` - Get all requests
- `POST /api/maintenance` - Create request
- `PUT /api/maintenance/:id` - Update request

## 📝 License

This project was developed for Oda Bultum University.

## 👥 Contributors

- Hagere Tech Teams

## 📞 Support

For issues or questions, contact: admin@obu.edu.et
