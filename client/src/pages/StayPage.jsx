import { useState } from 'react';
import { MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnquiryCTA from '../components/EnquiryCTA';
import { useFetch } from '../hooks/useFetch';

// ─── Sub-components ───────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="aspect-[4/3] bg-border" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-border rounded w-1/3" />
        <div className="h-5 bg-border rounded w-3/4" />
        <div className="h-4 bg-border rounded w-full" />
        <div className="h-4 bg-border rounded w-4/5" />
      </div>
    </div>
  );
}

function StayCard({ stay }) {
  return (
    <div className="group border border-border rounded-2xl overflow-hidden bg-surface hover:border-accent/40 transition-all cursor-pointer">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-surface-alt to-border">
        {stay.image_url && (
          <img
            src={stay.image_url}
            alt={stay.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {/* Type badge — top left */}
        <span className="absolute top-3 left-3 bg-bg/80 backdrop-blur-sm text-text text-xs font-medium px-2.5 py-1 rounded-full">
          {stay.type}
        </span>
        {/* Price badge — bottom right */}
        {stay.price_from != null && (
          <div className="absolute bottom-3 right-3 bg-accent text-[#080808] text-xs font-semibold px-3 py-1.5 rounded-full">
            from SGD {Number(stay.price_from).toLocaleString()} / night
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="flex items-center gap-1 text-muted text-xs mb-2">
          <MapPin size={11} className="shrink-0" /> {stay.location}
        </p>
        <h3 className="font-semibold text-text text-base mb-2 group-hover:text-accent transition-colors">
          {stay.name}
        </h3>
        <p className="text-muted text-sm leading-relaxed line-clamp-2">
          {stay.description}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function StayPage() {
  const { data, loading, error } = useFetch('/api/stay');
  const [filter, setFilter] = useState('All');

  const accommodations = data?.accommodations || [];
  const types = ['All', ...new Set(accommodations.map(a => a.type).filter(Boolean))];
  const filtered = filter === 'All' ? accommodations : accommodations.filter(a => a.type === filter);

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">

        {/* Page header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-3">Where you'll stay</p>
          <h1
            className="text-4xl md:text-5xl text-text mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Accommodation
          </h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            Carefully selected hotels and serviced apartments — all within easy reach of
            Singapore's leading hospitals and specialist clinics.
          </p>
        </div>

        {/* Filter pills */}
        {!loading && types.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-10">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === t
                    ? 'bg-accent text-[#080808]'
                    : 'bg-surface border border-border text-muted hover:border-accent/60 hover:text-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-24">
            <p className="text-muted text-lg">Could not load accommodations. Please try again later.</p>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(a => <StayCard key={a.id} stay={a} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-muted text-lg">
              No accommodations found{filter !== 'All' ? ` of type "${filter}"` : ''}.
            </p>
            {filter !== 'All' && (
              <button onClick={() => setFilter('All')} className="mt-4 text-accent text-sm hover:underline">
                Clear filter
              </button>
            )}
          </div>
        )}

        <EnquiryCTA
          title="Want us to find the perfect place for you?"
          description="Share your travel dates and preferences and we'll match you with the best accommodation near your medical appointments."
        />
      </div>

      <Footer />
    </div>
  );
}
