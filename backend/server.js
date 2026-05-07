const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'super-secret-debtflow-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
let db;
async function initializeDB() {
  db = await open({
    filename: path.join(__dirname, 'debtflow.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      date_of_payment TEXT,
      group_name TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(loan_id) REFERENCES loans(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  console.log('Database initialized successfully.');
}

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- ROUTES ---

// Auth: Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    const token = jwt.sign({ id: result.lastID, email }, JWT_SECRET);
    res.json({ token, user: { id: result.lastID, name, email } });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Auth: Log In
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all loans for logged in user
app.get('/api/loans', authenticateToken, async (req, res) => {
  try {
    const loans = await db.all('SELECT * FROM loans WHERE user_id = ?', [req.user.id]);
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new loan
app.post('/api/loans', authenticateToken, async (req, res) => {
  try {
    const { title, amount, note, date_of_payment, group_name } = req.body;
    const result = await db.run(
      'INSERT INTO loans (user_id, title, amount, note, date_of_payment, group_name) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, amount, note, date_of_payment, group_name]
    );
    res.json({ id: result.lastID, title, amount, note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a transaction (partial payment/borrow more)
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { loan_id, amount, type, title, date } = req.body;
    const result = await db.run(
      'INSERT INTO transactions (loan_id, user_id, amount, type, title, date) VALUES (?, ?, ?, ?, ?, ?)',
      [loan_id, req.user.id, amount, type, title, date]
    );
    
    // Update loan total automatically
    const modifier = type === 'repay' ? -amount : amount;
    await db.run('UPDATE loans SET amount = amount + ? WHERE id = ?', [modifier, loan_id]);

    res.json({ id: result.lastID, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific loan details + history
app.get('/api/loans/:id', authenticateToken, async (req, res) => {
  try {
    const loan = await db.get('SELECT * FROM loans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    
    const history = await db.all('SELECT * FROM transactions WHERE loan_id = ? ORDER BY id DESC', [req.params.id]);
    res.json({ ...loan, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

initializeDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 DebtFlow Backend running securely on http://localhost:${PORT}`);
  });
});
