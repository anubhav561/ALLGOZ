const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const store = require('../store');

// Get coin packages
router.get('/packages', (req, res) => {
    const packages = [
        {
            id: '1',
            name: '1000 Z Coins',
            coins: 1000,
            price: 999,
            discount: 0
        },
        {
            id: '2',
            name: '2500 Z Coins',
            coins: 2500,
            price: 2249,
            discount: 10
        },
        {
            id: '3',
            name: '5000 Z Coins',
            coins: 5000,
            price: 4499,
            discount: 15
        }
    ];
    res.json(packages);
});

// Purchase coins
router.post('/purchase', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const { packageId } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = store.users.get(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find package
        const packages = await router.get('/packages').json;
        const package = packages.find(p => p.id === packageId);
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Update user coins
        user.coins += package.coins;
        store.users.set(decoded.userId, user);

        // Create transaction record
        const transaction = {
            id: uuidv4(),
            userId: user.userId,
            packageId,
            coins: package.coins,
            amount: package.price,
            status: 'completed',
            createdAt: new Date()
        };

        // Store transaction
        if (!store.transactions.has(user.userId)) {
            store.transactions.set(user.userId, new Map());
        }
        store.transactions.get(user.userId).set(transaction.id, transaction);

        res.json({
            transactionId: transaction.id,
            coins: user.coins,
            status: transaction.status
        });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ message: 'Error processing purchase' });
    }
});

// Get transaction status
router.get('/transaction/:transactionId', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userTransactions = store.transactions.get(decoded.userId);
        const transaction = userTransactions?.get(req.params.transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({
            id: transaction.id,
            status: transaction.status,
            coins: transaction.coins,
            amount: transaction.amount,
            createdAt: transaction.createdAt
        });
    } catch (error) {
        console.error('Transaction status error:', error);
        res.status(500).json({ message: 'Error fetching transaction status' });
    }
});

// Get transaction history
router.get('/history', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userTransactions = store.transactions.get(decoded.userId);
        
        if (!userTransactions) {
            return res.json([]);
        }

        const transactions = Array.from(userTransactions.values())
            .sort((a, b) => b.createdAt - a.createdAt);

        res.json(transactions);
    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({ message: 'Error fetching transaction history' });
    }
});

module.exports = router; 