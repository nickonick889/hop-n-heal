const pool = require('../db/pool');

async function listServices(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, slug, specialty, description, image_url, price_from, sort_order
       FROM medical_services
       WHERE is_published = true
       ORDER BY sort_order ASC, title ASC`
    );
    res.json({ services: rows });
  } catch (err) {
    next(err);
  }
}

async function getService(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, slug, specialty, description, image_url, price_from
       FROM medical_services
       WHERE slug = $1 AND is_published = true`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Service not found' });
    res.json({ service: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function listStay(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, slug, type, location, description, image_url, price_from
       FROM accommodations
       WHERE is_published = true
       ORDER BY name ASC`
    );
    res.json({ accommodations: rows });
  } catch (err) {
    next(err);
  }
}

async function listTransport(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, vehicle_type, description, image_url, capacity, price_from
       FROM transport_options
       WHERE is_published = true
       ORDER BY price_from ASC`
    );
    res.json({ transport: rows });
  } catch (err) {
    next(err);
  }
}

async function listActivities(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, slug, category, description, image_url, price_from
       FROM activities
       WHERE is_published = true
       ORDER BY title ASC`
    );
    res.json({ activities: rows });
  } catch (err) {
    next(err);
  }
}

async function listPartners(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, partner_name, logo_url, website_url, description, sort_order
       FROM affiliations
       WHERE is_published = true
       ORDER BY sort_order ASC, partner_name ASC`
    );
    res.json({ partners: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { listServices, getService, listStay, listTransport, listActivities, listPartners };
