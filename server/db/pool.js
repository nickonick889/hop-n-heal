const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Single connection pool shared across the whole app.
// pg reads DATABASE_URL automatically when the env var is set.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL in production; in development it's fine too.
  ssl: {
    rejectUnauthorized: false,
  },
});

// Quick smoke-test on startup so you know immediately if the DB is unreachable.
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  Failed to connect to database:', err.message);
  } else {
    console.log('✅  Connected to Supabase PostgreSQL');
    release();
  }
});

module.exports = pool;
