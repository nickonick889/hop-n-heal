const pool = require('../db/pool');

async function listMine(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, enquiry_id, status, total_price, currency, confirmed_at
       FROM bookings
       WHERE client_id = $1
       ORDER BY confirmed_at DESC`,
      [req.client.id]
    );
    res.json({ bookings: rows });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, json_agg(bi.*) FILTER (WHERE bi.id IS NOT NULL) AS items
       FROM bookings b
       LEFT JOIN booking_items bi ON bi.booking_id = b.id
       WHERE b.id = $1 AND b.client_id = $2
       GROUP BY b.id`,
      [req.params.id, req.client.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMine, getOne };
