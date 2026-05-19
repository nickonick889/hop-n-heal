import { Link } from 'react-router-dom';
import {
  ClipboardList, PackageCheck, Plane, HeartPulse,
  BedDouble, Car, TreePalm, ArrowRight, ShieldCheck,
  Building2, Microscope, Brain, Bone, Baby,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Static placeholder data ─────────────────────────────────────
// These will eventually be fetched from /api/services etc.

const STEPS = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Tell us what you need',
    body: 'Fill in a short enquiry — your group size, budget, medical interests, and travel dates.',
  },
  {
    number: '02',
    icon: PackageCheck,
    title: 'We build your package',
    body: 'Our team reviews your enquiry and puts together a personalised itinerary with every detail covered.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'You confirm & pay',
    body: "Review your custom package, request any changes, and confirm when you're ready.",
  },
  {
    number: '04',
    icon: Plane,
    title: 'Travel with confidence',
    body: 'Arrive in Singapore knowing everything is arranged — from your first appointment to your last activity.',
  },
];

const SERVICES = [
  { icon: HeartPulse, title: 'Cardiac Health Screening',   specialty: 'Cardiology' },
  { icon: Microscope, title: 'Cancer Screening',           specialty: 'Oncology' },
  { icon: Bone,       title: 'Orthopaedic Assessment',     specialty: 'Orthopaedics' },
  { icon: Brain,      title: 'Neurology Consultation',     specialty: 'Neurology' },
  { icon: Baby,       title: 'Fertility Treatment',        specialty: 'Reproductive' },
  { icon: Building2,  title: 'Executive Health Check',     specialty: 'General Medicine' },
];

const CATEGORIES = [
  {
    icon: BedDouble,
    title: 'Accommodation',
    body: 'From luxury hotels to serviced apartments — we arrange your stay close to your medical centre.',
    to: '/stay',
  },
  {
    icon: Car,
    title: 'Transport',
    body: 'Private vehicles for airport transfers, hospital runs, and everything in between.',
    to: '/transport',
  },
  {
    icon: TreePalm,
    title: 'Activities',
    body: 'Make the most of your time in Singapore with curated cultural, wellness and leisure experiences.',
    to: '/activities',
  },
];

const PARTNERS = [
  'Singapore General Hospital',
  'Mount Elizabeth',
  'Gleneagles Hospital',
  'Raffles Medical',
  'National University Hospital',
  'Parkway Health',
  'Thomson Medical',
  'Farrer Park Hospital',
];

const STATS = [
  { value: '16+',   label: 'World-class hospitals' },
  { value: '10+',   label: 'Medical specialties' },
  { value: '100+',  label: 'Countries served' },
];

// ─── Page ────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden">
        {/* Soft radial glow — gold tint works on both dark and light bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,169,110,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Eyebrow label */}
          <p className="text-accent text-xs tracking-[0.3em] uppercase mb-8 font-medium">
            Medical Tourism Concierge · Singapore
          </p>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl text-text leading-[1.05] mb-8"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Your medical journey,
            <br />
            <span className="italic text-accent">taken care of.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Medical procedures, accommodation, transport and activities in Singapore —
            all planned and managed so you can focus on what matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/services"
              className="bg-accent text-[#080808] font-semibold px-8 py-4 rounded-full text-base hover:bg-accent-hover transition-colors w-full sm:w-auto"
            >
              Browse Services
            </Link>
            <Link
              to="/signup"
              className="border border-border-hover text-text font-medium px-8 py-4 rounded-full text-base hover:border-accent hover:text-accent transition-colors w-full sm:w-auto"
            >
              Get started free
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-xs tracking-widest uppercase text-muted">scroll</span>
          <div className="w-px h-8 bg-muted" />
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────── */}
      <section className="border-y border-border py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 divide-x divide-border">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-2 px-4">
              <span
                className="text-3xl md:text-4xl text-accent mb-1"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {value}
              </span>
              <span className="text-xs text-muted text-center">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">Process</p>
          <h2
            className="text-4xl md:text-5xl text-text"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Here's how it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ number, icon: Icon, title, body }) => (
            <div
              key={number}
              className="bg-surface border border-border rounded-2xl p-6 hover:border-border-hover transition-colors"
            >
              <span className="text-xs font-mono text-accent mb-4 block">{number}</span>
              <Icon size={24} className="text-accent mb-4" strokeWidth={1.5} />
              <h3 className="text-base font-semibold text-text mb-3">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">Medical</p>
            <h2
              className="text-4xl md:text-5xl text-text"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              World-class care,<br />one booking
            </h2>
          </div>
          <Link
            to="/services"
            className="flex items-center gap-2 text-sm text-accent hover:gap-3 transition-all shrink-0"
          >
            View all services <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map(({ icon: Icon, title, specialty }) => (
            <Link
              key={title}
              to="/services"
              className="group bg-surface border border-border rounded-2xl p-6 hover:border-accent/30 hover:bg-surface-hover transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-alt flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                <Icon size={20} className="text-accent" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-muted mb-1">{specialty}</p>
              <h3 className="text-base font-medium text-text group-hover:text-accent transition-colors">
                {title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ── More than medical ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">All-inclusive</p>
          <h2
            className="text-4xl md:text-5xl text-text"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            More than just medical care
          </h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            We coordinate every part of your trip so there's nothing left to figure out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map(({ icon: Icon, title, body, to }) => (
            <Link
              key={title}
              to={to}
              className="group relative bg-surface border border-border rounded-2xl p-8 hover:border-accent/30 transition-all overflow-hidden"
            >
              {/* Subtle corner glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon size={28} className="text-accent mb-5" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-text mb-3">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{body}</p>
              <div className="mt-6 flex items-center gap-2 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Partners marquee ──────────────────────────────── */}
      <section className="border-y border-border py-10 overflow-hidden">
        <p className="text-center text-xs tracking-[0.3em] uppercase text-muted-dark mb-8">
          Affiliated with Singapore's leading healthcare providers
        </p>
        {/* Double the list so the marquee loops seamlessly */}
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...PARTNERS, ...PARTNERS].map((name, i) => (
            <span key={i} className="text-sm font-medium text-muted-dark hover:text-muted transition-colors shrink-0">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div
          className="bg-surface rounded-3xl border border-accent/20 p-12 md:p-20 text-center relative overflow-hidden"
          style={{
            // the radial gradient sits on top of bg-surface; using var(--surface)
            // here means the gradient overlay blends with whichever theme is active
            backgroundImage: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 70%)',
          }}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-6">Start today</p>
          <h2
            className="text-4xl md:text-6xl text-text mb-6"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Ready to plan your
            <br />
            <span className="italic">Singapore journey?</span>
          </h2>
          <p className="text-muted max-w-md mx-auto mb-10">
            Create a free account and submit your first enquiry in under 5 minutes.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-accent text-[#080808] font-semibold px-10 py-4 rounded-full text-base hover:bg-accent-hover transition-colors"
          >
            Get started — it's free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
