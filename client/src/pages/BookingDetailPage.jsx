import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFetch } from '../hooks/useFetch';

const STATUS_COLOURS = {
  confirmed:   'bg-green-500/15 text-green-400',
  in_progress: 'bg-blue-500/15 text-blue-400',
  completed:   'bg-accent/15 text-accent',
  cancelled:   'bg-red-500/15 text-red-400',
};

const ITEM_TYPE_LABELS = {
  medical:       'Medical Service',
  accommodation: 'Accommodation',
  transport:     'Transport',
  activity:      'Activity',
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/api/bookings/${id}`);
  const booking = data?.booking;
  const items   = booking?.items || [];

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        <Link to="/bookings" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text mb-8">
          <ArrowLeft size={16} /> Back to bookings
        </Link>

        {loading && <div className="h-64 bg-surface border border-border rounded-2xl animate-pulse" />}
        {error   && <p className="text-muted text-center py-16">Booking not found.</p>}

        {!loading && booking && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
              <div>
                <p className="text-xs text-muted mb-2">
                  Confirmed {new Date(booking.confirmed_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h1 className="text-3xl text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  Booking Details
                </h1>
              </div>
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_COLOURS[booking.status] || 'bg-surface-alt text-muted'}`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>

            {/* Summary card */}
            <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-text mb-4">Summary</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted mb-1">Total price</dt>
                  <dd className="text-sm font-medium text-text">
                    {booking.total_price
                      ? `${booking.currency || 'SGD'} ${Number(booking.total_price).toLocaleString()}`
                      : 'To be confirmed'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted mb-1">Status</dt>
                  <dd className="text-sm font-medium text-text capitalize">{booking.status.replace('_', ' ')}</dd>
                </div>
                {booking.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted mb-1">Notes</dt>
                    <dd className="text-sm text-text">{booking.notes}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Line items */}
            {items.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-semibold text-text mb-4">Included Services</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
                      <div>
                        <p className="text-xs text-muted mb-0.5">{ITEM_TYPE_LABELS[item.item_type] || item.item_type}</p>
                        {item.custom_notes && (
                          <p className="text-sm text-text">{item.custom_notes}</p>
                        )}
                        {item.quantity && (
                          <p className="text-xs text-muted-dark mt-0.5">Qty: {item.quantity}</p>
                        )}
                      </div>
                      {item.unit_price != null && (
                        <p className="text-sm font-medium text-text shrink-0">
                          SGD {Number(item.unit_price).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status message */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <p className="text-sm text-muted">
                {booking.status === 'confirmed'
                  ? 'Your booking is confirmed. Our team will reach out with further details.'
                  : booking.status === 'in_progress'
                  ? 'Your trip is currently in progress. Contact us if you need any assistance.'
                  : booking.status === 'completed'
                  ? 'Your trip is complete. We hope you had a wonderful experience.'
                  : 'This booking has been cancelled. Please contact us if you have any questions.'}
              </p>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
