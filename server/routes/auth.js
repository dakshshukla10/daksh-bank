const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getDb } = require('../database');
const { generateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateSignup, validateLogin } = require('../middleware/validation');

// POST /api/auth/signup
router.post('/signup', authLimiter, validateSignup, async (req, res) => {
  try {
    const { userId, name, pin } = req.body;

    const db = getDb();
    
    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId.toLowerCase());
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID already taken' 
      });
    }

    // Hash PIN before storing
    const saltRounds = 10;
    const hashedPin = await bcrypt.hash(pin, saltRounds);

    // Create user
    db.prepare('INSERT INTO users (id, pin, name, balance) VALUES (?, ?, ?, 0)')
      .run(userId.toLowerCase(), hashedPin, name);

    // Generate JWT token
    const token = generateToken(userId.toLowerCase(), name);

    res.json({
      success: true,
      message: 'Account created successfully',
      token,
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
router.post('/verify-pin', authLimiter, validateLogin, async (req, res) => {
  try {
    const { userId, pin } = req.body;

    const db = getDb();
    const user = db.prepare('SELECT id, name, balance, pin FROM users WHERE id = ?')
      .get(userId.toLowerCase());

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Verify PIN using bcrypt
    const isValidPin = await bcrypt.compare(pin, user.pin);
    if (!isValidPin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.name);

    res.json({
      success: true,
      token,
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
