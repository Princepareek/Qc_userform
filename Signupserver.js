import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const { Client } = pkg;
const app = express();
const port = process.env.PORT || 5001;

// PostgreSQL client setup
const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

client.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// ------------------------
// ✅ Signup endpoint
// ------------------------
app.post('/signup', async (req, res) => {
  const { username, email, password, department } = req.body;

  if (!username || !email || !password || !department) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    await client.query(
      'INSERT INTO users (username, email, password, department, is_approved) VALUES ($1, $2, $3, $4, $5)',
      [username, email.toLowerCase(), password, department, false]
    );

    res.status(201).json({ message: 'User created successfully. Awaiting approval.' });
  } catch (error) {
    console.error('❌ Signup Error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ------------------------
// ✅ Login endpoint
// ------------------------
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const user = result.rows[0];

    if (!user.is_approved) {
      return res.status(403).json({ message: 'Account not approved. Please contact administrator.' });
    }

    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    await client.query('UPDATE users SET token = $1 WHERE username = $2', [token, username]);

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        department: user.department,
        is_approved: user.is_approved,
      },
      success: true
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ------------------------
// ✅ Start Server
// ------------------------
app.listen(port, () => {
  console.log(`🚀 Auth server running at http://localhost:${port}`);
});
