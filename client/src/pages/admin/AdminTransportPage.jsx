import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../../api/axios';
import { useFetch } from '../../hooks/useFetch';

const EMPTY = {
  vehicle_type: '', description: '', image_url: '',
  capacity: '', price_from: '', sort_order: 0, is_published: false,
};

export default function AdminTransportPage() {
  const [reload, setReload] = useState(0);
  const { data, loading } = useFetch(`/api/admin/transport?_=${reload}`);
  const vehicles = data?.transport || [];

  const [modal, setModal]   = useState(null);
  const [form,  setForm]    = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const openNew = () => { setForm(EMPTY); setErr(''); setModal('new'); };
  const openEdit = (v) => {
    setForm({
      vehicle_type: v.vehicle_type, description: v.description || '',
      image_url: v.image_url || '', capacity: v.capacity ?? '',
      price_from: v.price_from ?? '', sort_order: v.sort_order ?? 0,
      is_published: v.is_published,
    });
    setErr(''); setModal(v);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.vehicle_type) { setErr('Vehicle type is required.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = {
        ...form,
        capacity: form.capacity !== '' ? Number(form.capacity) : null,
        price_from: form.price_from || null,
        sort_order: Number(form.sort_order) || 0,
      };
      if (modal === 'new') {
        await api.post('/api/admin/transport', payload);
      } else {
        await api.put(`/api/admin/transport/${modal.id}`, payload);
      }
      setModal(null); setReload(r => r + 1);
    } catch (e) {
      setErr(e.response?.data?.error || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    await api.delete(`/api/admin/transport/${id}`);
    setReload(r => r + 1);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>Transport</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-accent text-[#080808] font-semibold px-4 py-2 rounded-full text-sm hover:bg-accent-hover transition-colors">
          <Plus size={15} /> Add vehicle
        </button>
      </div>

      {loading && <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />)}</div>}

      {!loading && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                <th className="text-left px-5 py-3">Vehicle</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Capacity</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Price from</th>
                <th className="text-left px-5 py-3">Published</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v, i) => (
                <tr key={v.id} className={`${i > 0 ? 'border-t border-border' : ''} hover:bg-surface-alt transition-colors`}>
                  <td className="px-5 py-3 font-medium text-text">{v.vehicle_type}</td>
                  <td className="px-5 py-3 text-muted hidden md:table-cell">{v.capacity != null ? `${v.capacity} pax` : '—'}</td>
                  <td className="px-5 py-3 text-muted hidden sm:table-cell">
                    {v.price_from != null ? `SGD ${Number(v.price_from).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.is_published ? 'bg-green-500/15 text-green-400' : 'bg-surface-alt text-muted'}`}>
                      {v.is_published ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(v)} className="p-1.5 text-muted hover:text-accent transition-colors mr-1"><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 text-muted hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No vehicles yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-text">{modal === 'new' ? 'Add Vehicle' : 'Edit Vehicle'}</h2>
              <button onClick={() => setModal(null)} className="text-muted hover:text-text"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: 'Vehicle type',      name: 'vehicle_type', type: 'text'   },
                { label: 'Capacity (pax)',     name: 'capacity',     type: 'number' },
                { label: 'Price from (SGD)',   name: 'price_from',   type: 'number' },
                { label: 'Sort order',         name: 'sort_order',   type: 'number' },
                { label: 'Image URL',          name: 'image_url',    type: 'text'   },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label className="block text-xs text-muted mb-1">{label}</label>
                  <input name={name} type={type} value={form[name]} onChange={handleChange}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-muted mb-1">Description</label>
                <textarea name="description" rows={4} value={form.description} onChange={handleChange}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} className="accent-accent" />
                <span className="text-sm text-text">Published</span>
              </label>
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
