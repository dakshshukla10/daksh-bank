const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/balance?userId=xxx
router.get('/', (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
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
