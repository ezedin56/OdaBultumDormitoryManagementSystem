const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUsersByRole } = require('../controllers/authController');

router.post('/login', authUser);
router.post('/register', registerUser);
router.get('/users', getUsersByRole);

module.exports = router;
