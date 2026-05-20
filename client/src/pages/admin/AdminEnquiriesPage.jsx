import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../../api/axios';
import { useFetch } from '../../hooks/useFetch';

const STATUSES = ['pending', 'reviewed', 'converted', 'closed'];

const STATUS_COLOURS = {
  pending:   'bg-yellow-500/15 text-yellow-500',
  reviewed:  'bg-blue-500/15 text-blue-400',
  converted: 'bg-green-500/15 text-green-400',
  closed:    'bg-surface-alt text-muted',
};

export default function AdminEnquiriesPage() {
  const [reload, setReload] = useState(0);
  const { data, loading } = useFetch(`/api/admin/enquiries?_=${reload}`);
  const enquiries = data?.enquiries || [];

  const [modal,  setModal]  = useState(null); // enquiry object or null
  const [form,   setForm]   = useState({ status: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const [filter,       setFilter]       = useState('all');
  const [buildingFor,  setBuildingFor]  = useState(null); // enquiry id being processed
  const navigate = useNavigate();

  const openEdit = (e) => {
    setForm({ status: e.status, notes: e.notes || '' });
    setErr(''); setModal(e);
  };

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      await api.put(`/api/admin/enquiries/${modal.id}`, form);
      setModal(null); setReload(r => r + 1);
    } catch (e) {
      setErr(e.response?.data?.error || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const buildProposal = async (enquiryId) => {
    setBuildingFor(enquiryId);
    try {
      const { data } = await api.post('/api/admin/proposals', { enquiry_id: enquiryId });
      navigate(`/admin/proposals/${data.proposal.id}`);
    } catch {
      setBuildingFor(null);
    }
  };

  const visible = filter === 'all' ? enquiries : enquiries.filter(e => e.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>Enquiries</h1>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                filter === s ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted hover:border-accent/50'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />)}</div>}

      {!loading && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                <th className="text-left px-5 py-3">Client</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Details</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Submitted</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((e, i) => (
                <tr key={e.id} className={`${i > 0 ? 'border-t border-border' : ''} hover:bg-surface-alt transition-colors`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-text">{e.full_name}</p>
                    <p className="text-xs text-muted">{e.email}</p>
                  </td>
                  <td className="px-5 py-3 text-muted hidden lg:table-cell text-xs">
                    <p>{e.group_size} · {e.duration_days} · {e.budget_range}</p>
                    {e.travel_dates && <p className="text-muted-dark mt-0.5">{e.travel_dates}</p>}
                  </td>
                  <td className="px-5 py-3 text-muted hidden md:table-cell text-xs">
                    {new Date(e.submitted_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOURS[e.status] || 'bg-surface-alt text-muted'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {e.proposal_id ? (
                        <button onClick={() => navigate(`/admin/proposals/${e.proposal_id}`)} className="text-xs text-accent hover:underline">
                          View Proposal
                        </button>
                      ) : (
                        <button
                          onClick={() => buildProposal(e.id)}
                          disabled={buildingFor === e.id}
                          className="text-xs text-muted hover:text-accent transition-colors disabled:opacity-50"
                        >
                          {buildingFor === e.id ? 'Creating…' : 'Build Proposal'}
                        </button>
                      )}
                      <button onClick={() => openEdit(e)} className="text-xs text-accent hover:underline">Update</button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No enquiries found.</td></tr>
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
                <h2 className="font-semibold text-text">Update Enquiry</h2>
                <p className="text-xs text-muted mt-0.5">{modal.full_name} — {modal.group_size}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-muted hover:text-text"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Read-only food info */}
              {(modal.food_budget || modal.food_restrictions?.length > 0 || modal.food_cuisines?.length > 0) && (
                <div className="bg-bg border border-border rounded-xl px-4 py-3 space-y-2">
                  {modal.food_budget && (
                    <p className="text-xs text-muted">Food budget: <span className="text-text font-medium">{modal.food_budget}</span></p>
                  )}
                  {modal.food_restrictions?.length > 0 && (
                    <p className="text-xs text-muted">Dietary restrictions: <span className="text-text font-medium">{modal.food_restrictions.join(', ')}</span></p>
                  )}
                  {modal.food_cuisines?.length > 0 && (
                    <p className="text-xs text-muted">Cuisine preferences: <span className="text-text font-medium">{modal.food_cuisines.join(', ')}</span></p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs text-muted mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors">
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Internal notes</label>
                <textarea rows={4} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes visible only to admin team…"
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
