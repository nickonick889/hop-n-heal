import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../../api/axios';
import { useFetch } from '../../hooks/useFetch';

const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const TYPES = ['Hotel', 'Serviced Apartment', 'Resort'];

const EMPTY = {
  name: '', slug: '', type: 'Hotel', location: '', description: '',
  image_url: '', price_from: '', sort_order: 0, is_published: false,
};

export default function AdminStayPage() {
  const [reload, setReload] = useState(0);
  const { data, loading } = useFetch(`/api/admin/stay?_=${reload}`);
  const stays = data?.accommodations || [];

  const [modal, setModal]   = useState(null);
  const [form,  setForm]    = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const openNew = () => { setForm(EMPTY); setErr(''); setModal('new'); };
  const openEdit = (s) => {
    setForm({
      name: s.name, slug: s.slug, type: s.type || 'Hotel',
      location: s.location || '', description: s.description || '',
      image_url: s.image_url || '', price_from: s.price_from ?? '',
      sort_order: s.sort_order ?? 0, is_published: s.is_published,
    });
    setErr(''); setModal(s);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && modal === 'new' ? { slug: toSlug(value) } : {}),
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) { setErr('Name and slug are required.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = { ...form, price_from: form.price_from || null, sort_order: Number(form.sort_order) || 0 };
      if (modal === 'new') {
        await api.post('/api/admin/stay', payload);
      } else {
        await api.put(`/api/admin/stay/${modal.id}`, payload);
      }
      setModal(null); setReload(r => r + 1);
    } catch (e) {
      setErr(e.response?.data?.error || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this accommodation?')) return;
    await api.delete(`/api/admin/stay/${id}`);
    setReload(r => r + 1);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>Stay</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-accent text-[#080808] font-semibold px-4 py-2 rounded-full text-sm hover:bg-accent-hover transition-colors">
          <Plus size={15} /> Add accommodation
        </button>
      </div>

      {loading && <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />)}</div>}

      {!loading && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Type</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Price from</th>
                <th className="text-left px-5 py-3">Published</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {stays.map((s, i) => (
                <tr key={s.id} className={`${i > 0 ? 'border-t border-border' : ''} hover:bg-surface-alt transition-colors`}>
                  <td className="px-5 py-3 font-medium text-text">{s.name}</td>
                  <td className="px-5 py-3 text-muted hidden md:table-cell">{s.type || '—'}</td>
                  <td className="px-5 py-3 text-muted hidden sm:table-cell">
                    {s.price_from != null ? `SGD ${Number(s.price_from).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.is_published ? 'bg-green-500/15 text-green-400' : 'bg-surface-alt text-muted'}`}>
                      {s.is_published ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-muted hover:text-accent transition-colors mr-1"><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-muted hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
              {stays.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No accommodations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-text">{modal === 'new' ? 'Add Accommodation' : 'Edit Accommodation'}</h2>
              <button onClick={() => setModal(null)} className="text-muted hover:text-text"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: 'Name',       name: 'name',       type: 'text' },
                { label: 'Slug',       name: 'slug',       type: 'text' },
                { label: 'Location',   name: 'location',   type: 'text' },
                { label: 'Price from (SGD)', name: 'price_from', type: 'number' },
                { label: 'Sort order', name: 'sort_order', type: 'number' },
                { label: 'Image URL',  name: 'image_url',  type: 'text' },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label className="block text-xs text-muted mb-1">{label}</label>
                  <input
                    name={name} type={type} value={form[name]} onChange={handleChange}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-muted mb-1">Type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
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
