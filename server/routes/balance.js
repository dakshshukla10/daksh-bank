const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { validateBalanceQuery } = require('../middleware/validation');

// GET /api/balance?userId=xxx
router.get('/', authenticateToken, validateBalanceQuery, (req, res) => {
  try {
    const { userId } = req.query;

    // Verify user can only access their own balance
    if (req.user.userId !== userId.toLowerCase()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view your own balance.' 
      });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, name, balance FROM users WHERE id = ?')
      .get(userId.toLowerCase());

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      balance: user.balance,
      user: {
        id: user.id,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
