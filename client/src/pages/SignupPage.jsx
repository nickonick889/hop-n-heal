import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', country: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent";

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="font-display text-2xl text-text mb-10" style={{ fontFamily: "'DM Serif Display', serif" }}>
        Hop & Heal
      </Link>

      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8">
        <h1 className="text-xl font-semibold text-text mb-1">Create your account</h1>
        <p className="text-sm text-muted mb-6">Free — no credit card required</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Full name</label>
            <input type="text" required autoFocus value={form.full_name} onChange={set('full_name')} placeholder="Jane Smith" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Password</label>
            <input type="password" required value={form.password} onChange={set('password')} placeholder="Min. 8 characters" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Phone <span className="normal-case text-muted-dark">(optional)</span></label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+60 12 345 6789" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Country <span className="normal-case text-muted-dark">(optional)</span></label>
            <input type="text" value={form.country} onChange={set('country')} placeholder="Malaysia" className={inp} />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-accent text-[#080808] font-semibold py-3 rounded-full text-sm hover:bg-accent-hover transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-muted text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
