const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ─── Admin Auth ──────────────────────────────────────────────────

async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
      [email]
    );
    const admin = rows[0];
    if (!admin) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    await pool.query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [admin.id]);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ admin: { id: admin.id, full_name: admin.full_name, email: admin.email, role: admin.role } });
  } catch (err) { next(err); }
}

function adminLogout(req, res) {
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out' });
}

async function adminMe(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, role FROM admin_users WHERE id = $1',
      [req.admin.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Admin not found' });
    res.json({ admin: rows[0] });
  } catch (err) { next(err); }
}

// ─── Services ───────────────────────────────────────────────────

async function listServices(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM medical_services ORDER BY sort_order ASC, title ASC');
    res.json({ services: rows });
  } catch (err) { next(err); }
}

async function createService(req, res, next) {
  try {
    const { title, slug, specialty, description, image_url, price_from, sort_order, is_published } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO medical_services (title, slug, specialty, description, image_url, price_from, sort_order, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, slug, specialty, description, image_url, price_from || null, sort_order ?? 0, is_published ?? false]
    );
    res.status(201).json({ service: rows[0] });
  } catch (err) { next(err); }
}

async function updateService(req, res, next) {
  try {
    const { title, slug, specialty, description, image_url, price_from, sort_order, is_published } = req.body;
    const { rows } = await pool.query(
      `UPDATE medical_services
       SET title=$1, slug=$2, specialty=$3, description=$4, image_url=$5, price_from=$6, sort_order=$7, is_published=$8
       WHERE id=$9 RETURNING *`,
      [title, slug, specialty, description, image_url, price_from || null, sort_order, is_published, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ service: rows[0] });
  } catch (err) { next(err); }
}

async function deleteService(req, res, next) {
  try {
    await pool.query('DELETE FROM medical_services WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

// ─── Stays ──────────────────────────────────────────────────────

async function listStay(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM accommodations ORDER BY sort_order ASC, name ASC');
    res.json({ accommodations: rows });
  } catch (err) { next(err); }
}

async function createStay(req, res, next) {
  try {
    const { name, slug, type, location, description, image_url, price_from, sort_order, is_published } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO accommodations (name,slug,type,location,description,image_url,price_from,sort_order,is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, slug, type, location, description, image_url, price_from || null, sort_order ?? 0, is_published ?? false]
    );
    res.status(201).json({ accommodation: rows[0] });
  } catch (err) { next(err); }
}

async function updateStay(req, res, next) {
  try {
    const { name, slug, type, location, description, image_url, price_from, sort_order, is_published } = req.body;
    const { rows } = await pool.query(
      `UPDATE accommodations SET name=$1,slug=$2,type=$3,location=$4,description=$5,image_url=$6,price_from=$7,sort_order=$8,is_published=$9
       WHERE id=$10 RETURNING *`,
      [name, slug, type, location, description, image_url, price_from || null, sort_order, is_published, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ accommodation: rows[0] });
  } catch (err) { next(err); }
}

async function deleteStay(req, res, next) {
  try {
    await pool.query('DELETE FROM accommodations WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

// ─── Transport ──────────────────────────────────────────────────

async function listTransport(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM transport_options ORDER BY sort_order ASC, price_from ASC');
    res.json({ transport: rows });
  } catch (err) { next(err); }
}

async function createTransport(req, res, next) {
  try {
    const { vehicle_type, description, image_url, capacity, price_from, sort_order, is_published } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO transport_options (vehicle_type,description,image_url,capacity,price_from,sort_order,is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [vehicle_type, description, image_url, capacity || null, price_from || null, sort_order ?? 0, is_published ?? false]
    );
    res.status(201).json({ transport: rows[0] });
  } catch (err) { next(err); }
}

async function updateTransport(req, res, next) {
  try {
    const { vehicle_type, description, image_url, capacity, price_from, sort_order, is_published } = req.body;
    const { rows } = await pool.query(
      `UPDATE transport_options SET vehicle_type=$1,description=$2,image_url=$3,capacity=$4,price_from=$5,sort_order=$6,is_published=$7
       WHERE id=$8 RETURNING *`,
      [vehicle_type, description, image_url, capacity || null, price_from || null, sort_order, is_published, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ transport: rows[0] });
  } catch (err) { next(err); }
}

async function deleteTransport(req, res, next) {
  try {
    await pool.query('DELETE FROM transport_options WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

// ─── Activities ─────────────────────────────────────────────────

async function listActivities(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM activities ORDER BY sort_order ASC, title ASC');
    res.json({ activities: rows });
  } catch (err) { next(err); }
}

async function createActivity(req, res, next) {
  try {
    const { title, slug, category, description, image_url, price_from, sort_order, is_published } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO activities (title,slug,category,description,image_url,price_from,sort_order,is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, slug, category, description, image_url, price_from || null, sort_order ?? 0, is_published ?? false]
    );
    res.status(201).json({ activity: rows[0] });
  } catch (err) { next(err); }
}

async function updateActivity(req, res, next) {
  try {
    const { title, slug, category, description, image_url, price_from, sort_order, is_published } = req.body;
    const { rows } = await pool.query(
      `UPDATE activities SET title=$1,slug=$2,category=$3,description=$4,image_url=$5,price_from=$6,sort_order=$7,is_published=$8
       WHERE id=$9 RETURNING *`,
      [title, slug, category, description, image_url, price_from || null, sort_order, is_published, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ activity: rows[0] });
  } catch (err) { next(err); }
}

async function deleteActivity(req, res, next) {
  try {
    await pool.query('DELETE FROM activities WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

// ─── Partners / Affiliations ────────────────────────────────────

async function listPartners(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM affiliations ORDER BY sort_order ASC, partner_name ASC');
    res.json({ partners: rows });
  } catch (err) { next(err); }
}

async function createPartner(req, res, next) {
  try {
    const { partner_name, logo_url, website_url, description, sort_order, is_published } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO affiliations (partner_name,logo_url,website_url,description,sort_order,is_published)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [partner_name, logo_url, website_url, description, sort_order ?? 0, is_published ?? false]
    );
    res.status(201).json({ partner: rows[0] });
  } catch (err) { next(err); }
}

async function updatePartner(req, res, next) {
  try {
    const { partner_name, logo_url, website_url, description, sort_order, is_published } = req.body;
    const { rows } = await pool.query(
      `UPDATE affiliations SET partner_name=$1,logo_url=$2,website_url=$3,description=$4,sort_order=$5,is_published=$6
       WHERE id=$7 RETURNING *`,
      [partner_name, logo_url, website_url, description, sort_order, is_published, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ partner: rows[0] });
  } catch (err) { next(err); }
}

async function deletePartner(req, res, next) {
  try {
    await pool.query('DELETE FROM affiliations WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

// ─── Enquiries ──────────────────────────────────────────────────

async function listEnquiries(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, c.full_name, c.email,
              (SELECT json_agg(option_value) FROM enquiry_interests WHERE enquiry_id = e.id AND category = 'food_restriction') AS food_restrictions,
              (SELECT json_agg(option_value) FROM enquiry_interests WHERE enquiry_id = e.id AND category = 'food_cuisine')     AS food_cuisines,
              (SELECT id     FROM trip_proposals WHERE enquiry_id = e.id ORDER BY created_at DESC LIMIT 1) AS proposal_id,
              (SELECT status FROM trip_proposals WHERE enquiry_id = e.id ORDER BY created_at DESC LIMIT 1) AS proposal_status
       FROM enquiries e
       JOIN clients c ON c.id = e.client_id
       ORDER BY e.submitted_at DESC`
    );
    res.json({ enquiries: rows });
  } catch (err) { next(err); }
}

async function updateEnquiry(req, res, next) {
  try {
    const { status, notes } = req.body;
    const { rows } = await pool.query(
      'UPDATE enquiries SET status=$1, notes=$2 WHERE id=$3 RETURNING *',
      [status, notes, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ enquiry: rows[0] });
  } catch (err) { next(err); }
}

// ─── Bookings ───────────────────────────────────────────────────

async function listBookings(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, c.full_name, c.email
       FROM bookings b
       JOIN clients c ON c.id = b.client_id
       ORDER BY b.confirmed_at DESC`
    );
    res.json({ bookings: rows });
  } catch (err) { next(err); }
}

async function updateBooking(req, res, next) {
  try {
    const { status, notes, total_price } = req.body;
    const { rows } = await pool.query(
      'UPDATE bookings SET status=$1, notes=$2, total_price=$3 WHERE id=$4 RETURNING *',
      [status, notes, total_price, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ booking: rows[0] });
  } catch (err) { next(err); }
}

async function deleteBooking(req, res, next) {
  try {
    const { rows } = await pool.query('DELETE FROM bookings WHERE id=$1 RETURNING id', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── Admin users ────────────────────────────────────────────────

async function listAdminUsers(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, role, is_active, last_login, created_at FROM admin_users ORDER BY full_name ASC'
    );
    res.json({ users: rows });
  } catch (err) { next(err); }
}

async function createAdminUser(req, res, next) {
  try {
    const { full_name, email, password, role } = req.body;
    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO admin_users (full_name, email, password_hash, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, full_name, email, role, is_active`,
      [full_name, email, password_hash, role ?? 'editor']
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' });
    next(err);
  }
}

async function updateAdminUser(req, res, next) {
  try {
    const { full_name, role, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE admin_users SET full_name=$1, role=$2, is_active=$3 WHERE id=$4
       RETURNING id, full_name, email, role, is_active`,
      [full_name, role, is_active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
}

// ─── Proposals ──────────────────────────────────────────────────

async function listProposals(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT tp.*, c.full_name, c.email,
              e.group_size, e.duration_days, e.budget_range, e.travel_dates, e.status AS enquiry_status
       FROM trip_proposals tp
       JOIN clients c  ON c.id = tp.client_id
       JOIN enquiries e ON e.id = tp.enquiry_id
       ORDER BY tp.created_at DESC`
    );
    res.json({ proposals: rows });
  } catch (err) { next(err); }
}

async function createProposal(req, res, next) {
  try {
    const { enquiry_id } = req.body;
    if (!enquiry_id) return res.status(400).json({ error: 'enquiry_id is required' });

    const { rows: enqRows } = await pool.query('SELECT client_id FROM enquiries WHERE id = $1', [enquiry_id]);
    if (!enqRows[0]) return res.status(404).json({ error: 'Enquiry not found' });

    // Return existing proposal if one already exists for this enquiry
    const { rows: existing } = await pool.query(
      'SELECT * FROM trip_proposals WHERE enquiry_id = $1 ORDER BY created_at DESC LIMIT 1',
      [enquiry_id]
    );
    if (existing[0]) return res.json({ proposal: existing[0] });

    const { rows } = await pool.query(
      'INSERT INTO trip_proposals (enquiry_id, client_id) VALUES ($1, $2) RETURNING *',
      [enquiry_id, enqRows[0].client_id]
    );
    // Bump enquiry to 'reviewed' if still pending
    await pool.query("UPDATE enquiries SET status='reviewed' WHERE id=$1 AND status='pending'", [enquiry_id]);
    res.status(201).json({ proposal: rows[0] });
  } catch (err) { next(err); }
}

async function getProposal(req, res, next) {
  try {
    const { rows: propRows } = await pool.query('SELECT * FROM trip_proposals WHERE id=$1', [req.params.id]);
    if (!propRows[0]) return res.status(404).json({ error: 'Proposal not found' });
    const proposal = propRows[0];

    const { rows: enqRows } = await pool.query(
      `SELECT e.*, c.full_name, c.email,
              json_agg(ei.*) FILTER (WHERE ei.id IS NOT NULL) AS interests
       FROM enquiries e
       JOIN clients c ON c.id = e.client_id
       LEFT JOIN enquiry_interests ei ON ei.enquiry_id = e.id
       WHERE e.id = $1
       GROUP BY e.id, c.full_name, c.email`,
      [proposal.enquiry_id]
    );

    const { rows: items } = await pool.query(
      'SELECT * FROM proposal_items WHERE proposal_id=$1 ORDER BY day_number ASC, sort_order ASC',
      [proposal.id]
    );

    res.json({ proposal: { ...proposal, enquiry: enqRows[0], items } });
  } catch (err) { next(err); }
}

async function updateProposal(req, res, next) {
  try {
    const { status, total_price, client_message, admin_notes } = req.body;
    const { rows } = await pool.query(
      `UPDATE trip_proposals
       SET status=$1, total_price=$2, client_message=$3, admin_notes=$4, updated_at=now()
       WHERE id=$5 RETURNING *`,
      [status, total_price || null, client_message || null, admin_notes || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ proposal: rows[0] });
  } catch (err) { next(err); }
}

async function addProposalItem(req, res, next) {
  try {
    const { day_number, item_type, title, description, price } = req.body;
    const { rows: orderRows } = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM proposal_items WHERE proposal_id=$1 AND day_number=$2',
      [req.params.id, day_number]
    );
    const { rows } = await pool.query(
      `INSERT INTO proposal_items (proposal_id, day_number, item_type, title, description, price, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.id, day_number, item_type, title, description || null, price || null, orderRows[0].max_order + 1]
    );
    res.status(201).json({ item: rows[0] });
  } catch (err) { next(err); }
}

async function updateProposalItem(req, res, next) {
  try {
    const { title, description, price, day_number, item_type } = req.body;
    const { rows } = await pool.query(
      `UPDATE proposal_items SET title=$1, description=$2, price=$3, day_number=$4, item_type=$5
       WHERE id=$6 AND proposal_id=$7 RETURNING *`,
      [title, description || null, price || null, day_number, item_type, req.params.itemId, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ item: rows[0] });
  } catch (err) { next(err); }
}

async function deleteProposalItem(req, res, next) {
  try {
    await pool.query('DELETE FROM proposal_items WHERE id=$1 AND proposal_id=$2', [req.params.itemId, req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

async function convertProposalToBooking(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: propRows } = await client.query('SELECT * FROM trip_proposals WHERE id=$1', [req.params.id]);
    if (!propRows[0]) return res.status(404).json({ error: 'Proposal not found' });
    const proposal = propRows[0];

    await client.query("UPDATE trip_proposals SET status='confirmed', updated_at=now() WHERE id=$1", [proposal.id]);
    const { rows: bookingRows } = await client.query(
      `INSERT INTO bookings (enquiry_id, client_id, status, total_price, currency, notes)
       VALUES ($1,$2,'confirmed',$3,'SGD',$4) RETURNING *`,
      [proposal.enquiry_id, proposal.client_id, proposal.total_price || 0, proposal.client_message || null]
    );
    await client.query("UPDATE enquiries SET status='converted' WHERE id=$1", [proposal.enquiry_id]);
    await client.query('COMMIT');
    res.json({ booking: bookingRows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// ─── Auto-populate proposal from enquiry interests ────────────────

async function autoPopulateProposal(req, res, next) {
  const client = await pool.connect();
  try {
    const { rows: propRows } = await client.query(
      `SELECT tp.*, e.duration_days, e.id AS enq_id
       FROM trip_proposals tp JOIN enquiries e ON e.id = tp.enquiry_id
       WHERE tp.id = $1`,
      [req.params.id]
    );
    if (!propRows[0]) return res.status(404).json({ error: 'Not found' });
    const prop = propRows[0];

    const { rows: interests } = await client.query(
      'SELECT category, option_value FROM enquiry_interests WHERE enquiry_id = $1',
      [prop.enq_id]
    );

    const DURATION_MAP = { '3–5 days': 5, '1 week': 7, '2 weeks+': 14 };
    const numDays = DURATION_MAP[prop.duration_days] || 7;

    const medical       = interests.filter(i => i.category === 'medical');
    const accommodation = interests.filter(i => i.category === 'accommodation');
    const transport     = interests.filter(i => i.category === 'transport');
    const activities    = interests.filter(i => i.category === 'activity');

    const toCreate = [];

    // Medical interests → Day 2 (day after arrival)
    medical.forEach((i, idx) => {
      toCreate.push({ day_number: Math.min(2, numDays), item_type: 'medical',       title: i.option_value,               sort_order: idx });
    });

    // Accommodation → every day from Day 1
    accommodation.forEach(i => {
      for (let d = 1; d <= numDays; d++) {
        toCreate.push({ day_number: d, item_type: 'accommodation', title: i.option_value, sort_order: 1 });
      }
    });

    // Transport
    transport.forEach(i => {
      const v = i.option_value;
      if (v === 'Airport Transfer') {
        toCreate.push({ day_number: 1,       item_type: 'transport', title: 'Airport Transfer (Arrival)',   sort_order: 0 });
        toCreate.push({ day_number: numDays, item_type: 'transport', title: 'Airport Transfer (Departure)', sort_order: 99 });
      } else if (v === 'Hospital Transfers') {
        toCreate.push({ day_number: Math.min(2, numDays), item_type: 'transport', title: 'Hospital Transfer', sort_order: medical.length + 1 });
      } else if (v === 'Daily Transport') {
        for (let d = 1; d <= numDays; d++) {
          toCreate.push({ day_number: d, item_type: 'transport', title: 'Daily Transport', sort_order: 2 });
        }
      }
    });

    // Activities → spread from Day 3 (or Day 2 if no medical)
    const actStart = medical.length > 0 ? 3 : 2;
    activities.forEach((i, idx) => {
      toCreate.push({ day_number: Math.min(actStart + idx, numDays), item_type: 'activity', title: i.option_value, sort_order: 10 + idx });
    });

    if (toCreate.length === 0) return res.json({ items: [] });

    await client.query('BEGIN');
    const created = [];
    for (const item of toCreate) {
      const { rows } = await client.query(
        `INSERT INTO proposal_items (proposal_id, day_number, item_type, title, sort_order)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.params.id, item.day_number, item.item_type, item.title, item.sort_order]
      );
      created.push(rows[0]);
    }
    await client.query('COMMIT');
    res.json({ items: created });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// ─── Batch reorder proposal items (DnD) ───────────────────────────

async function reorderProposalItems(req, res, next) {
  const client = await pool.connect();
  try {
    const { items } = req.body; // [{ id, day_number, sort_order }]
    if (!Array.isArray(items) || items.length === 0) return res.json({ ok: true });
    await client.query('BEGIN');
    for (const { id, day_number, sort_order } of items) {
      await client.query(
        'UPDATE proposal_items SET day_number=$1, sort_order=$2 WHERE id=$3 AND proposal_id=$4',
        [day_number, sort_order ?? 0, id, req.params.id]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = {
  adminLogin, adminLogout, adminMe,
  listServices, createService, updateService, deleteService,
  listStay, createStay, updateStay, deleteStay,
  listTransport, createTransport, updateTransport, deleteTransport,
  listActivities, createActivity, updateActivity, deleteActivity,
  listPartners, createPartner, updatePartner, deletePartner,
  listEnquiries, updateEnquiry,
  listProposals, createProposal, getProposal, updateProposal,
  addProposalItem, updateProposalItem, deleteProposalItem, convertProposalToBooking,
  autoPopulateProposal, reorderProposalItems,
  listBookings, updateBooking, deleteBooking,
  listAdminUsers, createAdminUser, updateAdminUser,
};
