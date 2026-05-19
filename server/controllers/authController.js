const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const SALT_ROUNDS = 12;
const COOKIE_OPTIONS = {
  httpOnly: true,   // JS in the browser cannot read this cookie — protects against XSS
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

async function signup(req, res, next) {
  try {
    const { full_name, email, password, phone, country } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'full_name, email and password are required' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { rows } = await pool.query(
      `INSERT INTO clients (full_name, email, phone, country, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone, country, created_at`,
      [full_name, email, phone || null, country || null, password_hash]
    );

    const client = rows[0];
    const token = jwt.sign({ id: client.id, email: client.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user: client });
  } catch (err) {
    // Unique violation — email already taken
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT id, full_name, email, phone, country, password_hash FROM clients WHERE email = $1',
      [email]
    );

    const client = rows[0];
    if (!client) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, client.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query('UPDATE clients SET last_login = now() WHERE id = $1', [client.id]);

    const token = jwt.sign({ id: client.id, email: client.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.cookie('token', token, COOKIE_OPTIONS);

    const { password_hash, ...safeClient } = client;
    res.json({ user: safeClient });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
}

async function me(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, phone, country, created_at FROM clients WHERE id = $1',
      [req.client.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { full_name, phone, country } = req.body;
    if (!full_name) return res.status(400).json({ error: 'full_name is required' });
    const { rows } = await pool.query(
      `UPDATE clients SET full_name=$1, phone=$2, country=$3 WHERE id=$4
       RETURNING id, full_name, email, phone, country, created_at`,
      [full_name, phone || null, country || null, req.client.id]
    );
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
}

module.exports = { signup, login, logout, me, updateProfile };
