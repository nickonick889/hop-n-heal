import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api/axios';
import { useFetch } from '../../hooks/useFetch';

const STATUSES = ['confirmed', 'in_progress', 'completed', 'cancelled'];

const STATUS_COLOURS = {
  confirmed:   'bg-green-500/15 text-green-400',
  in_progress: 'bg-blue-500/15 text-blue-400',
  completed:   'bg-accent/15 text-accent',
  cancelled:   'bg-red-500/15 text-red-400',
};

export default function AdminBookingsPage() {
  const [reload, setReload] = useState(0);
  const { data, loading } = useFetch(`/api/admin/bookings?_=${reload}`);
  const bookings = data?.bookings || [];

  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({ status: '', notes: '', total_price: '' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const [filter, setFilter] = useState('all');

  const openEdit = (b) => {
    setForm({ status: b.status, notes: b.notes || '', total_price: b.total_price ?? '' });
    setErr(''); setModal(b);
  };

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      await api.put(`/api/admin/bookings/${modal.id}`, {
        ...form,
        total_price: form.total_price !== '' ? Number(form.total_price) : null,
      });
      setModal(null); setReload(r => r + 1);
    } catch (e) {
      setErr(e.response?.data?.error || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const visible = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>Bookings</h1>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === s ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted hover:border-accent/50'
              }`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />)}</div>}

      {!loading && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                <th className="text-left px-5 py-3">Client</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Total</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Confirmed</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((b, i) => (
                <tr key={b.id} className={`${i > 0 ? 'border-t border-border' : ''} hover:bg-surface-alt transition-colors`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-text">{b.full_name}</p>
                    <p className="text-xs text-muted">{b.email}</p>
                  </td>
                  <td className="px-5 py-3 text-muted hidden sm:table-cell">
                    {b.total_price != null
                      ? `${b.currency || 'SGD'} ${Number(b.total_price).toLocaleString()}`
                      : 'TBC'}
                  </td>
                  <td className="px-5 py-3 text-muted hidden md:table-cell text-xs">
                    {new Date(b.confirmed_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOURS[b.status] || 'bg-surface-alt text-muted'}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(b)} className="text-xs text-accent hover:underline">Update</button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="font-semibold text-text">Update Booking</h2>
                <p className="text-xs text-muted mt-0.5">{modal.full_name}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-muted hover:text-text"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Total price (SGD)</label>
                <input type="number" value={form.total_price} onChange={e => setForm(f => ({ ...f, total_price: e.target.value }))}
                  placeholder="e.g. 8500"
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Internal notes…"
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors resize-none" />
              </div>
              {err && <p className="text-xs text-red-400">{err}</p>}
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="text-sm text-muted border border-border px-4 py-2 rounded-full hover:border-accent/50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="text-sm bg-accent text-[#080808] font-semibold px-5 py-2 rounded-full hover:bg-accent-hover disabled:opacity-60 transition-colors">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
