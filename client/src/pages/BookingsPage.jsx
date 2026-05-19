import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, PackageCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFetch } from '../hooks/useFetch';

const STATUS_COLOURS = {
  confirmed:   'bg-green-500/15 text-green-400',
  in_progress: 'bg-blue-500/15 text-blue-400',
  completed:   'bg-accent/15 text-accent',
  cancelled:   'bg-red-500/15 text-red-400',
};

export default function BookingsPage() {
  const { data, loading, error } = useFetch('/api/bookings/me');
  const bookings = data?.bookings || [];

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition-colors mb-8">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-2">Account</p>
          <h1 className="text-3xl md:text-4xl text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>My Bookings</h1>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {error && <p className="text-muted text-center py-16">Could not load bookings.</p>}

        {!loading && !error && bookings.length === 0 && (
          <div className="bg-surface border border-border rounded-2xl p-16 text-center">
            <PackageCheck size={36} className="text-muted mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-muted mb-2">No bookings yet.</p>
            <p className="text-xs text-muted-dark">Bookings are created by our team once your enquiry is confirmed.</p>
            <Link to="/enquiries/new" className="text-accent hover:underline text-sm mt-4 inline-block">
              Submit an enquiry →
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {bookings.map((b, i) => (
              <Link
                key={b.id}
                to={`/bookings/${b.id}`}
                className={`group flex items-center justify-between px-6 py-5 hover:bg-surface-alt transition-colors ${i > 0 ? 'border-t border-border' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text mb-1">
                    {b.total_price
                      ? `${b.currency || 'SGD'} ${Number(b.total_price).toLocaleString()}`
                      : 'Price TBC'}
                  </p>
                  <p className="text-xs text-muted-dark">
                    Confirmed {new Date(b.confirmed_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOURS[b.status] || 'bg-surface-alt text-muted'}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  <ArrowRight size={14} className="text-muted group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
