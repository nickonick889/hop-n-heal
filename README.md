# HopnHeal — Medical Tourism Concierge Platform

A full-stack web application for medical tourism in Singapore. Clients travelling from abroad can browse medical services, submit trip enquiries, and receive a fully curated travel proposal — covering medical appointments, accommodation, transport, and activities — which can be converted into a confirmed booking.

**Live site:** https://hop-n-heal.vercel.app

---

## Features

### Client-facing
- Browse medical services, accommodations, transport, and activities
- Step-by-step enquiry form (group size, duration, budget, travel dates, dietary preferences, cuisine preferences)
- Authenticated dashboard to track enquiry status and bookings
- View and edit pending enquiries
- Booking detail view

### Admin panel (`/admin`)
- Separate admin authentication with role-based access (`super_admin` / `editor`)
- Full CRUD for all content: medical services, stays, transport, activities, affiliations
- Enquiry management with internal notes and status updates
- **Proposal builder** — build a day-by-day itinerary for each client:
  - Auto-populate itinerary from enquiry interests
  - Drag-and-drop to reorder or move items across days
  - "Fill all days" for recurring items like accommodation and transport
  - Convert confirmed proposal to a booking
- Booking management with delete support
- Admin user management (super_admin only)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router v7 |
| Styling | Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Supabase (cloud-hosted) |
| Auth | JWT stored in httpOnly cookies |
| File storage | Supabase Storage |
| Drag and drop | @dnd-kit/core, @dnd-kit/sortable |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
hopnheal/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Navbar, Footer, shared UI
│   │   ├── pages/           # Public + authenticated + admin pages
│   │   ├── hooks/           # useFetch custom hook
│   │   ├── context/         # AuthContext, AdminAuthContext
│   │   └── api/             # Axios instance (baseURL + withCredentials)
│   └── vercel.json          # SPA rewrite rule for React Router
└── server/                  # Express backend
    ├── controllers/         # Route handler logic (auth, admin, content)
    ├── routes/              # Express route definitions
    ├── middleware/           # JWT auth guards (client + admin), error handler
    └── db/
        ├── pool.js          # Supabase PostgreSQL connection
        └── schema.sql       # Full database schema
```

---

## Architecture Decisions

- **Separate auth flows** — clients and admins use different JWT cookies (`token` vs `adminToken`) with dedicated middleware, so they can never access each other's routes
- **Raw SQL** — uses `node-postgres` (pg) with parameterised queries throughout; no ORM
- **Role-based admin access** — `super_admin` can delete content and manage admin users; `editor` can create and update but not delete
- **Cross-domain cookies** — `sameSite: 'none' + secure: true` in production to support Vercel (frontend) and Render (backend) on separate domains
- **Auto-populate proposals** — server reads enquiry interests and places items on appropriate days (medical on Day 2, airport transfer on Day 1 and last day, accommodation and daily transport every day, activities from Day 3 onward)

---

## Local Development

### Prerequisites
- Node.js 18+ (or Bun)
- A [Supabase](https://supabase.com) project with the schema applied

### 1. Clone and install

```bash
git clone https://github.com/nickonick889/hop-n-heal.git
cd hop-n-heal

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment variables

Create `server/.env` (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=
```
_(leave empty in development — Vite's dev proxy forwards `/api` to `localhost:5000`)_

### 3. Database setup

Run the contents of `server/db/schema.sql` in the Supabase SQL Editor. This creates all tables and inserts sample data.

### 4. Run the app

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

App runs at `http://localhost:5173`.

---

## Deployment

| Service | What it hosts | Key settings |
|---------|--------------|--------------|
| Vercel | React frontend | Root directory: `client`, env var: `VITE_API_URL` |
| Render | Express backend | Root directory: `server`, start command: `node index.js` |

---

## Database Schema (summary)

| Table | Purpose |
|-------|---------|
| `clients` | Website user accounts |
| `enquiries` | Trip enquiries submitted by clients |
| `enquiry_interests` | Multi-select options from the enquiry form |
| `trip_proposals` | Admin-built itinerary proposals |
| `proposal_items` | Individual day items within a proposal |
| `bookings` | Confirmed bookings converted from proposals |
| `booking_items` | Line items within a booking |
| `medical_services` | CMS content for the services page |
| `accommodations` | CMS content for the stays page |
| `transport_options` | CMS content for the transport page |
| `activities` | CMS content for the activities page |
| `affiliations` | Partner logos for the homepage strip |
| `admin_users` | Admin staff accounts (separate from clients) |
