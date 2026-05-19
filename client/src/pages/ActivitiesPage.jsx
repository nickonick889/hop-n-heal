import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFetch } from '../hooks/useFetch';

// ─── Sub-components ───────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="aspect-[4/3] bg-border" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-border rounded w-1/4" />
        <div className="h-5 bg-border rounded w-3/4" />
        <div className="h-4 bg-border rounded w-full" />
        <div className="h-4 bg-border rounded w-4/5" />
      </div>
    </div>
  );
}

// Maps category names to a colour so each pill looks distinct
const CATEGORY_COLOURS = {
  Cultural:  'bg-blue-500/15 text-blue-400',
  Wellness:  'bg-green-500/15 text-green-400',
  Adventure: 'bg-orange-500/15 text-orange-400',
};

function ActivityCard({ activity }) {
  const badgeClass = CATEGORY_COLOURS[activity.category] || 'bg-surface-alt text-muted';

  return (
    <div className="group border border-border rounded-2xl overflow-hidden bg-surface hover:border-accent/40 transition-all">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-surface-alt to-border">
        {activity.image_url && (
          <img
            src={activity.image_url}
            alt={activity.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {/* Price badge */}
        {activity.price_from != null && (
          <div className="absolute bottom-3 right-3 bg-accent text-[#080808] text-xs font-semibold px-3 py-1.5 rounded-full">
            from SGD {Number(activity.price_from).toLocaleString()} / person
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        {/* Category colour pill */}
        {activity.category && (
          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${badgeClass}`}>
            {activity.category}
          </span>
        )}
        <h3 className="font-semibold text-text text-base mb-2 group-hover:text-accent transition-colors">
          {activity.title}
        </h3>
        <p className="text-muted text-sm leading-relaxed line-clamp-2">
          {activity.description}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function ActivitiesPage() {
  const { data, loading, error } = useFetch('/api/activities');
  const [filter, setFilter] = useState('All');

  const activities = data?.activities || [];
  const categories = ['All', ...new Set(activities.map(a => a.category).filter(Boolean))];
  const filtered = filter === 'All' ? activities : activities.filter(a => a.category === filter);

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">

        {/* Page header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-3">Explore Singapore</p>
          <h1
            className="text-4xl md:text-5xl text-text mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Activities & Experiences
          </h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            Make the most of your time in Singapore with curated cultural, wellness, and
            adventure experiences — all arranged around your medical schedule.
          </p>
        </div>

        {/* Filter pills */}
        {!loading && categories.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-10">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === c
                    ? 'bg-accent text-[#080808]'
                    : 'bg-surface border border-border text-muted hover:border-accent/60 hover:text-text'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-24">
            <p className="text-muted text-lg">Could not load activities. Please try again later.</p>
          </div>
        )}

        {/* Cards — 4 col on xl so it matches the 8-item grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(a => <ActivityCard key={a.id} activity={a} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-muted text-lg">
              No activities found{filter !== 'All' ? ` in "${filter}"` : ''}.
            </p>
            {filter !== 'All' && (
              <button onClick={() => setFilter('All')} className="mt-4 text-accent text-sm hover:underline">
                Clear filter
              </button>
            )}
          </div>
        )}

        {/* CTA — link to enquiry */}
        {!loading && !error && filtered.length > 0 && (
          <div className="mt-16 text-center">
            <p className="text-muted mb-4">Want to include activities in your package?</p>
            <Link
              to="/enquiries/new"
              className="inline-flex items-center gap-2 bg-accent text-[#080808] font-semibold px-8 py-3 rounded-full text-sm hover:bg-accent-hover transition-colors"
            >
              Start an enquiry
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
