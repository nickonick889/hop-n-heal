import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFetch } from '../hooks/useFetch';
import api from '../api/axios';

const STATUS_COLOURS = {
  pending:   'bg-yellow-500/15 text-yellow-500',
  reviewed:  'bg-blue-500/15 text-blue-400',
  converted: 'bg-green-500/15 text-green-400',
  closed:    'bg-surface-alt text-muted',
};

const GROUP_SIZES  = ['Just me', '2–3 people', '4+ people'];
const DURATIONS    = ['3–5 days', '1 week', '2 weeks+'];
const BUDGETS      = ['Under $5k', '$5k–$10k', '$10k+'];
const FOOD_BUDGETS = ['Budget ($5–$15/meal)', 'Mid-range ($15–$40/meal)', 'Fine dining ($40+/meal)'];

// Human-readable label for interest category
const CATEGORY_LABELS = {
  medical:          'Medical',
  accommodation:    'Accommodation',
  transport:        'Transport',
  activity:         'Activities',
  food_restriction: 'Dietary restrictions',
};

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/api/enquiries/${id}`);
  const enquiry  = data?.enquiry;
  const interests = enquiry?.interests || [];

  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState('');

  const openEdit = () => {
    setForm({
      group_size:    enquiry.group_size,
      duration_days: enquiry.duration_days,
      budget_range:  enquiry.budget_range,
      travel_dates:  enquiry.travel_dates || '',
      food_budget:   enquiry.food_budget || '',
    });
    setSaveErr('');
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveErr('');
    try {
      await api.put(`/api/enquiries/${id}`, form);
      window.location.reload();
    } catch (err) {
      setSaveErr(err.response?.data?.error || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const RadioRow = ({ options, field }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(o => (
        <button key={o} type="button" onClick={() => setForm(f => ({ ...f, [field]: o }))}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            form[field] === o ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted hover:border-accent/50'
          }`}
        >{o}</button>
      ))}
    </div>
  );

  // Group interests by category (excludes food_restriction — shown separately below trip details)
  const grouped = interests.reduce((acc, i) => {
    (acc[i.category] = acc[i.category] || []).push(i.option_value);
    return acc;
  }, {});

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        <Link to="/enquiries" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text mb-8">
          <ArrowLeft size={16} /> Back to enquiries
        </Link>

        {loading && <div className="h-64 bg-surface border border-border rounded-2xl animate-pulse" />}
        {error   && <p className="text-muted text-center py-16">Enquiry not found.</p>}

        {!loading && enquiry && (
          <>
            <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
              <div>
                <p className="text-xs text-muted mb-2">
                  Submitted {new Date(enquiry.submitted_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h1 className="text-3xl text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  Enquiry Details
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_COLOURS[enquiry.status] || 'bg-surface-alt text-muted'}`}>
                  {enquiry.status}
                </span>
                {enquiry.status === 'pending' && !editing && (
                  <button onClick={openEdit} className="flex items-center gap-1.5 text-xs text-accent border border-accent/30 px-3 py-1.5 rounded-full hover:bg-accent/10 transition-colors">
                    <Edit2 size={12} /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Trip details */}
            <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-text mb-4">Trip Details</h2>
              {editing ? (
                <div className="space-y-4">
                  <div><p className="text-xs text-muted">Group size</p><RadioRow options={GROUP_SIZES} field="group_size" /></div>
                  <div><p className="text-xs text-muted">Duration</p><RadioRow options={DURATIONS} field="duration_days" /></div>
                  <div><p className="text-xs text-muted">Budget</p><RadioRow options={BUDGETS} field="budget_range" /></div>
                  <div>
                    <p className="text-xs text-muted mb-1.5">Travel dates</p>
                    <input
                      type="text"
                      value={form.travel_dates}
                      onChange={e => setForm(f => ({ ...f, travel_dates: e.target.value }))}
                      placeholder="e.g. Early June 2026, or Not yet confirmed"
                      className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div><p className="text-xs text-muted">Food budget</p><RadioRow options={FOOD_BUDGETS} field="food_budget" /></div>
                  {saveErr && <p className="text-xs text-red-400">{saveErr}</p>}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setEditing(false)} className="text-sm text-muted border border-border px-4 py-2 rounded-full hover:border-accent/50 transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="text-sm bg-accent text-[#080808] font-semibold px-5 py-2 rounded-full hover:bg-accent-hover disabled:opacity-60 transition-colors">
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ['Group size',    enquiry.group_size],
                    ['Duration',      enquiry.duration_days],
                    ['Budget',        enquiry.budget_range],
                    ['Travel dates',  enquiry.travel_dates],
                    ['Food budget',   enquiry.food_budget],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted mb-1">{label}</dt>
                      <dd className="text-sm font-medium text-text">{val || '—'}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Interests & food restrictions */}
            {interests.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-text mb-4">Selected Interests</h2>
                <div className="space-y-4">
                  {Object.entries(grouped).map(([cat, vals]) => (
                    <div key={cat}>
                      <p className="text-xs text-muted uppercase tracking-wider mb-2">
                        {CATEGORY_LABELS[cat] || cat}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {vals.map(v => (
                          <span key={v} className="text-xs bg-surface-alt border border-border text-text px-3 py-1.5 rounded-full">{v}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {enquiry.status !== 'pending' && (
              <div className="mt-6 bg-surface border border-border rounded-2xl p-6">
                <p className="text-sm text-muted">
                  {enquiry.status === 'reviewed'
                    ? 'Our team has reviewed your enquiry and will be in touch shortly.'
                    : enquiry.status === 'converted'
                    ? 'Your enquiry has been converted to a booking. Check your Bookings tab.'
                    : 'This enquiry has been closed.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
