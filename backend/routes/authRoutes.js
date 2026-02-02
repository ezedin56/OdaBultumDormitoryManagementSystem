const express = require('express');
const router = express.Router();
const { authUser, registerUser } = require('../controllers/authController');

router.post('/login', authUser);
// router.post('/register', registerUser); // Only admin might register users in this context, or students via ID

module.exports = router;
