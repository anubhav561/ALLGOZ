const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const store = require('../store');

// Helper function to hash password
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Helper function to compare password
async function comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

// Helper function to generate client code
function generateClientCode() {
    return (store.users.size + 1).toString().padStart(2, '0');
}

// Signup route
router.post('/signup', async (req, res) => {
    try {
        console.log('Signup request received:', req.body);
        const { email, password, phone } = req.body;

        // Validate required fields
        if (!email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user already exists
        if (Array.from(store.users.values()).some(user => user.email === email)) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        const userId = uuidv4();
        const hashedPassword = await hashPassword(password);
        const clientCode = generateClientCode();
        const webhookUrl = `https://algoz.tech/webhook/${userId}/${uuidv4()}`;

        // Create new user
        const user = {
            userId,
            email,
            password: hashedPassword,
            phone,
            clientCode,
            coins: 0,
            theme: 'light',
            webhookUrl,
            createdAt: new Date()
        };

        store.users.set(userId, user);
        console.log('New user created:', { userId, email, clientCode });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.userId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const response = {
            token,
            user: {
                userId: user.userId,
                email: user.email,
                clientCode: user.clientCode,
                coins: user.coins,
                theme: user.theme
            }
        };

        console.log('Sending signup response:', response);
        res.status(201).json(response);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = Array.from(store.users.values()).find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.userId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                userId: user.userId,
                email: user.email,
                clientCode: user.clientCode,
                coins: user.coins,
                theme: user.theme
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = store.users.get(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            userId: user.userId,
            email: user.email,
            clientCode: user.clientCode,
            coins: user.coins,
            theme: user.theme,
            webhookUrl: user.webhookUrl
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Update theme
router.put('/theme', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const { theme } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = store.users.get(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.theme = theme;
        store.users.set(decoded.userId, user);

        res.json({ theme: user.theme });
    } catch (error) {
        console.error('Theme update error:', error);
        res.status(500).json({ message: 'Error updating theme' });
    }
});

module.exports = router; 