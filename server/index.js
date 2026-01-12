const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const authRoutes = require('./routes/auth');
const balanceRoutes = require('./routes/balance');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
db.init();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Daksh Bank API is running' });
});

app.listen(PORT, () => {
  console.log(`🏦 Daksh Bank server running on http://localhost:${PORT}`);
});
