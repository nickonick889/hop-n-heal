-- =============================================================
-- HopnHeal — Database Schema
-- Run this entire file in Supabase: SQL Editor → New Query → Run
-- =============================================================

-- Enable UUID generation (already enabled in Supabase by default, but just in case)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================
-- CLIENTS
-- Website user accounts (separate from admin users)
-- =============================================================
CREATE TABLE clients (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  country       VARCHAR(80),
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMP
);


-- =============================================================
-- ENQUIRIES
-- A client can submit multiple enquiries over time.
-- Each enquiry = one planned trip to Singapore.
-- =============================================================
CREATE TABLE enquiries (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  group_size    VARCHAR(30),   -- e.g. 'Just me', '2–3 people', '4+ people'
  duration_days VARCHAR(30),   -- e.g. '3–5 days', '1 week', '2 weeks+'
  budget_range  VARCHAR(50),   -- e.g. 'Under $5k', '$5k–$10k', '$10k+'
  status        VARCHAR(30)  NOT NULL DEFAULT 'pending',
                              -- pending | reviewed | converted | closed
  notes         TEXT,          -- internal admin notes only
  submitted_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);


-- =============================================================
-- ENQUIRY_INTERESTS
-- Multi-select options the client chose on the enquiry form.
-- One row per selected option (e.g. 'Cardiac Screening', 'Hotel').
-- =============================================================
CREATE TABLE enquiry_interests (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id   UUID        NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  category     VARCHAR(50) NOT NULL,   -- medical | accommodation | transport | activity
  option_value VARCHAR(120) NOT NULL   -- e.g. 'Cardiac Screening', 'Luxury Sedan'
);


-- =============================================================
-- BOOKINGS
-- A confirmed booking, linked to one enquiry.
-- Created by admin once an enquiry is confirmed.
-- =============================================================
CREATE TABLE bookings (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id   UUID           NOT NULL REFERENCES enquiries(id) ON DELETE RESTRICT,
  client_id    UUID           NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  status       VARCHAR(30)    NOT NULL DEFAULT 'confirmed',
                               -- confirmed | in_progress | completed | cancelled
  total_price  DECIMAL(10,2),
  currency     VARCHAR(3)     NOT NULL DEFAULT 'SGD',
  notes        TEXT,           -- special requests or admin notes
  confirmed_at TIMESTAMP      NOT NULL DEFAULT NOW()
);


-- =============================================================
-- BOOKING_ITEMS
-- Individual line items within a booking.
-- item_type tells you which content table to look up item_id in.
-- =============================================================
CREATE TABLE booking_items (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID           NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  item_type    VARCHAR(30)    NOT NULL,   -- medical | accommodation | transport | activity
  item_id      UUID           NOT NULL,   -- FK to the relevant content table (not enforced at DB level due to polymorphism)
  quantity     INT            NOT NULL DEFAULT 1,  -- nights / days / people
  unit_price   DECIMAL(10,2), -- price locked in at time of booking
  custom_notes TEXT            -- guest-specific notes for this line item
);


-- =============================================================
-- MEDICAL_SERVICES
-- Content for the /services page — managed by admin.
-- =============================================================
CREATE TABLE medical_services (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(150) NOT NULL,
  slug         VARCHAR(150) NOT NULL UNIQUE,  -- URL-safe, e.g. cardiac-health-screening
  specialty    VARCHAR(80),                    -- e.g. Cardiology, Oncology, Orthopaedics
  description  TEXT,
  image_url    VARCHAR(500),                   -- Supabase Storage URL
  price_from   DECIMAL(10,2),                  -- indicative starting price in SGD
  is_published BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order   INT          NOT NULL DEFAULT 0
);


-- =============================================================
-- ACCOMMODATIONS
-- Content for the /stay page — managed by admin.
-- price_from is indicative only (displayed as "from SGD X/night").
-- =============================================================
CREATE TABLE accommodations (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(150)   NOT NULL,
  slug           VARCHAR(150)   NOT NULL UNIQUE,
  type           VARCHAR(50),                    -- Hotel | Serviced Apartment | Resort
  location       VARCHAR(150),                   -- Singapore district e.g. Orchard, Marina Bay
  description    TEXT,
  image_url      VARCHAR(500),                   -- Supabase Storage URL
  price_from     DECIMAL(10,2),                  -- indicative nightly rate in SGD
  is_published   BOOLEAN        NOT NULL DEFAULT FALSE,
  sort_order     INT            NOT NULL DEFAULT 0
);


-- =============================================================
-- TRANSPORT_OPTIONS
-- Content for the /transport page — managed by admin.
-- price_from is indicative only (displayed as "from SGD X/day").
-- =============================================================
CREATE TABLE transport_options (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type VARCHAR(80)    NOT NULL,   -- e.g. Luxury Sedan, MPV, Coach
  description  TEXT,
  image_url    VARCHAR(500),               -- Supabase Storage URL
  capacity     INT,                        -- max number of passengers
  price_from   DECIMAL(10,2),             -- indicative daily rate in SGD
  is_published BOOLEAN        NOT NULL DEFAULT FALSE,
  sort_order   INT            NOT NULL DEFAULT 0
);


-- =============================================================
-- ACTIVITIES
-- Content for the /activities page — managed by admin.
-- price_from is indicative only (displayed as "from SGD X/person").
-- =============================================================
CREATE TABLE activities (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(150)   NOT NULL,
  slug         VARCHAR(150)   NOT NULL UNIQUE,
  category     VARCHAR(80),                  -- Cultural | Wellness | Adventure
  description  TEXT,
  image_url    VARCHAR(500),                 -- Supabase Storage URL
  price_from   DECIMAL(10,2),               -- indicative price per person in SGD
  is_published BOOLEAN        NOT NULL DEFAULT FALSE,
  sort_order   INT            NOT NULL DEFAULT 0
);


-- =============================================================
-- AFFILIATIONS
-- Partner hospitals, clinics, and organisations.
-- Shown as a scrolling logo strip on the homepage.
-- =============================================================
CREATE TABLE affiliations (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name VARCHAR(150)   NOT NULL,
  logo_url     VARCHAR(500),               -- Supabase Storage URL
  website_url  VARCHAR(500),               -- partner's public website
  description  VARCHAR(300),               -- one-line description
  sort_order   INT            NOT NULL DEFAULT 0,
  is_published BOOLEAN        NOT NULL DEFAULT FALSE
);


-- =============================================================
-- ADMIN_USERS
-- Backend staff accounts — completely separate from clients.
-- role controls what they can do in the admin panel.
-- =============================================================
CREATE TABLE admin_users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(30)  NOT NULL DEFAULT 'editor',
                              -- super_admin | editor | viewer
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- =============================================================
-- INDEXES
-- Speed up the most common lookups.
-- =============================================================

-- Find all enquiries for a client quickly
CREATE INDEX idx_enquiries_client_id       ON enquiries(client_id);

-- Find all bookings for a client quickly
CREATE INDEX idx_bookings_client_id        ON bookings(client_id);

-- Find all bookings for an enquiry
CREATE INDEX idx_bookings_enquiry_id       ON bookings(enquiry_id);

-- Find all interests for an enquiry
CREATE INDEX idx_enquiry_interests_enquiry ON enquiry_interests(enquiry_id);

-- Find all line items for a booking
CREATE INDEX idx_booking_items_booking_id  ON booking_items(booking_id);

-- Filter published content quickly on listing pages
CREATE INDEX idx_medical_services_published ON medical_services(is_published, sort_order);
CREATE INDEX idx_accommodations_published   ON accommodations(is_published, sort_order);
CREATE INDEX idx_transport_published        ON transport_options(is_published, sort_order);
CREATE INDEX idx_activities_published       ON activities(is_published, sort_order);
CREATE INDEX idx_affiliations_published     ON affiliations(is_published, sort_order);


-- =============================================================
-- SEED DATA — Sample content so the site isn't empty on first run
-- You can delete this section once you have real content.
-- =============================================================

-- Sample medical services
INSERT INTO medical_services (title, slug, specialty, description, price_from, is_published, sort_order) VALUES
  ('Cardiac Health Screening', 'cardiac-health-screening', 'Cardiology',
   'A comprehensive heart health package including ECG, stress test, echocardiogram, and full blood panel. Conducted at our partner hospitals with same-day results.',
   1200.00, TRUE, 1),
  ('Executive Full-Body Screening', 'executive-full-body-screening', 'Preventive Health',
   'Head-to-toe health assessment covering cancer markers, organ function, metabolic health, and imaging. Ideal for ages 40 and above.',
   2500.00, TRUE, 2),
  ('Orthopaedic Consultation & Surgery', 'orthopaedic-consultation-surgery', 'Orthopaedics',
   'Expert consultation and surgical options for joint replacement, sports injuries, and spine conditions from Singapore''s leading orthopaedic specialists.',
   800.00, TRUE, 3),
  ('Oncology Second Opinion', 'oncology-second-opinion', 'Oncology',
   'Get a thorough second opinion from Singapore''s top oncologists. Includes case review, imaging analysis, and a personalised treatment recommendation report.',
   1800.00, TRUE, 4);

-- Sample accommodations
INSERT INTO accommodations (name, slug, type, location, description, price_from, is_published, sort_order) VALUES
  ('Marina Bay Sands', 'marina-bay-sands', 'Hotel', 'Marina Bay',
   'Iconic five-star hotel with panoramic views of the Singapore skyline. Features world-class dining, a rooftop infinity pool, and easy access to medical facilities.',
   650.00, TRUE, 1),
  ('Orchard Road Serviced Suites', 'orchard-road-serviced-suites', 'Serviced Apartment', 'Orchard',
   'Spacious serviced apartments in the heart of Singapore''s shopping belt. Fully equipped kitchens and weekly housekeeping — ideal for longer medical stays.',
   280.00, TRUE, 2),
  ('Gleneagles Medical Residences', 'gleneagles-medical-residences', 'Serviced Apartment', 'Tanglin',
   'Purpose-built serviced residences adjacent to Gleneagles Hospital. Perfect for patients who need close proximity to their medical team.',
   220.00, TRUE, 3);

-- Sample transport options
INSERT INTO transport_options (vehicle_type, description, capacity, price_from, is_published, sort_order) VALUES
  ('Luxury Sedan', 'Private Mercedes E-Class or equivalent. Perfect for airport transfers and hospital visits. Professional, English-speaking driver included.', 3, 120.00, TRUE, 1),
  ('Premium MPV', 'Spacious Toyota Alphard or equivalent — ideal for families or groups. Comfortable for post-procedure travel with extra luggage space.', 6, 180.00, TRUE, 2),
  ('Wheelchair-Accessible Van', 'Fully equipped accessible vehicle with ramp and secure wheelchair restraints. Trained driver experienced with medical passengers.', 4, 150.00, TRUE, 3);

-- Sample activities
INSERT INTO activities (title, slug, category, description, price_from, is_published, sort_order) VALUES
  ('Gardens by the Bay Tour', 'gardens-by-the-bay-tour', 'Cultural',
   'A guided tour through Singapore''s iconic Gardens by the Bay, including the Cloud Forest and Flower Dome. A peaceful way to spend a recovery day.',
   45.00, TRUE, 1),
  ('Traditional Wellness & Spa Day', 'traditional-wellness-spa-day', 'Wellness',
   'A full day of relaxation with traditional Asian wellness treatments — includes a Malay massage, herbal bath, and reflexology session.',
   220.00, TRUE, 2),
  ('Singapore River Cruise & Chinatown Walk', 'singapore-river-cruise-chinatown', 'Cultural',
   'A relaxed half-day experience combining a bumboat river cruise with a guided heritage walk through Chinatown. Great for companions of patients.',
   65.00, TRUE, 3);

-- Sample affiliations
INSERT INTO affiliations (partner_name, logo_url, website_url, description, sort_order, is_published) VALUES
  ('Gleneagles Hospital',    '', 'https://www.gleneagles.com.sg',      'Leading private hospital in Singapore',         1, TRUE),
  ('Mount Elizabeth Hospital','', 'https://www.mountelizabeth.com.sg', 'World-class tertiary care hospital',            2, TRUE),
  ('Parkway Pantai',         '', 'https://www.parkwaypantai.com',      'Asia''s leading private healthcare group',      3, TRUE),
  ('Singapore Tourism Board','', 'https://www.stb.gov.sg',            'Official tourism authority of Singapore',       4, TRUE),
  ('IHH Healthcare',         '', 'https://www.ihhhealthcare.com',      'International healthcare network',              5, TRUE);

-- =============================================================
-- END OF SCHEMA
-- =============================================================
