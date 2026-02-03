const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        // Check if system is in maintenance mode
        const settings = await SystemSettings.findOne();
        
        if (settings && settings.maintenanceMode && user.role !== 'admin') {
            res.status(503);
            throw new Error('System is currently under maintenance. Only administrators can access the system at this time.');
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid username or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public/Admin
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        username,
        email,
        password,
        role
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get users by role
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsersByRole = asyncHandler(async (req, res) => {
    const { role } = req.query;
    
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password');
    
    res.json(users);
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; // Assuming auth middleware sets req.user

    // Validate input
    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide current and new password');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters');
    }

    // Get user with password
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    const userId = req.user._id;

    // Get user
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            res.status(400);
            throw new Error('Username already taken');
        }
        user.username = username;
    }

    // Update email
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400);
            throw new Error('Email already taken');
        }
        user.email = email;
    }

    const updatedUser = await user.save();

    // Generate new token with updated info
    const generateToken = require('../utils/generateToken');
    const token = generateToken(updatedUser._id);

    res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            token: token
        }
    });
});

module.exports = { authUser, registerUser, getUsersByRole, changePassword, updateProfile };
