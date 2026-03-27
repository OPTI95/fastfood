const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Registration disabled — create admins via CLI:
//   psql fastfood_db -c "INSERT INTO users(username,email,password,role) VALUES('admin','a@a.com','$(node -e "const b=require(\'bcryptjs\');b.hash(\'PASSWORD\',10).then(h=>process.stdout.write(h))"))','admin')"
router.post('/register', (req, res) => {
  res.status(403).json({ error: 'Registration is disabled' });
});

// Login
router.post('/login', async (req, res) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'Server misconfiguration' });

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [String(username).slice(0, 100)]
    );

    // Same error for wrong user OR wrong password — prevents user enumeration
    const INVALID = 'Invalid credentials';

    if (result.rows.length === 0) {
      return res.status(401).json({ error: INVALID });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(String(password), user.password);
    if (!isValid) {
      return res.status(401).json({ error: INVALID });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
