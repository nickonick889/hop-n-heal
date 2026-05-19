import { useFetch } from '../../hooks/useFetch';

export default function AdminDashboardPage() {
  const { data: eData } = useFetch('/api/admin/enquiries');
  const { data: bData } = useFetch('/api/admin/bookings');
  const { data: sData } = useFetch('/api/admin/services');

  const enquiries = eData?.enquiries || [];
  const bookings  = bData?.bookings  || [];
  const services  = sData?.services  || [];

  const pending   = enquiries.filter(e => e.status === 'pending').length;
  const reviewed  = enquiries.filter(e => e.status === 'reviewed').length;
  const activeB   = bookings.filter(b => ['confirmed','in_progress'].includes(b.status)).length;

  const STATUS_COLOURS = {
    pending:   'bg-yellow-500/15 text-yellow-500',
    reviewed:  'bg-blue-500/15 text-blue-400',
    converted: 'bg-green-500/15 text-green-400',
    closed:    'bg-surface-alt text-muted',
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-text mb-8" style={{ fontFamily: "'DM Serif Display', serif" }}>
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
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
          <p className="text-3xl font-semibold text-text">{activeB}</p>
        </div>
      </div>

      {/* Recent enquiries */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-text mb-4">Recent Enquiries</h2>
        {enquiries.length === 0 ? (
          <p className="text-muted text-sm">No enquiries yet.</p>
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {enquiries.slice(0, 8).map((e, i) => (
              <div
                key={e.id}
                className={`flex items-center justify-between px-6 py-4 ${i > 0 ? 'border-t border-border' : ''}`}
              >
                <div>
                  <p className="text-sm font-medium text-text">{e.full_name}</p>
                  <p className="text-xs text-muted mt-0.5">{e.group_size} · {e.duration_days} · {e.budget_range}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-muted-dark hidden sm:block">
                    {new Date(e.submitted_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                  </p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOURS[e.status] || 'bg-surface-alt text-muted'}`}>
                    {e.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published services count */}
      <div className="bg-surface border border-border rounded-2xl p-6 inline-block">
        <p className="text-xs text-muted uppercase tracking-wider mb-1">Published services</p>
        <p className="text-3xl font-semibold text-text">
          {services.filter(s => s.is_published).length}
          <span className="text-sm text-muted font-normal ml-1">/ {services.length}</span>
        </p>
      </div>
    </div>
  );
}
