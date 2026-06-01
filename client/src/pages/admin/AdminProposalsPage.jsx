import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../api/axios';

const STATUS_COLOURS = {
  drafting:          'bg-surface-alt text-muted',
  sent:              'bg-blue-500/15 text-blue-400',
  awaiting_payment:  'bg-yellow-500/15 text-yellow-500',
  confirmed:         'bg-green-500/15 text-green-400',
};

const STATUS_LABELS = {
  drafting:          'Drafting',
  sent:              'Sent to client',
  awaiting_payment:  'Awaiting payment',
  confirmed:         'Confirmed',
};

export default function AdminProposalsPage() {
  const navigate = useNavigate();
  const [reload, setReload] = useState(0);
  const { data, loading } = useFetch(`/api/admin/proposals?_=${reload}`);
  const proposals = data?.proposals || [];

  const [confirmDelete, setConfirmDelete] = useState(null); // proposal id

  const handleDelete = async (id) => {
    await api.delete(`/api/admin/proposals/${id}`);
    setConfirmDelete(null);
    setReload(r => r + 1);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>Proposals</h1>
        <p className="text-sm text-muted mt-1">Trip plans built for clients before converting to a booking.</p>
      </div>

      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && proposals.length === 0 && (
        <div className="text-center py-24">
          <FileText size={32} className="text-muted mx-auto mb-4" />
          <p className="text-muted">No proposals yet.</p>
          <p className="text-sm text-muted-dark mt-1">Open an enquiry and click "Build Proposal" to get started.</p>
        </div>
      )}

      {!loading && proposals.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                <th className="text-left px-5 py-3">Client</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Trip details</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Total</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {proposals.map((p, i) => (
                <tr
                  key={p.id}
                  className={`${i > 0 ? 'border-t border-border' : ''} hover:bg-surface-alt transition-colors`}
                >
                  <td className="px-5 py-3 cursor-pointer" onClick={() => navigate(`/admin/proposals/${p.id}`)}>
                    <p className="font-medium text-text">{p.full_name}</p>
                    <p className="text-xs text-muted">{p.email}</p>
                  </td>
                  <td className="px-5 py-3 text-muted hidden md:table-cell text-xs cursor-pointer" onClick={() => navigate(`/admin/proposals/${p.id}`)}>
                    <p>{p.group_size} · {p.duration_days} · {p.budget_range}</p>
                    {p.travel_dates && <p className="text-muted-dark mt-0.5">{p.travel_dates}</p>}
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell text-sm cursor-pointer" onClick={() => navigate(`/admin/proposals/${p.id}`)}>
                    {p.total_price != null
                      ? <span className="font-medium text-text">SGD {Number(p.total_price).toLocaleString()}</span>
                      : <span className="text-muted text-xs">Not set</span>}
                  </td>
                  <td className="px-5 py-3 cursor-pointer" onClick={() => navigate(`/admin/proposals/${p.id}`)}>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOURS[p.status] || 'bg-surface-alt text-muted'}`}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {confirmDelete === p.id ? (
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-xs text-muted">Delete?</span>
                        <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">Yes, delete</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-xs text-muted hover:text-text transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-4">
                        <button onClick={() => navigate(`/admin/proposals/${p.id}`)} className="text-xs text-accent hover:underline">Open →</button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(p.id); }} className="text-xs text-muted hover:text-red-400 transition-colors">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
