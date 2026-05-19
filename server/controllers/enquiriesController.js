const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const pool   = require('../db/pool');

const SALT_ROUNDS = 12;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function listMine(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, group_size, duration_days, budget_range, food_budget, status, submitted_at
       FROM enquiries
       WHERE client_id = $1
       ORDER BY submitted_at DESC`,
      [req.client.id]
    );
    res.json({ enquiries: rows });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { group_size, duration_days, budget_range, food_budget, travel_dates, interests } = req.body;

    const { rows } = await client.query(
      `INSERT INTO enquiries (client_id, group_size, duration_days, budget_range, food_budget, travel_dates)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.client.id, group_size, duration_days, budget_range, food_budget || null, travel_dates || null]
    );
    const enquiry = rows[0];

    // Insert each interest as a separate row (includes food_restriction category)
    if (Array.isArray(interests) && interests.length > 0) {
      const interestInserts = interests.map((item) =>
        client.query(
          `INSERT INTO enquiry_interests (enquiry_id, category, option_value)
           VALUES ($1, $2, $3)`,
          [enquiry.id, item.category, item.option_value]
        )
      );
      await Promise.all(interestInserts);
    }

    await client.query('COMMIT');
    res.status(201).json({ enquiry });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function getOne(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, json_agg(ei.*) FILTER (WHERE ei.id IS NOT NULL) AS interests
       FROM enquiries e
       LEFT JOIN enquiry_interests ei ON ei.enquiry_id = e.id
       WHERE e.id = $1 AND e.client_id = $2
       GROUP BY e.id`,
      [req.params.id, req.client.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Enquiry not found' });
    res.json({ enquiry: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT status FROM enquiries WHERE id = $1 AND client_id = $2',
      [req.params.id, req.client.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Enquiry not found' });
    if (rows[0].status !== 'pending') {
      return res.status(403).json({ error: 'Only pending enquiries can be edited' });
    }

    const { group_size, duration_days, budget_range, food_budget, travel_dates } = req.body;
    const { rows: updated } = await pool.query(
      `UPDATE enquiries
       SET group_size = $1, duration_days = $2, budget_range = $3, food_budget = $4, travel_dates = $5
       WHERE id = $6
       RETURNING *`,
      [group_size, duration_days, budget_range, food_budget || null, travel_dates || null, req.params.id]
    );
    res.json({ enquiry: updated[0] });
  } catch (err) {
    next(err);
  }
}

// Creates a client account and their first enquiry in one transaction.
// Used by the guest enquiry flow (no prior login required).
async function guestSubmit(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      full_name, email, password, phone, country,
      group_size, duration_days, budget_range, food_budget, travel_dates, interests,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'full_name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!group_size || !duration_days || !budget_range || !food_budget) {
      return res.status(400).json({ error: 'Please complete all enquiry fields' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { rows: clientRows } = await client.query(
      `INSERT INTO clients (full_name, email, phone, country, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone, country, created_at`,
      [full_name, email, phone || null, country || null, password_hash]
    );
    const newClient = clientRows[0];

    const { rows: enquiryRows } = await client.query(
      `INSERT INTO enquiries (client_id, group_size, duration_days, budget_range, food_budget, travel_dates)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [newClient.id, group_size, duration_days, budget_range, food_budget, travel_dates || null]
    );
    const enquiry = enquiryRows[0];

    if (Array.isArray(interests) && interests.length > 0) {
      await Promise.all(interests.map(item =>
        client.query(
          `INSERT INTO enquiry_interests (enquiry_id, category, option_value) VALUES ($1, $2, $3)`,
          [enquiry.id, item.category, item.option_value]
        )
      ));
    }

    await client.query('COMMIT');

    const token = jwt.sign(
      { id: newClient.id, email: newClient.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user: newClient, enquiry });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered. Please log in to submit an enquiry.' });
    }
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { listMine, create, getOne, update, guestSubmit };
