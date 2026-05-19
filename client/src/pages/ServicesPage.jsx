import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
        <div className="h-3 bg-border rounded w-1/4" />
        <div className="h-5 bg-border rounded w-3/4" />
        <div className="h-4 bg-border rounded w-full" />
        <div className="h-4 bg-border rounded w-4/5" />
      </div>
    </div>
  );
}

function ServiceCard({ service }) {
  return (
    <Link
      to={`/services/${service.slug}`}
      className="group border border-border rounded-2xl overflow-hidden bg-surface hover:border-accent/40 transition-all"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10] bg-gradient-to-br from-surface-alt to-border">
        {service.image_url && (
          <img
            src={service.image_url}
            alt={service.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {/* Specialty badge */}
        <span className="absolute top-3 left-3 bg-bg/80 backdrop-blur-sm text-text text-xs font-medium px-2.5 py-1 rounded-full">
          {service.specialty}
        </span>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-semibold text-text text-base mb-2 group-hover:text-accent transition-colors">
          {service.title}
        </h3>
        <p className="text-muted text-sm leading-relaxed line-clamp-2">
          {service.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          {service.price_from != null ? (
            <span className="text-accent text-sm font-semibold">
              from SGD {Number(service.price_from).toLocaleString()}
            </span>
          ) : (
            <span className="text-muted text-xs">Price on request</span>
          )}
          <span className="flex items-center gap-1 text-accent text-sm font-medium">
            Details <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function ServicesPage() {
  const { data, loading, error } = useFetch('/api/services');
  const [filter, setFilter] = useState('All');

  const services = data?.services || [];
  // Build specialty filter list from the live data
  const specialties = ['All', ...new Set(services.map(s => s.specialty).filter(Boolean))];
  const filtered = filter === 'All' ? services : services.filter(s => s.specialty === filter);

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">

        {/* Page header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-3">Medical</p>
          <h1
            className="text-4xl md:text-5xl text-text mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Medical Services
          </h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            Access world-class medical procedures and health screenings at Singapore's
            leading hospitals — all arranged and managed for you.
          </p>
        </div>

        {/* Filter pills — only show once data is loaded */}
        {!loading && specialties.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-10">
            {specialties.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === s
                    ? 'bg-accent text-[#080808]'
                    : 'bg-surface border border-border text-muted hover:border-accent/60 hover:text-text'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-24">
            <p className="text-muted text-lg">Could not load services. Please try again later.</p>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-muted text-lg">
              No services found{filter !== 'All' ? ` under "${filter}"` : ''}.
            </p>
            {filter !== 'All' && (
              <button onClick={() => setFilter('All')} className="mt-4 text-accent text-sm hover:underline">
                Clear filter
              </button>
            )}
          </div>
        )}

        <EnquiryCTA
          title="Need help choosing the right service?"
          description="Tell us about your health goals and we'll recommend the right specialists, arrange your appointments, and handle everything else."
        />
      </div>

      <Footer />
    </div>
  );
}
