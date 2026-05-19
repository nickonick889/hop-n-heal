import { Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnquiryCTA from '../components/EnquiryCTA';
import { useFetch } from '../hooks/useFetch';

// ─── Sub-components ───────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="aspect-[16/10] bg-border" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-border rounded w-1/2" />
        <div className="h-4 bg-border rounded w-full" />
        <div className="h-4 bg-border rounded w-4/5" />
      </div>
    </div>
  );
}

function TransportCard({ option }) {
  return (
    <div className="group border border-border rounded-2xl overflow-hidden bg-surface hover:border-accent/40 transition-all">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10] bg-gradient-to-br from-surface-alt to-border">
        {option.image_url && (
          <img
            src={option.image_url}
            alt={option.vehicle_type}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {/* Capacity badge — top left */}
        {option.capacity != null && (
          <span className="absolute top-3 left-3 bg-bg/80 backdrop-blur-sm text-text text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Users size={11} /> Up to {option.capacity} passengers
          </span>
        )}
        {/* Price badge — bottom right */}
        {option.price_from != null && (
          <div className="absolute bottom-3 right-3 bg-accent text-[#080808] text-xs font-semibold px-3 py-1.5 rounded-full">
            from SGD {Number(option.price_from).toLocaleString()} / day
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-semibold text-text text-base mb-2 group-hover:text-accent transition-colors">
          {option.vehicle_type}
        </h3>
        <p className="text-muted text-sm leading-relaxed line-clamp-3">
          {option.description}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function TransportPage() {
  const { data, loading, error } = useFetch('/api/transport');
  const options = data?.transport || [];

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">

        {/* Page header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-3">Getting around</p>
          <h1
            className="text-4xl md:text-5xl text-text mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Private Transport
          </h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            Comfortable, door-to-door transport with professional drivers — covering airport
            arrivals, hospital transfers, and everything in between.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-24">
            <p className="text-muted text-lg">Could not load transport options. Please try again later.</p>
          </div>
        )}

        {/* Cards — 2-col grid since transport has fewer items */}
        {!loading && !error && options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {options.map(o => <TransportCard key={o.id} option={o} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && options.length === 0 && (
          <div className="text-center py-24">
            <p className="text-muted text-lg">No transport options available yet.</p>
            <p className="text-muted-dark text-sm mt-2">Check back soon.</p>
          </div>
        )}

        {/* Info strip — below the cards */}
        {!loading && !error && options.length > 0 && (
          <div className="mt-16 bg-surface border border-border rounded-2xl p-8 md:p-10">
            <h2
              className="text-2xl text-text mb-3"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              All transport is fully managed
            </h2>
            <p className="text-muted text-sm leading-relaxed max-w-2xl">
              Every vehicle comes with a professional, uniformed driver who is familiar with
              Singapore's hospital routes. We coordinate pick-up times around your appointments
              so you never have to worry about being late.
            </p>
          </div>
        )}

        <EnquiryCTA
          title="Let us handle the logistics"
          description="Submit an enquiry and we'll arrange all your transfers — airport arrivals, hospital runs, and day trips — around your schedule."
        />
      </div>

      <Footer />
    </div>
  );
}
