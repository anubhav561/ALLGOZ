require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const store = require('./store');
const authRoutes = require('./routes/auth');
const coinRoutes = require('./routes/coins');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Create a test user
async function createTestUser() {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = {
        userId,
        email: 'test@example.com',
        password: hashedPassword,
        clientCode: '01',
        coins: 100,
        theme: 'light',
        webhookUrl: `https://algoz.tech/webhook/${userId}/${uuidv4()}`,
        createdAt: new Date()
    };
    store.users.set(userId, user);
    console.log('Test user created:', user.email);
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/coins', coinRoutes);

// Serve HTML files - fallback routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/broker-auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'broker-auth.html'));
});

// Catch-all route for HTML files
app.get('*.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', req.path));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
createTestUser().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Visit http://localhost:${PORT} to access the application`);
    });
}); 