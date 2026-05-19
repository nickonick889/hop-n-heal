import { useState } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import api from '../../api/axios';
import { useFetch } from '../../hooks/useFetch';
import { useAdminAuth } from '../../context/AdminAuthContext';

const ROLES = ['super_admin', 'editor', 'viewer'];

const EMPTY_NEW  = { full_name: '', email: '', password: '', role: 'editor' };
const EMPTY_EDIT = { full_name: '', role: 'editor', is_active: true };

export default function AdminUsersPage() {
  const { admin: currentAdmin } = useAdminAuth();
  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  const [reload, setReload] = useState(0);
  const { data, loading } = useFetch(`/api/admin/users?_=${reload}`);
  const users = data?.users || [];

  const [modal,  setModal]  = useState(null); // null | 'new' | user object
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const openNew = () => { setForm(EMPTY_NEW); setErr(''); setModal('new'); };
  const openEdit = (u) => {
    setForm({ full_name: u.full_name, role: u.role, is_active: u.is_active });
    setErr(''); setModal(u);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      if (modal === 'new') {
        if (!form.full_name || !form.email || !form.password) { setErr('All fields required.'); setSaving(false); return; }
        await api.post('/api/admin/users', form);
      } else {
        if (!form.full_name) { setErr('Name is required.'); setSaving(false); return; }
        await api.put(`/api/admin/users/${modal.id}`, form);
      }
      setModal(null); setReload(r => r + 1);
    } catch (e) {
      setErr(e.response?.data?.error || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>Admin Users</h1>
        {isSuperAdmin && (
          <button onClick={openNew} className="flex items-center gap-2 bg-accent text-[#080808] font-semibold px-4 py-2 rounded-full text-sm hover:bg-accent-hover transition-colors">
            <Plus size={15} /> Add user
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <p className="text-xs text-muted mb-4">Only super admins can add or deactivate users.</p>
      )}

      {loading && <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />)}</div>}

      {!loading && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Active</th>
                {isSuperAdmin && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={`${i > 0 ? 'border-t border-border' : ''} hover:bg-surface-alt transition-colors`}>
                  <td className="px-5 py-3 font-medium text-text">{u.full_name}</td>
                  <td className="px-5 py-3 text-muted hidden md:table-cell">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-surface-alt border border-border text-muted px-2 py-0.5 rounded-full capitalize">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-muted hover:text-accent transition-colors"><Pencil size={13} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No admin users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-text">{modal === 'new' ? 'Add Admin User' : 'Edit Admin User'}</h2>
              <button onClick={() => setModal(null)} className="text-muted hover:text-text"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Full name</label>
                <input name="full_name" type="text" value={form.full_name} onChange={handleChange}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors" />
              </div>
              {modal === 'new' && (
                <>
                  <div>
                    <label className="block text-xs text-muted mb-1">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange}
                      className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs text-muted mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors">
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>
              {modal !== 'new' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="accent-accent" />
                  <span className="text-sm text-text">Active</span>
                </label>
              )}
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
