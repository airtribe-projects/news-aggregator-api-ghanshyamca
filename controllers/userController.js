const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        console.log('User registered successfully', process.env.SALT_ROUNDS);
        // Hash password
        const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        await user.save();

        res.status(200).json({
            message: 'User registered successfully',
            user: user.toJSON(),
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            user: user.toJSON(),
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: user.toJSON() });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ preferences: user.preferences });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateUserPreferences = async (req, res) => {
    try {
        const { preferences } = req.body;
        
        if (!preferences || !Array.isArray(preferences)) {
            return res.status(400).json({ error: 'Preferences must be an array' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { preferences },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ 
            message: 'Preferences updated successfully',
            preferences: user.preferences 
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    getUserPreferences,
    updateUserPreferences
}; 