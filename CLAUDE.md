# HopnHeal — Project Context for Claude Code

## What is HopnHeal?

HopnHeal is a **medical tourism concierge website for Singapore**. Think of it like Airbnb, but for medical travel packages — customers can browse available services, sign up for an account, fill in their trip requirements, and track their bookings end-to-end.

The target user is someone travelling to Singapore from abroad who needs help organising: a medical procedure or health screening, accommodation, transport, and activities — all in one place.

---

## Design Inspiration

The UI should feel similar to **https://timeleft.com** — clean, modern, friendly:
- Dark background (near-black) with cream/white text
- Bold, large hero typography
- Rounded cards with soft hover states
- Smooth scroll sections
- Conversational, warm tone in copy
- Clear CTA buttons (high contrast, rounded)
- Scrolling logo strip for affiliations/partners

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL via **Supabase** (cloud-hosted) |
| Auth | JWT (JSON Web Tokens) stored in httpOnly cookies |
| Styling | Tailwind CSS |
| ORM | pg (node-postgres) — raw SQL, no ORM |
| File Storage | Supabase Storage (for image uploads) |

---

## Project Structure

```
hopnheal/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # Auth context / global state
│   │   └── api/             # Axios API call helpers
│   └── index.html
├── server/                  # Express backend
│   ├── routes/              # Express route files
│   ├── controllers/         # Route handler logic
│   ├── middleware/           # Auth middleware, error handler
│   ├── db/
│   │   ├── pool.js          # Supabase PostgreSQL connection pool
│   │   └── schema.sql       # Full DB schema (source of truth — run once in Supabase SQL editor)
│   └── index.js             # Express app entry point
├── .env                     # Environment variables (never commit)
├── .env.example             # Template for .env
└── CLAUDE.md                # This file
```

---

## Website Pages

### Public pages (no login required)
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, how it works, featured services, affiliations |
| Medical Services | `/services` | Browse available medical procedures/screenings |
| Service Detail | `/services/:slug` | Full detail page for one service |
| Accommodations | `/stay` | Hotels and serviced apartments |
| Transport | `/transport` | Car and vehicle options |
| Activities | `/activities` | Things to do in Singapore |
| Affiliations | `/partners` | Partner hospitals and organisations |
| Sign Up | `/signup` | Create a client account |
| Log In | `/login` | Client login |

### Authenticated pages (login required)
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Overview of bookings + enquiry status |
| My Enquiries | `/enquiries` | List of all submitted enquiries |
| New Enquiry | `/enquiries/new` | Submit a new trip enquiry |
| Enquiry Detail | `/enquiries/:id` | View / edit a single enquiry (if still pending) |
| My Bookings | `/bookings` | List of confirmed bookings |
| Booking Detail | `/bookings/:id` | Full detail for one booking |
| Profile | `/profile` | Edit account info |

### Admin pages (admin login required)
| Page | Route | Description |
|------|-------|-------------|
| Admin Dashboard | `/admin` | Overview stats |
| Manage Services | `/admin/services` | Add / edit / publish medical services |
| Manage Stays | `/admin/stay` | Add / edit accommodations |
| Manage Transport | `/admin/transport` | Add / edit transport options |
| Manage Activities | `/admin/activities` | Add / edit activities |
| Manage Affiliations | `/admin/partners` | Add / edit partner logos |
| Manage Enquiries | `/admin/enquiries` | View and update enquiry status |
| Manage Bookings | `/admin/bookings` | View and manage all bookings |
| Admin Users | `/admin/users` | Add / deactivate admin accounts |

---

## Database Schema

### Table: CLIENTS
Stores customer accounts (website login).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | auto-generated |
| full_name | VARCHAR(120) | |
| email | VARCHAR(255) UNIQUE | login email |
| phone | VARCHAR(30) | international format |
| country | VARCHAR(80) | country of origin |
| password_hash | VARCHAR(255) | bcrypt |
| created_at | TIMESTAMP | UTC |
| last_login | TIMESTAMP | UTC |

### Table: ENQUIRIES
A client can submit **multiple enquiries** over time (e.g. one trip for cardiac screening, another trip later for orthopaedics). Each enquiry is independent and tracks its own status.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| client_id | UUID FK → CLIENTS | |
| group_size | VARCHAR(30) | 'Just me', '2–3 people', '4+ people' |
| duration_days | VARCHAR(30) | '3–5 days', '1 week', '2 weeks+' |
| budget_range | VARCHAR(50) | 'Under $5k', '$5k–$10k', '$10k+' |
| status | VARCHAR(30) | pending / reviewed / converted / closed |
| submitted_at | TIMESTAMP | UTC |
| notes | TEXT | internal admin notes |

### Table: ENQUIRY_INTERESTS
Multi-select answers from the enquiry form (one row per selected option).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| enquiry_id | UUID FK → ENQUIRIES | |
| category | VARCHAR(50) | medical / accommodation / transport / activity |
| option_value | VARCHAR(120) | e.g. 'Cardiac Screening' |

### Table: BOOKINGS
Confirmed booking linked to an enquiry.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| enquiry_id | UUID FK → ENQUIRIES | |
| client_id | UUID FK → CLIENTS | |
| status | VARCHAR(30) | confirmed / in_progress / completed / cancelled |
| total_price | DECIMAL(10,2) | |
| currency | VARCHAR(3) | SGD, USD, etc. |
| confirmed_at | TIMESTAMP | UTC |
| notes | TEXT | special requests |

### Table: BOOKING_ITEMS
Line items within a booking (each service, stay, car, activity).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| booking_id | UUID FK → BOOKINGS | |
| item_type | VARCHAR(30) | medical / accommodation / transport / activity |
| item_id | UUID | ID in the relevant content table |
| quantity | INT | nights / people / days |
| unit_price | DECIMAL(10,2) | price at time of booking |
| custom_notes | TEXT | guest-specific notes |

### Table: MEDICAL_SERVICES
CMS content for the medical services page.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| title | VARCHAR(150) | e.g. 'Cardiac Health Screening' |
| slug | VARCHAR(150) UNIQUE | URL-safe e.g. cardiac-health-screening |
| specialty | VARCHAR(80) | e.g. Cardiology, Oncology |
| description | TEXT | full body content |
| image_url | VARCHAR(500) | Supabase Storage URL |
| sort_order | INT | listing order |

### Table: ACCOMMODATIONS
Prices are **indicative** (set by admin, not fetched live). Displayed as "from SGD X/night" on the frontend.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR(150) | |
| slug | VARCHAR(150) UNIQUE | |
| type | VARCHAR(50) | Hotel / Serviced Apartment / Resort |
| location | VARCHAR(150) | Singapore district |
| description | TEXT | |
| image_url | VARCHAR(500) | Supabase Storage URL |
| price_from | DECIMAL(10,2) | SGD — indicative starting price |
| is_published | BOOLEAN | |

### Table: TRANSPORT_OPTIONS
Prices are **indicative** (set by admin). Displayed as "from SGD X/day" on the frontend.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| vehicle_type | VARCHAR(80) | e.g. Luxury Sedan, MPV |
| description | TEXT | |
| image_url | VARCHAR(500) | Supabase Storage URL |
| capacity | INT | max passengers |
| price_from | DECIMAL(10,2) | SGD — indicative daily rate |
| is_published | BOOLEAN | |

### Table: ACTIVITIES
Prices are **indicative** (set by admin). Displayed as "from SGD X/person" on the frontend.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| title | VARCHAR(150) | |
| slug | VARCHAR(150) UNIQUE | |
| category | VARCHAR(80) | Cultural / Wellness / Adventure |
| description | TEXT | |
| image_url | VARCHAR(500) | Supabase Storage URL |
| price_from | DECIMAL(10,2) | SGD — indicative price per person |
| is_published | BOOLEAN | |

### Table: AFFILIATIONS

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| partner_name | VARCHAR(150) | |
| logo_url | VARCHAR(500) | |
| website_url | VARCHAR(500) | |
| description | VARCHAR(300) | one-liner |
| sort_order | INT | |
| is_published | BOOLEAN | |

### Table: ADMIN_USERS
Completely separate from CLIENTS — backend staff only.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| full_name | VARCHAR(120) | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt |
| role | VARCHAR(30) | super_admin / editor / viewer |
| is_active | BOOLEAN | |
| last_login | TIMESTAMP | UTC |

---

## API Design Convention

All API routes are prefixed with `/api`.

### Auth
- `POST /api/auth/signup` — create client account
- `POST /api/auth/login` — return JWT in httpOnly cookie
- `POST /api/auth/logout` — clear cookie
- `GET  /api/auth/me` — return current user from token

### Client routes (require client JWT)
- `GET     /api/enquiries/me` — list all own enquiries
- `POST    /api/enquiries` — submit a new enquiry
- `GET     /api/enquiries/:id` — get a single enquiry
- `PUT     /api/enquiries/:id` — update an existing enquiry (only if status is 'pending')
- `GET     /api/bookings/me` — list own bookings
- `GET     /api/bookings/:id` — single booking detail
- `PUT     /api/profile` — update account info

### Public content routes
- `GET /api/services` — list published medical services
- `GET /api/services/:slug` — single service
- `GET /api/stay` — list published accommodations
- `GET /api/transport` — list published transport options
- `GET /api/activities` — list published activities
- `GET /api/partners` — list published affiliations

### Admin routes (require admin JWT + role check)
- `GET/POST/PUT/DELETE /api/admin/services`
- `GET/POST/PUT/DELETE /api/admin/stay`
- `GET/POST/PUT/DELETE /api/admin/transport`
- `GET/POST/PUT/DELETE /api/admin/activities`
- `GET/POST/PUT/DELETE /api/admin/partners`
- `GET/PUT             /api/admin/enquiries`
- `GET/PUT             /api/admin/bookings`
- `GET/POST/PUT        /api/admin/users`

---

## Environment Variables (.env)

```
# Server
PORT=5000
NODE_ENV=development

# Supabase (get these from your Supabase project → Settings → Database)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase Storage (get from Supabase project → Settings → API)
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT
JWT_SECRET=replace_with_long_random_string
JWT_EXPIRES_IN=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

> To find these values: go to supabase.com → your project → Settings → Database (for DATABASE_URL) and Settings → API (for SUPABASE_URL and SUPABASE_SERVICE_KEY).

---

## Key Coding Conventions

- Use **async/await** everywhere, no callbacks
- Wrap all route handlers in try/catch and pass errors to `next(err)`
- Never return password_hash in any API response
- All timestamps stored and returned as UTC
- UUIDs generated with `gen_random_uuid()` in PostgreSQL
- Passwords hashed with **bcrypt** (saltRounds = 12)
- Admin and client auth are **separate middleware** — never mix them
- Frontend API calls go through a central `src/api/axios.js` instance (sets baseURL and withCredentials)
- Use React Context for auth state (`AuthContext`) — store user object, not the token

---

## Development Notes

- Developer is learning to code — explain reasoning when making non-obvious choices
- Prefer simple, readable code over clever one-liners
- Add comments to anything that isn't immediately obvious
- When generating SQL, always use parameterised queries (`$1, $2` etc.) — never string interpolation
- Run `npm run dev` in both `/client` and `/server` folders simultaneously during development

---

## Decisions Locked In

- **Database:** Supabase (hosted PostgreSQL) — no local DB install needed
- **Images:** Stored in Supabase Storage, URLs saved in the DB. Use placeholder images during development.
- **Prices:** All prices are indicative, set manually by admin. Display as "from SGD X" — never fetched live from external sites.
- **Enquiries:** Clients can submit **multiple enquiries** over time. Each enquiry is independent with its own status and booking.

---

## Supabase Setup Steps (do this before writing any code)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project — name it `hopnheal`
3. Once created, go to **SQL Editor** and run the contents of `server/db/schema.sql` to create all tables
4. Go to **Storage** and create a bucket called `images` (set to public)
5. Copy your credentials from **Settings → Database** and **Settings → API** into your `.env` file

---

## Status

Project is in **initial setup** phase. Nothing has been built yet.
Next step: scaffold the folder structure, install dependencies, and set up the Supabase project.
