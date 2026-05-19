import { Link } from 'react-router-dom';
import { ClipboardList, PackageCheck, PlusCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';

const STATUS_COLOURS = {
  pending:   'bg-yellow-500/15 text-yellow-500',
  reviewed:  'bg-blue-500/15 text-blue-400',
  converted: 'bg-green-500/15 text-green-400',
  closed:    'bg-surface-alt text-muted',
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOURS[status] || 'bg-surface-alt text-muted'}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: eData } = useFetch('/api/enquiries/me');
  const { data: bData } = useFetch('/api/bookings/me');

  const enquiries = eData?.enquiries || [];
  const bookings  = bData?.bookings  || [];

  const pending   = enquiries.filter(e => e.status === 'pending').length;
  const reviewed  = enquiries.filter(e => e.status === 'reviewed').length;
  const activeBookings = bookings.filter(b => ['confirmed','in_progress'].includes(b.status)).length;

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-24">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted mb-2">Dashboard</p>
            <h1 className="text-3xl md:text-4xl text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
            </h1>
          </div>
          <Link
            to="/enquiries/new"
            className="inline-flex items-center gap-2 bg-accent text-[#080808] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-accent-hover transition-colors shrink-0"
          >
            <PlusCircle size={16} /> New enquiry
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Pending enquiries</p>
            <p className="text-3xl font-semibold text-text">{pending}</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Under review</p>
            <p className="text-3xl font-semibold text-text">{reviewed}</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Active bookings</p>
            <p className="text-3xl font-semibold text-text">{activeBookings}</p>
          </div>
        </div>

        {/* Recent enquiries */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text">Recent Enquiries</h2>
            <Link to="/enquiries" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {enquiries.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-10 text-center">
              <ClipboardList size={32} className="text-muted mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-muted text-sm">No enquiries yet.</p>
              <Link to="/enquiries/new" className="text-accent text-sm hover:underline mt-2 inline-block">
                Submit your first enquiry →
              </Link>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              {enquiries.slice(0, 5).map((e, i) => (
                <Link
                  key={e.id}
                  to={`/enquiries/${e.id}`}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-surface-alt transition-colors ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <div>
                    <p className="text-sm font-medium text-text">{e.group_size} · {e.duration_days}</p>
                    <p className="text-xs text-muted mt-0.5">{new Date(e.submitted_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text">My Bookings</h2>
            <Link to="/bookings" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-10 text-center">
              <PackageCheck size={32} className="text-muted mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-muted text-sm">No bookings yet. Bookings are created by our team once your enquiry is confirmed.</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              {bookings.slice(0, 5).map((b, i) => (
                <Link
                  key={b.id}
                  to={`/bookings/${b.id}`}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-surface-alt transition-colors ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <div>
                    <p className="text-sm font-medium text-text">
                      {b.total_price ? `SGD ${Number(b.total_price).toLocaleString()}` : 'Price TBC'}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{new Date(b.confirmed_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    b.status === 'confirmed'   ? 'bg-green-500/15 text-green-400' :
                    b.status === 'in_progress' ? 'bg-blue-500/15 text-blue-400' :
                    b.status === 'completed'   ? 'bg-accent/15 text-accent' :
                    'bg-surface-alt text-muted'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
