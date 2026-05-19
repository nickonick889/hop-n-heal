-- HopnHeal — Extra Sample Data
-- Run this AFTER schema.sql if you want more sample content.
-- schema.sql already inserts a small starter set; this file adds extras.
--
-- Safe to run on top of schema.sql:
--   - medical_services, accommodations, activities use ON CONFLICT (slug) DO NOTHING
--   - transport_options has no unique slug, so only genuinely new vehicles are listed here

-- ─── Additional Medical Services ─────────────────────────────────

INSERT INTO medical_services (title, slug, specialty, description, image_url, price_from, sort_order, is_published)
VALUES
  (
    'Cancer Screening',
    'cancer-screening',
    'Oncology',
    'Full-body cancer screening combining PET-CT imaging, tumour marker blood tests, and a specialist oncology review. Designed to detect abnormalities at the earliest, most treatable stage — with same-day results review where possible.',
    'https://picsum.photos/seed/oncology/800/500',
    3200.00, 5, TRUE
  ),
  (
    'Neurology Consultation',
    'neurology-consultation',
    'Neurology',
    'Specialist assessment for headaches, memory concerns, balance issues, epilepsy, and other neurological conditions. Includes EEG, nerve conduction studies, and brain MRI if indicated — reviewed by a senior neurologist on the same visit.',
    'https://picsum.photos/seed/neurology/800/500',
    950.00, 6, TRUE
  ),
  (
    'Fertility Treatment',
    'fertility-treatment',
    'Reproductive Medicine',
    'Personalised fertility evaluation and treatment planning for individuals and couples. Services include IVF, IUI, fertility preservation, and hormonal assessment — delivered by Singapore''s top reproductive endocrinologists in modern, discreet facilities.',
    'https://picsum.photos/seed/fertility/800/500',
    5000.00, 7, TRUE
  )
ON CONFLICT (slug) DO NOTHING;

-- ─── Additional Accommodations ────────────────────────────────────

INSERT INTO accommodations (name, slug, type, location, description, image_url, price_from, sort_order, is_published)
VALUES
  (
    'Ascott Orchard Singapore',
    'ascott-orchard',
    'Serviced Apartment',
    'Orchard Road',
    'Spacious fully-serviced apartments in the heart of Orchard Road. Each unit comes with a full kitchen, separate living area, and weekly housekeeping — ideal for longer medical stays. A short drive to Mount Elizabeth and Gleneagles hospitals.',
    'https://picsum.photos/seed/ascottorchard/800/500',
    220.00, 4, TRUE
  ),
  (
    'Capri by Fraser Changi City',
    'capri-fraser-changi',
    'Serviced Apartment',
    'Changi & East Singapore',
    'Modern serviced apartments connected directly to Changi City Point mall. Stylish studios and one-bedroom units with full cooking facilities and a rooftop pool. Convenient for Parkway East Hospital and Thomson Medical Centre.',
    'https://picsum.photos/seed/caprifraser/800/500',
    185.00, 5, TRUE
  ),
  (
    'Hotel Jen Orchardgateway',
    'hotel-jen-orchardgateway',
    'Hotel',
    'Orchard Road',
    'A vibrant, well-located hotel directly connected to the Orchardgateway mall and Orchard MRT. Stylish contemporary rooms, a rooftop pool with city views, and excellent value for money. Walking distance to specialist clinics along Orchard and Grange Roads.',
    'https://picsum.photos/seed/hoteljenorchard/800/500',
    165.00, 6, TRUE
  ),
  (
    'The St. Regis Singapore',
    'st-regis-singapore',
    'Hotel',
    'Orchard Road',
    'Refined luxury in the heart of Orchard''s golden mile. Impeccably appointed rooms, butler service for every guest, and the indulgent Remède Spa. Set within minutes of Singapore''s top private hospitals — ideal for those who want to recover in complete comfort.',
    'https://picsum.photos/seed/stregissg/800/500',
    550.00, 7, TRUE
  )
ON CONFLICT (slug) DO NOTHING;

-- ─── Additional Transport Options ────────────────────────────────
-- (schema.sql already has Luxury Sedan, Premium MPV, Wheelchair Van)
-- Only adding vehicle types not already in the starter set.

INSERT INTO transport_options (vehicle_type, description, image_url, capacity, price_from, sort_order, is_published)
VALUES
  (
    'Premium SUV',
    'BMW X5 or equivalent. The perfect blend of comfort and road presence. Spacious boot for luggage, raised seating for easy entry and exit, and a smooth suspension — ideal for passengers recovering from procedures.',
    'https://picsum.photos/seed/premiumsuv/800/500',
    4, 100.00, 4, TRUE
  ),
  (
    'Luxury Van',
    'Mercedes-Benz V-Class or equivalent. Our largest private vehicle — great for groups or clients needing a spacious, comfortable ride. All drivers are trained in passenger assistance for medical travellers.',
    'https://picsum.photos/seed/luxuryvans/800/500',
    7, 150.00, 5, TRUE
  );

-- ─── Additional Activities ────────────────────────────────────────

INSERT INTO activities (title, slug, category, description, image_url, price_from, sort_order, is_published)
VALUES
  (
    'Singapore Botanic Gardens',
    'singapore-botanic-gardens',
    'Wellness',
    'Stroll through 160 years of tropical horticultural history in this UNESCO World Heritage-listed park. Home to over 1,000 orchid species in the National Orchid Garden. A tranquil, restorative space to walk at your own pace — ideal for gentle recovery days.',
    'https://picsum.photos/seed/botanicgardens/800/500',
    30.00, 4, TRUE
  ),
  (
    'Sentosa Island Day Trip',
    'sentosa-island',
    'Adventure',
    'Spend a full day on Singapore''s leisure island. Visit Universal Studios, the S.E.A. Aquarium, Palawan Beach, or iFly Singapore indoor skydiving. Our guided packages handle all transport and entry tickets so you can simply enjoy the experience.',
    'https://picsum.photos/seed/sentosaisland/800/500',
    80.00, 5, TRUE
  ),
  (
    'Hawker Food Tour',
    'hawker-food-tour',
    'Cultural',
    'A guided evening walk through Singapore''s famous hawker centres — Maxwell Food Centre, Lau Pa Sat, and Chinatown Complex. Taste satay, laksa, char kway teow, and chilli crab with a knowledgeable local guide who shares the stories behind each dish.',
    'https://picsum.photos/seed/hawkerfoodtour/800/500',
    60.00, 6, TRUE
  ),
  (
    'Spa & Wellness Day',
    'spa-wellness-day',
    'Wellness',
    'A full day at one of Singapore''s award-winning luxury spas. Choose from Remède Spa at St. Regis, Willow Stream at Fairmont, or The Ritz-Carlton Spa. Includes signature massage, body treatment, and access to thermal pools. The ideal recovery day.',
    'https://picsum.photos/seed/spawellness/800/500',
    120.00, 7, TRUE
  ),
  (
    'Night Safari Experience',
    'night-safari',
    'Adventure',
    'The world''s first nocturnal wildlife park, home to over 2,500 animals from 130 species. Board the guided tram or walk the jungle trails as night creatures come to life. An unforgettable evening experience that is both relaxing and awe-inspiring.',
    'https://picsum.photos/seed/nightsafari/800/500',
    55.00, 8, TRUE
  ),
  (
    'Marina Bay Sands SkyPark',
    'marina-bay-sands-skypark',
    'Cultural',
    'Visit the 57th-floor SkyPark Observation Deck for a 360° panoramic view of Singapore''s skyline, Sentosa, and the Strait of Malacca. The best vantage point in the city — especially spectacular at sunset. Includes a cocktail at Ku Dé Ta bar.',
    'https://picsum.photos/seed/skypark/800/500',
    25.00, 9, TRUE
  ),
  (
    'Singapore River Cruise',
    'singapore-river-cruise',
    'Cultural',
    'A leisurely bumboat ride along the Singapore River from Clarke Quay to Marina Bay. Pass colonial landmarks, the Merlion, and glittering hotel facades reflected in the water. Available day and night — the evening cruise is particularly magical.',
    'https://picsum.photos/seed/rivercruise/800/500',
    40.00, 10, TRUE
  )
ON CONFLICT (slug) DO NOTHING;
