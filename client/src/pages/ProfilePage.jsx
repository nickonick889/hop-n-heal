import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ProfilePage() {
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone:     user?.phone    || '',
    country:   user?.country  || '',
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { setError('Full name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.put('/api/auth/profile', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-lg mx-auto px-6 pt-28 pb-24">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition-colors mb-8">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-2">Account</p>
          <h1 className="text-3xl md:text-4xl text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>My Profile</h1>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          {/* Email — read only */}
          <div className="mb-6">
            <label className="block text-xs text-muted mb-1.5">Email address</label>
            <p className="text-sm text-text bg-surface-alt border border-border rounded-xl px-4 py-3">{user?.email}</p>
            <p className="text-xs text-muted-dark mt-1">Email cannot be changed.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs text-muted mb-1.5" htmlFor="full_name">Full name</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1.5" htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+65 9123 4567"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1.5" htmlFor="country">Country</label>
              <input
                id="country"
                name="country"
                type="text"
                value={form.country}
                onChange={handleChange}
                placeholder="e.g. Indonesia"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error   && <p className="text-xs text-red-400">{error}</p>}
            {success && <p className="text-xs text-green-400">Profile updated successfully.</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-accent text-[#080808] font-semibold py-3 rounded-full text-sm hover:bg-accent-hover disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
