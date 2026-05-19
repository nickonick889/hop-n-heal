const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/auth');
const enquiriesRoutes = require('./routes/enquiries');
const bookingsRoutes = require('./routes/bookings');
const contentRoutes = require('./routes/content');
const adminRoutes = require('./routes/admin');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // allows the browser to send/receive httpOnly cookies
}));
app.use(express.json());
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiriesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api', contentRoutes);       // /api/services, /api/stay, etc.
app.use('/api/admin', adminRoutes);

// Health-check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── Error handler (must be last) ────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});
