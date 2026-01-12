const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  try {
    const { userId, name, pin } = req.body;

    if (!userId || !name || !pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, name, and PIN are required' 
      });
    }

    if (userId.length < 2 || userId.length > 20) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID must be 2-20 characters' 
      });
    }

    if (pin.length < 4 || pin.length > 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'PIN must be 4-6 digits' 
      });
    }

    const db = getDb();
    
    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId.toLowerCase());
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID already taken' 
      });
    }

    // Create user
    db.prepare('INSERT INTO users (id, pin, name, balance) VALUES (?, ?, ?, 0)')
      .run(userId.toLowerCase(), pin, name);

    res.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: userId.toLowerCase(),
        name,
        balance: 0
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/verify-pin
router.post('/verify-pin', (req, res) => {
  try {
    const { userId, pin } = req.body;

    if (!userId || !pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and PIN are required' 
      });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, name, balance FROM users WHERE id = ? AND pin = ?')
      .get(userId.toLowerCase(), pin);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
