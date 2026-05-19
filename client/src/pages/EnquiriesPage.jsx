import { Link } from 'react-router-dom';
import { PlusCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFetch } from '../hooks/useFetch';

const STATUS_COLOURS = {
  pending:   'bg-yellow-500/15 text-yellow-500',
  reviewed:  'bg-blue-500/15 text-blue-400',
  converted: 'bg-green-500/15 text-green-400',
  closed:    'bg-surface-alt text-muted',
};

export default function EnquiriesPage() {
  const { data, loading, error } = useFetch('/api/enquiries/me');
  const enquiries = data?.enquiries || [];

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition-colors mb-8">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted mb-2">Account</p>
            <h1 className="text-3xl md:text-4xl text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>My Enquiries</h1>
          </div>
          <Link
            to="/enquiries/new"
            className="inline-flex items-center gap-2 bg-accent text-[#080808] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-accent-hover transition-colors shrink-0"
          >
            <PlusCircle size={16} /> New enquiry
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {error && <p className="text-muted text-center py-16">Could not load enquiries.</p>}

        {!loading && !error && enquiries.length === 0 && (
          <div className="bg-surface border border-border rounded-2xl p-16 text-center">
            <p className="text-muted mb-4">You haven't submitted any enquiries yet.</p>
            <Link to="/enquiries/new" className="text-accent hover:underline text-sm">
              Submit your first enquiry →
            </Link>
          </div>
        )}

        {!loading && !error && enquiries.length > 0 && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {enquiries.map((e, i) => (
              <Link
                key={e.id}
                to={`/enquiries/${e.id}`}
                className={`group flex items-center justify-between px-6 py-5 hover:bg-surface-alt transition-colors ${i > 0 ? 'border-t border-border' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="text-sm font-medium text-text">{e.group_size}</p>
                    <span className="text-muted-dark">·</span>
                    <p className="text-sm text-muted">{e.duration_days}</p>
                    <span className="text-muted-dark">·</span>
                    <p className="text-sm text-muted">{e.budget_range}</p>
                  </div>
                  <p className="text-xs text-muted-dark">
                    Submitted {new Date(e.submitted_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOURS[e.status] || 'bg-surface-alt text-muted'}`}>
                    {e.status}
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
