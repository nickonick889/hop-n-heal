import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../../api/axios';
import { useFetch } from '../../hooks/useFetch';

const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const CATEGORIES = ['Cultural', 'Wellness', 'Adventure'];

const EMPTY = {
  title: '', slug: '', category: 'Cultural', description: '',
  image_url: '', price_from: '', sort_order: 0, is_published: false,
};

export default function AdminActivitiesPage() {
  const [reload, setReload] = useState(0);
  const { data, loading } = useFetch(`/api/admin/activities?_=${reload}`);
  const activities = data?.activities || [];

  const [modal, setModal]   = useState(null);
  const [form,  setForm]    = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const openNew = () => { setForm(EMPTY); setErr(''); setModal('new'); };
  const openEdit = (a) => {
    setForm({
      title: a.title, slug: a.slug, category: a.category || 'Cultural',
      description: a.description || '', image_url: a.image_url || '',
      price_from: a.price_from ?? '', sort_order: a.sort_order ?? 0,
      is_published: a.is_published,
    });
    setErr(''); setModal(a);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && modal === 'new' ? { slug: toSlug(value) } : {}),
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) { setErr('Title and slug are required.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = { ...form, price_from: form.price_from || null, sort_order: Number(form.sort_order) || 0 };
      if (modal === 'new') {
        await api.post('/api/admin/activities', payload);
      } else {
        await api.put(`/api/admin/activities/${modal.id}`, payload);
      }
      setModal(null); setReload(r => r + 1);
    } catch (e) {
      setErr(e.response?.data?.error || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    await api.delete(`/api/admin/activities/${id}`);
    setReload(r => r + 1);
  };

  const CATEGORY_COLOURS = {
    Cultural:  'bg-blue-500/15 text-blue-400',
    Wellness:  'bg-green-500/15 text-green-400',
    Adventure: 'bg-orange-500/15 text-orange-400',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>Activities</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-accent text-[#080808] font-semibold px-4 py-2 rounded-full text-sm hover:bg-accent-hover transition-colors">
          <Plus size={15} /> Add activity
        </button>
      </div>

      {loading && <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />)}</div>}

      {!loading && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Price from</th>
                <th className="text-left px-5 py-3">Published</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => (
                <tr key={a.id} className={`${i > 0 ? 'border-t border-border' : ''} hover:bg-surface-alt transition-colors`}>
                  <td className="px-5 py-3 font-medium text-text">{a.title}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLOURS[a.category] || 'bg-surface-alt text-muted'}`}>
                      {a.category || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted hidden sm:table-cell">
                    {a.price_from != null ? `SGD ${Number(a.price_from).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.is_published ? 'bg-green-500/15 text-green-400' : 'bg-surface-alt text-muted'}`}>
                      {a.is_published ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(a)} className="p-1.5 text-muted hover:text-accent transition-colors mr-1"><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 text-muted hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No activities yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-text">{modal === 'new' ? 'Add Activity' : 'Edit Activity'}</h2>
              <button onClick={() => setModal(null)} className="text-muted hover:text-text"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: 'Title',            name: 'title',      type: 'text'   },
                { label: 'Slug',             name: 'slug',       type: 'text'   },
                { label: 'Price from (SGD)', name: 'price_from', type: 'number' },
                { label: 'Sort order',       name: 'sort_order', type: 'number' },
                { label: 'Image URL',        name: 'image_url',  type: 'text'   },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label className="block text-xs text-muted mb-1">{label}</label>
                  <input name={name} type={type} value={form[name]} onChange={handleChange}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-muted mb-1">Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
