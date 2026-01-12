const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { Parser } = require('json2csv');
const { authenticateToken } = require('../middleware/auth');
const { transactionLimiter } = require('../middleware/rateLimiter');
const { validateTransaction, validateTransactionQuery } = require('../middleware/validation');

// POST /api/transactions - Create a new transaction
router.post('/', authenticateToken, transactionLimiter, validateTransaction, (req, res) => {
  try {
    const { userId, type, amount, description, addedBy } = req.body;

    // Verify addedBy matches authenticated user
    if (req.user.userId !== addedBy.toLowerCase()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only create transactions as yourself.' 
      });
    }

    const db = getDb();
    
    // Start a transaction to ensure atomicity
    const transaction = db.transaction((userId, type, amount, description, addedBy) => {
      // Get current balance with a lock
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId.toLowerCase());

      if (!user) {
        throw new Error('User not found');
      }

      let newBalance;
      if (type === 'add') {
        newBalance = user.balance + amount;
      } else {
        if (user.balance < amount) {
          throw new Error('Insufficient balance');
        }
        newBalance = user.balance - amount;
      }

      // Update user balance
      db.prepare('UPDATE users SET balance = ? WHERE id = ?')
        .run(newBalance, userId.toLowerCase());

      // Insert transaction record
      const result = db.prepare(`
        INSERT INTO transactions (user_id, type, amount, description, added_by, balance_after)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId.toLowerCase(), type, amount, description || '', addedBy.toLowerCase(), newBalance);

      return { transactionId: result.lastInsertRowid, newBalance };
    });

    // Execute the transaction atomically
    const result = transaction(userId, type, amount, description, addedBy);

    res.json({
      success: true,
      transaction: {
        id: result.transactionId,
        userId: userId.toLowerCase(),
        type,
        amount,
        description: description || '',
        addedBy: addedBy.toLowerCase(),
        balanceAfter: result.newBalance
      },
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Transaction error:', error);
    // Return specific error messages for known errors
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/transactions - Get transactions with optional filters
router.get('/', authenticateToken, validateTransactionQuery, (req, res) => {
  try {
    const { userId, type, startDate, endDate, limit = 50, offset = 0, format } = req.query;

    let query = 'SELECT t.*, u.name as user_name, ab.name as added_by_name FROM transactions t JOIN users u ON t.user_id = u.id JOIN users ab ON t.added_by = ab.id WHERE 1=1';
    const params = [];

    if (userId) {
      query += ' AND t.user_id = ?';
      params.push(userId.toLowerCase());
    }

    if (type && ['add', 'deduct'].includes(type)) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    if (startDate) {
      query += ' AND t.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND t.created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY t.created_at DESC';
    
    // For CSV export, get all matching records
    if (format !== 'csv') {
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
    }

    const db = getDb();
    const transactions = db.prepare(query).all(...params);

    // Export as CSV
    if (format === 'csv') {
      const fields = ['id', 'user_id', 'user_name', 'type', 'amount', 'description', 'added_by', 'added_by_name', 'balance_after', 'created_at'];
      const parser = new Parser({ fields });
      const csv = parser.parse(transactions);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      return res.send(csv);
    }

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM transactions t WHERE 1=1';
    const countParams = [];
    
    if (userId) {
      countQuery += ' AND t.user_id = ?';
      countParams.push(userId.toLowerCase());
    }
    if (type && ['add', 'deduct'].includes(type)) {
      countQuery += ' AND t.type = ?';
      countParams.push(type);
    }
    if (startDate) {
      countQuery += ' AND t.created_at >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ' AND t.created_at <= ?';
      countParams.push(endDate);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
